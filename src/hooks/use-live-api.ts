/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { GenAILiveClient } from '@/lib/api/genai-live-client';
import { type LiveConnectConfig, type LiveServerToolCall } from '@google/genai';
import { fetchLiveToken, type AuthenticationError } from '@/lib/api/token-service';
import { isAuthenticationError } from '@/lib/api/auth-fetch';
import { AudioStreamer } from '@/lib/audio/audio-streamer';
import { audioContext } from '@/lib/utils';
import VolMeterWorket from '@/lib/worklets/vol-meter';
import { useLogStore, useMapStore, useSettings } from '@/stores';
import {
  type GenerateContentResponse,
  type GroundingChunk,
  type FunctionResponse,
} from '@google/genai';
import { type ToolContext, toolRegistry } from '@/lib/tools/tool-registry';
import { useVoiceTracing } from './use-voice-tracing';

export interface UseLiveApiResults {
  client: GenAILiveClient | null;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;
  audioStreamer: RefObject<AudioStreamer | null>;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
  heldGroundingChunks: GroundingChunk[] | undefined;
  clearHeldGroundingChunks: () => void;
  heldGroundedResponse: GenerateContentResponse | undefined;
  clearHeldGroundedResponse: () => void;

  /** Authentication error if session expired during token fetch */
  authError: AuthenticationError | null;
  /** Clear the current auth error */
  clearAuthError: () => void;
}

