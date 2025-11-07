/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  LiveCallbacks,
  LiveClientToolResponse,
  LiveConnectConfig,
  LiveServerContent,
  LiveServerMessage,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  Part,
  Session,
  // FIX: Import Blob type to use in sendRealtimeInput method signature.
  Blob,
} from '@google/genai';
import EventEmitter from 'eventemitter3';
import { DEFAULT_LIVE_API_MODEL } from './constants';
import { difference } from 'lodash';
import { base64ToArrayBuffer } from './utils';

/**
 * Represents a single log entry in the system.
 * Used for tracking and displaying system events, messages, and errors.
 */
export interface StreamingLog {
  // Optional count for repeated log entries
  count?: number;
  // Optional additional data associated with the log
  data?: unknown;
  // Timestamp of when the log was created
  date: Date;
  // The log message content
  message: string | object;
  // The type/category of the log entry
  type: string;
}

/**
 * Event types that can be emitted by the MultimodalLiveClient.
 * Each event corresponds to a specific message from GenAI or client state change.
 */
export interface LiveClientEventTypes {
  // Emitted when audio data is received
  audio: (data: ArrayBuffer) => void;
  // Emitted when the connection closes
  close: (event: CloseEvent) => void;
  // Emitted when content is received from the server
  content: (data: LiveServerContent) => void;
  // Emitted when an error occurs
  error: (e: ErrorEvent) => void;
  // Emitted when the server interrupts the current generation
  interrupted: () => void;
  // Emitted for logging events
  log: (log: StreamingLog) => void;
  // Emitted when the connection opens
  open: () => void;
  // Emitted when the initial setup is complete
  setupcomplete: () => void;
  // Emitted when a tool call is received
  toolcall: (toolCall: LiveServerToolCall) => void;
  // Emitted when a tool call is cancelled
  toolcallcancellation: (
    toolcallCancellation: LiveServerToolCallCancellation
  ) => void;
  // Emitted when the current turn is complete
  turncomplete: () => void;
  generationcomplete: () => void;
  inputTranscription: (text: string, isFinal: boolean) => void;
  outputTranscription: (text: string, isFinal: boolean) => void;
}

// FIX: Refactored to use composition over inheritance for EventEmitter to resolve method resolution issues.
export class GenAILiveClient {
  public readonly model: string = DEFAULT_LIVE_API_MODEL;

  // FIX: Use an internal EventEmitter instance
  private emitter = new EventEmitter<LiveClientEventTypes>();

  // FIX: Expose on/off methods
  public on = this.emitter.on.bind(this.emitter);
  public off = this.emitter.off.bind(this.emitter);

  protected readonly client: GoogleGenAI;
  protected session?: Session;

  private _status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  public get status() {
    return this._status;
  }

