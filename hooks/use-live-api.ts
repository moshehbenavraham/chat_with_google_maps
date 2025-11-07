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


import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, Modality, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useLogStore, useMapStore, useSettings } from '@/lib/state';
import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { ToolContext, toolRegistry } from '@/lib/tools/tool-registry';


export type UseLiveApiResults = {
 client: GenAILiveClient;
 setConfig: (config: LiveConnectConfig) => void;
 config: LiveConnectConfig;
 audioStreamer: MutableRefObject<AudioStreamer | null>;


 connect: () => Promise<void>;
 disconnect: () => void;
 connected: boolean;


 volume: number;
 heldGroundingChunks: GroundingChunk[] | undefined;
 clearHeldGroundingChunks: () => void;
 heldGroundedResponse: GenerateContentResponse | undefined;
 clearHeldGroundedResponse: () => void;
};


export function useLiveApi({
 apiKey,
 map,
 placesLib,
 elevationLib,
 geocoder,
 padding,
}: {
 apiKey: string;
 map: google.maps.maps3d.Map3DElement | null;
 placesLib: google.maps.PlacesLibrary | null;
 elevationLib: google.maps.ElevationLibrary | null;
 geocoder: google.maps.Geocoder | null;
 padding: [number, number, number, number];
}): UseLiveApiResults {
 const { model } = useSettings();
 const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);


 const audioStreamerRef = useRef<AudioStreamer | null>(null);


 const [volume, setVolume] = useState(0);
 const [connected, setConnected] = useState(false);
 const [streamerReady, setStreamerReady] = useState(false);
 const [config, setConfig] = useState<LiveConnectConfig>({});
 const [heldGroundingChunks, setHeldGroundingChunks] = useState<
    GroundingChunk[] | undefined
  >(undefined);
 const [heldGroundedResponse, setHeldGroundedResponse] = useState<
    GenerateContentResponse | undefined
  >(undefined);

  const clearHeldGroundingChunks = useCallback(() => {
    setHeldGroundingChunks(undefined);
  }, []);

 const clearHeldGroundedResponse = useCallback(() => {
    setHeldGroundedResponse(undefined);
  }, []);

 // register audio for streaming server -> speakers
 useEffect(() => {
   if (!audioStreamerRef.current) {
     audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
       audioStreamerRef.current = new AudioStreamer(audioCtx);
       setStreamerReady(true);
       audioStreamerRef.current
         .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
           setVolume(ev.data.volume);
         })
         .catch(err => {
           console.error('Error adding worklet:', err);
         });
     });
   }
 }, []);

 // This effect sets up the main event listeners for the GenAILiveClient.
 useEffect(() => {
   const onOpen = () => {
     setConnected(true);
   };

   const onSetupComplete = () => {
     // Send the initial message once the connection is confirmed open and setup is complete.
     client.sendRealtimeText('hello');
   };

   const onClose = (event: CloseEvent) => {
     setConnected(false);
     stopAudioStreamer();
     let reason = "Session ended. Press 'Play' to start a new session. "+ event.reason;
     useLogStore.getState().addTurn({
         role: 'agent',
         text: reason,
         isFinal: true,
       });
   };


   const stopAudioStreamer = () => {
     if (audioStreamerRef.current) {
       audioStreamerRef.current.stop();
     }
   };

   const onInterrupted = () => {
    stopAudioStreamer();
    const { updateLastTurn, turns } = useLogStore.getState();
    const lastTurn = turns[turns.length - 1];
    if (lastTurn && !lastTurn.isFinal) {
      updateLastTurn({ isFinal: true });
    }
   };

   const onAudio = (data: ArrayBuffer) => {
     if (audioStreamerRef.current) {
       audioStreamerRef.current.addPCM16(new Uint8Array(data));
     }
   };
   
   const onGenerationComplete = () => {
   };


   // Bind event listeners
   client.on('open', onOpen);
   client.on('setupcomplete', onSetupComplete);
   client.on('close', onClose);
   client.on('interrupted', onInterrupted);
   client.on('audio', onAudio);
   client.on('generationcomplete', onGenerationComplete);

   /**
     * Handles incoming `toolcall` events from the Gemini Live API. This function
     * acts as the central dispatcher for all function calls requested by the model.
     *
     * The process is as follows:
     * 1. Sets a UI state flag (`isAwaitingFunctionResponse`) to show a spinner.
     * 2. Iterates through each function call in the `toolCall` payload.
     * 3. Logs the function call to the system messages for debugging and visibility.
     * 4. Looks up the corresponding tool implementation in the `toolRegistry` by name.
     * 5. Executes the tool's function, passing the model-provided arguments and a
     *    `toolContext` object. This context gives the tool access to shared
     *    resources like the map instance, map libraries, and state setters, without
     *    tightly coupling the tool logic to React components.
     * 6. Packages the tool's return value into a `functionResponse` object.
     * 7. After all function calls are executed, it sends the collected responses
     *    back to the Gemini API using `client.sendToolResponse`. This provides the
     *    model with the information it needs to continue the conversation.
     * 8. Clears the UI spinner state.
     */
   const onToolCall = async (toolCall: LiveServerToolCall) => {
     useLogStore.getState().setIsAwaitingFunctionResponse(true);
     try {
       const functionResponses: any[] = [];
       const toolContext: ToolContext = {
         map,
         placesLib,
         elevationLib,
         geocoder,
         padding,
         setHeldGroundedResponse,
         setHeldGroundingChunks,
       };


       for (const fc of toolCall.functionCalls) {
         // Log the function call trigger
         const triggerMessage = `Triggering function call: **${
           fc.name
         }**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
         useLogStore.getState().addTurn({
           role: 'system',
           text: triggerMessage,
           isFinal: true,
         });


         let toolResponse: GenerateContentResponse | string = 'ok';
         try {
           const toolImplementation = toolRegistry[fc.name];
           if (toolImplementation) {
             toolResponse = await toolImplementation(fc.args, toolContext);
           } else {
             toolResponse = `Unknown tool called: ${fc.name}.`;
             console.warn(toolResponse);
           }


           // Prepare the response to send back to the model
           functionResponses.push({
             id: fc.id,
             name: fc.name,
             response: { result: toolResponse },
           });
         } catch (error) {
           const errorMessage = `Error executing tool ${fc.name}.`;
           console.error(errorMessage, error);
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
           2,
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


   client.on('toolcall', onToolCall);


   return () => {
     // Clean up event listeners
     client.off('open', onOpen);
     client.off('setupcomplete', onSetupComplete);
     client.off('close', onClose);
     client.off('interrupted', onInterrupted);
     client.off('audio', onAudio);
     client.off('toolcall', onToolCall);
     client.off('generationcomplete', onGenerationComplete);
   };
 }, [client, map, placesLib, elevationLib, geocoder, padding, setHeldGroundedResponse, setHeldGroundingChunks]);


 const connect = useCallback(async () => {
   if (!config) {
     throw new Error('config has not been set');
   }
   useLogStore.getState().clearTurns();
   useMapStore.getState().clearMarkers();
   client.disconnect();
   await client.connect(config);
 }, [client, config]);


 const disconnect = useCallback(async () => {
   client.disconnect();
   setConnected(false);
 }, [setConnected, client]);


 return {
   client,
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
 };
}