export function useLiveApi({
  map,
  placesLib,
  elevationLib,
  geocoder,
  padding,
}: {
  map: google.maps.maps3d.Map3DElement | null;
  placesLib: google.maps.PlacesLibrary | null;
  elevationLib: google.maps.ElevationLibrary | null;
  geocoder: google.maps.Geocoder | null;
  padding: [number, number, number, number];
}): UseLiveApiResults {
  const { model } = useSettings();
  // Client is created on-demand when connecting with a fresh ephemeral token
  const clientRef = useRef<GenAILiveClient | null>(null);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  // Voice tracing for Langfuse observability
  const {
    startSession: startTracingSession,
    recordTurnStart,
    recordTurnComplete,
    recordToolCall,
    recordToolResult,
    endSession: endTracingSession,
  } = useVoiceTracing();

  // Turn tracking for tracing
  const turnNumberRef = useRef(0);
  const turnStartTimeRef = useRef<number>(0);
  const currentUserTranscriptRef = useRef<string>('');
  const currentAiTranscriptRef = useRef<string>('');

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [heldGroundingChunks, setHeldGroundingChunks] = useState<GroundingChunk[] | undefined>(
    undefined
  );
  const [heldGroundedResponse, setHeldGroundedResponse] = useState<
    GenerateContentResponse | undefined
  >(undefined);
  const [authError, setAuthError] = useState<AuthenticationError | null>(null);

  const clearHeldGroundingChunks = useCallback(() => {
    setHeldGroundingChunks(undefined);
  }, []);

  const clearHeldGroundedResponse = useCallback(() => {
    setHeldGroundedResponse(undefined);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Store cleanup function for event listeners
  const cleanupListenersRef = useRef<(() => void) | null>(null);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      void audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet('vumeter-out', VolMeterWorket, (ev: MessageEvent<{ volume: number }>) => {
            setVolume(ev.data.volume);
          })
          .catch((err: unknown) => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, []);

  /**
   * Sets up event listeners on the client. Called when a new client is created during connect().
   * Returns a cleanup function to remove the listeners.
   */
  const setupClientListeners = useCallback(
    (client: GenAILiveClient): (() => void) => {
      const onOpen = () => {
        setConnected(true);
      };

      const onSetupComplete = () => {
        // Send the initial message once the connection is confirmed open and setup is complete.
        client.sendRealtimeText('hello');
      };

      const stopAudioStreamer = () => {
        if (audioStreamerRef.current) {
          audioStreamerRef.current.stop();
        }
      };

      const onClose = (event: CloseEvent) => {
        setConnected(false);
        stopAudioStreamer();

        // End tracing session
        void endTracingSession(event.reason.includes('error') ? 'error' : 'user_disconnect');

        const reason = "Session ended. Press 'Play' to start a new session. " + event.reason;
        useLogStore.getState().addTurn({
          role: 'agent',
          text: reason,
          isFinal: true,
        });
      };

      const onInterrupted = () => {
        stopAudioStreamer();
        const { updateLastTurn, turns } = useLogStore.getState();
        const lastTurn = turns[turns.length - 1];
        if (lastTurn && !lastTurn.isFinal) {
          updateLastTurn({ isFinal: true });
        }
      };

      // Handle input transcription (user speaking) for tracing
      const onInputTranscription = (text: string, isFinal: boolean) => {
        if (isFinal && text.trim()) {
          // New turn started with user speech
          turnNumberRef.current += 1;
          turnStartTimeRef.current = Date.now();
          currentUserTranscriptRef.current = text;
          currentAiTranscriptRef.current = '';
          recordTurnStart(turnNumberRef.current, text);
        }
      };

      // Handle output transcription (AI speaking) for tracing
      const onOutputTranscription = (text: string, isFinal: boolean) => {
        if (isFinal && text.trim()) {
          currentAiTranscriptRef.current = text;
        }
      };

      // Handle turn complete for tracing
      const onTurnComplete = () => {
        if (turnNumberRef.current > 0 && turnStartTimeRef.current > 0) {
          const durationMs = Date.now() - turnStartTimeRef.current;
          recordTurnComplete(turnNumberRef.current, currentAiTranscriptRef.current, durationMs);
        }
      };

      const onAudio = (data: ArrayBuffer) => {
        if (audioStreamerRef.current) {
          audioStreamerRef.current.addPCM16(new Uint8Array(data));
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Placeholder for future implementation
      const onGenerationComplete = () => {};

      /**
       * Handles incoming `toolcall` events from the Gemini Live API. This function
       * acts as the central dispatcher for all function calls requested by the model.
       */
      const onToolCall = async (toolCall: LiveServerToolCall) => {
        useLogStore.getState().setIsAwaitingFunctionResponse(true);
        try {
          const functionResponses: FunctionResponse[] = [];
          const toolContext: ToolContext = {
            map,
            placesLib,
            elevationLib,
            geocoder,
            padding,
            setHeldGroundedResponse,
            setHeldGroundingChunks,
          };

          const functionCalls = toolCall.functionCalls ?? [];
          for (const fc of functionCalls) {
            // Log the function call trigger
            const fcName = fc.name ?? 'unknown';
            const triggerMessage = `Triggering function call: **${fcName}**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
            useLogStore.getState().addTurn({
              role: 'system',
              text: triggerMessage,
              isFinal: true,
            });

            // Record tool call for tracing
            const toolStartTime = Date.now();
            recordToolCall(
              turnNumberRef.current,
              fcName,
              (fc.args ?? {}) as unknown as Record<string, unknown>
            );

            let toolResponse: GenerateContentResponse | string = 'ok';
            try {
              const toolImplementation = fcName ? toolRegistry[fcName] : undefined;
              if (toolImplementation) {
                toolResponse = await toolImplementation(fc.args ?? {}, toolContext);
              } else {
                toolResponse = `Unknown tool called: ${fcName}.`;
              }

              // Record tool result for tracing
              const toolDuration = Date.now() - toolStartTime;
              recordToolResult(turnNumberRef.current, fcName, toolResponse, toolDuration);

              // Prepare the response to send back to the model
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: { result: toolResponse },
              });
            } catch (error) {
              const errorMessage = `Error executing tool ${fcName}.`;
              console.error(errorMessage, error);

              // Record tool error for tracing
              const toolDuration = Date.now() - toolStartTime;
              recordToolResult(
                turnNumberRef.current,
                fcName,
                { error: errorMessage },
                toolDuration
              );

              // Log error to UI
              useLogStore.getState().addTurn({
                role: 'system',
                text: errorMessage,
                isFinal: true,
              });
              // Inform the model about the failure
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: { result: errorMessage },
              });
            }
          }

          // Log the function call response
          if (functionResponses.length > 0) {
            const responseMessage = `Function call response:\n\`\`\`json\n${JSON.stringify(
              functionResponses,
              null,
              2
            )}\n\`\`\``;
            useLogStore.getState().addTurn({
              role: 'system',
              text: responseMessage,
              isFinal: true,
            });
          }

          client.sendToolResponse({ functionResponses: functionResponses });
        } finally {
          useLogStore.getState().setIsAwaitingFunctionResponse(false);
        }
      };

      // Wrap the async handler to handle promise properly
      const onToolCallWrapper = (toolCall: LiveServerToolCall) => {
        void onToolCall(toolCall);
      };

      // Bind event listeners
      client.on('open', onOpen);
      client.on('setupcomplete', onSetupComplete);
      client.on('close', onClose);
      client.on('interrupted', onInterrupted);
      client.on('audio', onAudio);
      client.on('generationcomplete', onGenerationComplete);
      client.on('toolcall', onToolCallWrapper);
      client.on('inputTranscription', onInputTranscription);
      client.on('outputTranscription', onOutputTranscription);
      client.on('turncomplete', onTurnComplete);

      // Return cleanup function
      return () => {
        client.off('open', onOpen);
        client.off('setupcomplete', onSetupComplete);
        client.off('close', onClose);
        client.off('interrupted', onInterrupted);
        client.off('audio', onAudio);
        client.off('toolcall', onToolCallWrapper);
        client.off('generationcomplete', onGenerationComplete);
        client.off('inputTranscription', onInputTranscription);
        client.off('outputTranscription', onOutputTranscription);
        client.off('turncomplete', onTurnComplete);
      };
    },
    [
      map,
      placesLib,
      elevationLib,
      geocoder,
      padding,
      setHeldGroundedResponse,
      setHeldGroundingChunks,
      recordTurnStart,
      recordTurnComplete,
      recordToolCall,
      recordToolResult,
      endTracingSession,
    ]
  );

  const connect = useCallback(async () => {
    useLogStore.getState().clearTurns();
    useMapStore.getState().clearMarkers();
    // Clear any previous auth errors
    setAuthError(null);

    // Reset turn tracking for new session
    turnNumberRef.current = 0;
    turnStartTimeRef.current = 0;
    currentUserTranscriptRef.current = '';
    currentAiTranscriptRef.current = '';

    // Clean up previous client if exists
    if (cleanupListenersRef.current) {
      cleanupListenersRef.current();
      cleanupListenersRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.disconnect();
    }

    try {
      // Fetch a fresh ephemeral token from the backend
      const { token, sessionId } = await fetchLiveToken();

      // Start tracing session
      startTracingSession(sessionId);

      // Create a new client with the ephemeral token
      const newClient = new GenAILiveClient(token, model);
      clientRef.current = newClient;

      // Set up event listeners and store cleanup function
      cleanupListenersRef.current = setupClientListeners(newClient);

      // Connect to the Live API
      await newClient.connect(config);
    } catch (error) {
      // Handle authentication errors specifically
      if (isAuthenticationError(error)) {
        setAuthError(error);
        // Log the auth error to the UI
        useLogStore.getState().addTurn({
          role: 'system',
          text: 'Session expired. Please sign in again to continue.',
          isFinal: true,
        });
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }, [config, model, setupClientListeners, startTracingSession]);

  const disconnect = useCallback(() => {
    if (cleanupListenersRef.current) {
      cleanupListenersRef.current();
      cleanupListenersRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    setConnected(false);
  }, []);

  return {
    client: clientRef.current,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
    heldGroundingChunks,
    clearHeldGroundingChunks,
    heldGroundedResponse,
    clearHeldGroundedResponse,
    audioStreamer: audioStreamerRef,
    authError,
    clearAuthError,
  };
}
