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

import { cn } from '@/lib/utils';
import React, { memo, useEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { motion } from 'framer-motion';
import { AudioRecorder } from '@/lib/audio/audio-recorder';
import { useLogStore, useUI, useSettings } from '@/stores';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { buttonTap } from '@/lib/animations';
import { Button } from '@/components/ui/button';

// Hook to detect screen size for responsive component rendering
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    // Initialize with actual value to avoid hydration mismatch
    return typeof window !== 'undefined' && window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => {
      setMatches(media.matches);
    };
    // Set initial value and listen for changes
    listener();
    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export interface ControlTrayProps {
  trayRef?: Ref<HTMLElement>;
}

function ControlTray({ trayRef }: ControlTrayProps) {
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(true);
  const [textPrompt, setTextPrompt] = useState('');
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const { toggleSidebar } = useUI();
  const { activateEasterEggMode } = useSettings();
  const settingsClickTimestamps = useRef<number[]>([]);
  const isMobile = useMediaQuery(
    '(max-width: 768px), (orientation: landscape) and (max-height: 768px)'
  );
  const [isTextEntryVisible, setIsTextEntryVisible] = useState(false);
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 768px)');

  const { client, connected, connect, disconnect, audioStreamer } = useLiveAPIContext();

  useEffect(() => {
    /* eslint-disable react-hooks/immutability -- Web Audio API gain.value must be modified directly */
    if (audioStreamer.current) {
      audioStreamer.current.gainNode.gain.value = speakerMuted ? 0 : 1;
    }
    /* eslint-enable react-hooks/immutability */
  }, [speakerMuted, audioStreamer]);

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      if (client) {
        client.sendRealtimeInput([
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64,
          },
        ]);
      }
    };

    if (connected && !muted) {
      audioRecorder.on('data', onData);
      void audioRecorder.start();
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

  const handleTextSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    useLogStore.getState().addTurn({
      role: 'user',
      text: textPrompt,
      isFinal: true,
    });
    const currentPrompt = textPrompt;
    setTextPrompt(''); // Clear input immediately

    if (!connected || !client) {
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
      <nav
        className={cn('actions-nav', {
          'text-entry-visible-landscape': isLandscape && isTextEntryVisible,
        })}
      >
        <motion.button
          ref={connectButtonRef}
          className={cn('action-button connect-toggle', { connected })}
          onClick={connected ? disconnect : connect}
          title={connectButtonTitle}
          {...buttonTap}
        >
          <span className="material-symbols-outlined filled">
            {connected ? 'pause' : 'play_arrow'}
          </span>
        </motion.button>
        <motion.button
          type="button"
          aria-label={!speakerMuted ? 'Audio output on' : 'Audio output off'}
          className={cn('action-button', {
            'speaker-on': !speakerMuted,
            'speaker-off': speakerMuted,
          })}
          onClick={() => {
            setSpeakerMuted(!speakerMuted);
          }}
          title={!speakerMuted ? 'Mute audio output' : 'Unmute audio output'}
          {...buttonTap}
        >
          <span className="material-symbols-outlined">
            {!speakerMuted ? 'volume_up' : 'volume_off'}
          </span>
        </motion.button>
        <motion.button
          className={cn('action-button mic-button', {
            'mic-on': !muted,
            'mic-off': muted,
          })}
          onClick={handleMicClick}
          title={micButtonTitle}
          {...buttonTap}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </motion.button>
        <motion.button
          className={cn('action-button keyboard-toggle-button')}
          onClick={() => {
            setIsTextEntryVisible(!isTextEntryVisible);
          }}
          title="Toggle text input"
          {...buttonTap}
        >
          <span className="icon">{isTextEntryVisible ? 'keyboard_hide' : 'keyboard'}</span>
        </motion.button>
        {(!isMobile || isTextEntryVisible) && (
          <form className="prompt-form" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="prompt-input"
              placeholder={connected ? 'Type a message...' : 'Connect to start typing...'}
              value={textPrompt}
              onChange={e => {
                setTextPrompt(e.target.value);
              }}
              aria-label="Text prompt"
              disabled={!connected}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="send-button"
              disabled={!textPrompt.trim() || !connected}
              aria-label="Send message"
            >
              <span className="icon">send</span>
            </Button>
          </form>
        )}
        <motion.button
          className={cn('action-button')}
          onClick={handleSettingsClick}
          title="Settings"
          aria-label="Settings"
          {...buttonTap}
        >
          <span className="icon">tune</span>
        </motion.button>
      </nav>
    </section>
  );
}

export default memo(ControlTray);
