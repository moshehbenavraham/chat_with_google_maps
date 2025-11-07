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

import cn from 'classnames';
// FIX: Added missing React imports.
import React, { memo, useEffect, useRef, useState, FormEvent, Ref } from 'react';
import { AudioRecorder } from '../lib/audio-recorder';
import { useLogStore, useUI, useSettings } from '@/lib/state';

import { useLiveAPIContext } from '../contexts/LiveAPIContext';

// Hook to detect screen size for responsive component rendering
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export type ControlTrayProps = {
  trayRef?: Ref<HTMLElement>;
};

function ControlTray({trayRef}: ControlTrayProps) {
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(true);
  const [textPrompt, setTextPrompt] = useState('');
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const { toggleSidebar } = useUI();
  const { activateEasterEggMode } = useSettings();
  const settingsClickTimestamps = useRef<number[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px), (orientation: landscape) and (max-height: 768px)');
  const [isTextEntryVisible, setIsTextEntryVisible] = useState(false);
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 768px)');


  const { client, connected, connect, disconnect, audioStreamer } =
    useLiveAPIContext();

  useEffect(() => {
    if (audioStreamer.current) {
      audioStreamer.current.gainNode.gain.value = speakerMuted ? 0 : 1;
    }
  }, [speakerMuted, audioStreamer]);

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  const handleMicClick = () => {
    setMuted(!muted);
  };

  const handleTextSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    useLogStore.getState().addTurn({
      role: 'user',
      text: textPrompt,
      isFinal: true,
    });
    const currentPrompt = textPrompt;
    setTextPrompt(''); // Clear input immediately

    if (!connected) {
      console.warn("Cannot send text message: not connected to live stream.");
      useLogStore.getState().addTurn({
        role: 'system',
        text: `Cannot send message. Please connect to the stream first.`,
        isFinal: true,
      });
      return;
    }
    client.sendRealtimeText(currentPrompt);
  };

  const handleSettingsClick = () => {
    toggleSidebar();

    const now = Date.now();
    settingsClickTimestamps.current.push(now);

    // Filter out clicks older than 3 seconds
    settingsClickTimestamps.current = settingsClickTimestamps.current.filter(
        timestamp => now - timestamp < 3000
    );

    if (settingsClickTimestamps.current.length >= 6) {
        activateEasterEggMode();
        useLogStore.getState().addTurn({
            role: 'system',
            text: "You've unlocked Scavenger Hunt mode!.",
            isFinal: true,
        });
        
        // Reset after triggering
        settingsClickTimestamps.current = [];
    }
  };

  const micButtonTitle = muted ? 'Unmute microphone' : 'Mute microphone';

  const connectButtonTitle = connected ? 'Stop streaming' : 'Start streaming';

  return (
    <section className="control-tray" ref={trayRef}>
      <nav className={cn('actions-nav', { 'text-entry-visible-landscape': isLandscape && isTextEntryVisible })}>
        <button
          ref={connectButtonRef}
          className={cn('action-button connect-toggle', { connected })}
          onClick={connected ? disconnect : connect}
          title={connectButtonTitle}
        >
          <span className="material-symbols-outlined filled">
            {connected ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          type="button"
          aria-label={
            !speakerMuted ? 'Audio output on' : 'Audio output off'
          }
          className={cn('action-button', {
            'speaker-on': !speakerMuted,
            'speaker-off': speakerMuted,
          })}
          onClick={() => setSpeakerMuted(!speakerMuted)}
          title={!speakerMuted ? 'Mute audio output' : 'Unmute audio output'}
        >
          <span className="material-symbols-outlined">
            {!speakerMuted ? 'volume_up' : 'volume_off'}
          </span>
        </button>
        <button
          className={cn('action-button mic-button', {
            'mic-on': !muted,
            'mic-off': muted,
          })}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>
        <button
          className={cn('action-button keyboard-toggle-button')}
          onClick={() => setIsTextEntryVisible(!isTextEntryVisible)}
          title="Toggle text input"
        >
          <span className="icon">
            {isTextEntryVisible ? 'keyboard_hide' : 'keyboard'}
          </span>
        </button>
        {(!isMobile || isTextEntryVisible) && (
          <form className="prompt-form" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="prompt-input"
              placeholder={
                connected ? 'Type a message...' : 'Connect to start typing...'
              }
              value={textPrompt}
              onChange={e => setTextPrompt(e.target.value)}
              aria-label="Text prompt"
              disabled={!connected}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!textPrompt.trim() || !connected}
              aria-label="Send message"
            >
              <span className="icon">send</span>
            </button>
          </form>
        )}
        <button
          className={cn('action-button')}
          onClick={handleSettingsClick}
          title="Settings"
          aria-label="Settings"
        >
          <span className="icon">tune</span>
        </button>
      </nav>
    </section>
  );
}

export default memo(ControlTray);