  /**
   * Creates a new GenAILiveClient instance.
   * @param apiKey - API key for authentication with Google GenAI
   * @param model - Optional model name to override the default model
   */
  constructor(apiKey: string, model?: string) {
    if (model) this.model = model;

    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  public async connect(config: LiveConnectConfig): Promise<boolean> {
    // console.log(`attempting to connect to live api with config: ${JSON.stringify(config, null, 2)}`);
    if (this._status === 'connected' || this._status === 'connecting') {
      return false;
    }

    this._status = 'connecting';
    const callbacks: LiveCallbacks = {
      onopen: this.onOpen.bind(this),
      onmessage: this.onMessage.bind(this),
      onerror: this.onError.bind(this),
      onclose: this.onClose.bind(this),
    };

    try {
      this.session = await this.client.live.connect({
        model: this.model,
        config: {
          ...config,
        },
        callbacks,
      });
    } catch (e: any) {
      console.error('Error connecting to GenAI Live:', e);
      this._status = 'disconnected';
      this.session = undefined;
      const errorEvent = new ErrorEvent('error', {
        error: e,
        message: e?.message || 'Failed to connect.',
      });
      this.onError(errorEvent);
      return false;
    }

    this._status = 'connected';
    return true;
  }

  public disconnect() {
    this.session?.close();
    this.session = undefined;
    this._status = 'disconnected';

    this.log('client.close', `Disconnected`);
    return true;
  }

  public send(parts: Part | Part[], turnComplete: boolean = true) {
    if (this._status !== 'connected' || !this.session) {
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('error', new ErrorEvent('Client is not connected'));
      return;
    }
    this.session.sendClientContent({ turns: parts, turnComplete });
    this.log(`client.send`, parts);
  }

  public sendRealtimeText(text: string) {
    if (this._status !== 'connected' || !this.session) {
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('error', new ErrorEvent('Client is not connected'));
      console.error(`sendRealtimeText: Client is not connected, for message: ${text}`)
      return;
    }
    this.session.sendRealtimeInput({ text });
    this.log(`client.send`, text);
  }

  // FIX: Changed parameter type to Array<Blob> to align with the GenAI SDK.
  public sendRealtimeInput(chunks: Array<Blob>) {
    if (this._status !== 'connected' || !this.session) {
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('error', new ErrorEvent('Client is not connected'));
      return;
    }
    
    chunks.forEach(chunk => {
      this.session!.sendRealtimeInput({ media: chunk });
    });

    let hasAudio = false;
    let hasVideo = false;
    for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i];
      // FIX: Added optional chaining because mimeType is optional on Blob type.
      if (ch.mimeType?.includes('audio')) hasAudio = true;
      if (ch.mimeType?.includes('image')) hasVideo = true;
      if (hasAudio && hasVideo) break;
    }
    let message = 'unknown';
    if (hasAudio && hasVideo) message = 'audio + video';
    else if (hasAudio) message = 'audio';
    else if (hasVideo) message = 'video';
    this.log(`client.realtimeInput`, message);

  }

  public sendToolResponse(toolResponse: LiveClientToolResponse) {
    if (this._status !== 'connected' || !this.session) {
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('error', new ErrorEvent('Client is not connected'));
      return;
    }
    if (
      toolResponse.functionResponses &&
      toolResponse.functionResponses.length
    ) {
      this.session.sendToolResponse({
        functionResponses: toolResponse.functionResponses!,
      });
    }

    this.log(`client.toolResponse`, { toolResponse });
  }

  protected onMessage(message: LiveServerMessage) {
    if (message.setupComplete) {
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('setupcomplete');
      return;
    }
    if (message.toolCall) {
      this.log('server.toolCall', message);
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('toolcall', message.toolCall);
      return;
    }
    if (message.toolCallCancellation) {
      this.log('receive.toolCallCancellation', message);
      // FIX: Changed this.emit to this.emitter.emit
      this.emitter.emit('toolcallcancellation', message.toolCallCancellation);
      return;
    }

    if (message.serverContent) {
      const { serverContent } = message;
      if (serverContent.interrupted) {
        this.log('receive.serverContent', 'interrupted');
        // FIX: Changed this.emit to this.emitter.emit
        this.emitter.emit('interrupted');
        return;
      }

      if (serverContent.inputTranscription) {
        // FIX: Changed this.emit to this.emitter.emit
        this.emitter.emit(
          'inputTranscription',
          serverContent.inputTranscription.text,
          // FIX: Property 'isFinal' does not exist on type 'Transcription'.
          (serverContent.inputTranscription as any).isFinal ?? false,
        );
        this.log(
          'server.inputTranscription',
          serverContent.inputTranscription.text,
        );
      }

      if (serverContent.outputTranscription) {
        // FIX: Changed this.emit to this.emitter.emit
        this.emitter.emit(
          'outputTranscription',
          serverContent.outputTranscription.text,
          // FIX: Property 'isFinal' does not exist on type 'Transcription'.
          (serverContent.outputTranscription as any).isFinal ?? false,
        );
        this.log(
          'server.outputTranscription',
          serverContent.outputTranscription.text,
        );
      }

      if (serverContent.modelTurn) {
        let parts: Part[] = serverContent.modelTurn.parts || [];

        const audioParts = parts.filter(p =>
          p.inlineData?.mimeType?.startsWith('audio/pcm'),
        );
        const base64s = audioParts.map(p => p.inlineData?.data);
        const otherParts = difference(parts, audioParts);

        base64s.forEach(b64 => {
          if (b64) {
            const data = base64ToArrayBuffer(b64);
            // FIX: Changed this.emit to this.emitter.emit
            // FIX: Cast ArrayBufferLike to ArrayBuffer to resolve type mismatch.
            this.emitter.emit('audio', data as ArrayBuffer);
            this.log(`server.audio`, `buffer (${data.byteLength})`);
          }
        });

        if (otherParts.length > 0) {
          const content: LiveServerContent = { modelTurn: { parts: otherParts } };
          // FIX: Changed this.emit to this.emitter.emit
          this.emitter.emit('content', content);
          this.log(`server.content`, message);
        }
      }

      if (serverContent.turnComplete) {
        this.log('server.send', 'turnComplete');
        // FIX: Changed this.emit to this.emitter.emit
        this.emitter.emit('turncomplete');
      }

      if ((serverContent as any).generationComplete) {
        this.log('server.send', 'generationComplete');
        this.emitter.emit('generationcomplete');
      }
    }
  }

  protected onError(e: ErrorEvent) {
    this._status = 'disconnected';
    console.error('error:', e);

    const message = `Could not connect to GenAI Live: ${e.message}`;
    this.log(`server.${e.type}`, message);
    // FIX: Changed this.emit to this.emitter.emit
    this.emitter.emit('error', e);
  }

  protected onOpen() {
    this._status = 'connected';
    // FIX: Changed this.emit to this.emitter.emit
    this.emitter.emit('open');
  }

  protected onClose(e: CloseEvent) {
    this._status = 'disconnected';
    let reason = e.reason || '';
    if (reason.toLowerCase().includes('error')) {
      const prelude = 'ERROR]';
      const preludeIndex = reason.indexOf(prelude);
      if (preludeIndex > 0) {
        reason = reason.slice(preludeIndex + prelude.length + 1, Infinity);
      }
    }

    this.log(
      `server.${e.type}`,
      `disconnected ${reason ? `with reason: ${reason}` : ``}`
    );
    // FIX: Changed this.emit to this.emitter.emit
    this.emitter.emit('close', e);
  }

  /**
   * Internal method to emit a log event.
   * @param type - Log type
   * @param message - Log message
   */
  protected log(type: string, message: string | object) {
    // FIX: Changed this.emit to this.emitter.emit
    this.emitter.emit('log', {
      type,
      message,
      date: new Date(),
    });
  }
}