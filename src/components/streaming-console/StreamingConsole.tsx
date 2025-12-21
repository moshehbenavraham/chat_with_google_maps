/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { Modality, type LiveServerContent, type Part } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { useSettings, useLogStore, useTools, type ConversationTurn, useUI } from '@/stores';
import { SourcesPopover } from '@/components/sources-popover/sources-popover';
import { GroundingWidget } from '@/components/GroundingWidget';
import { AnimatedSpinner } from '@/components/ui/AnimatedSpinner';
import { staggerItem, transitions } from '@/lib/animations';

const formatTimestamp = (date: Date) => {
  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// Hook to detect screen size for responsive component rendering
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    return typeof window !== 'undefined' && window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => {
      setMatches(media.matches);
    };
    listener();
    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

export default function StreamingConsole() {
  const {
    client,
    setConfig,
    heldGroundingChunks,
    clearHeldGroundingChunks,
    heldGroundedResponse,
    clearHeldGroundedResponse,
  } = useLiveAPIContext();
  const { systemPrompt, voice } = useSettings();
  const { tools } = useTools();
  const turns = useLogStore(state => state.turns);
  const { showSystemMessages } = useUI();
  const isAwaitingFunctionResponse = useLogStore(state => state.isAwaitingFunctionResponse);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const displayedTurns = showSystemMessages ? turns : turns.filter(turn => turn.role !== 'system');

  // Set the configuration for the Live API
  useEffect(() => {
    const enabledTools = tools
      .filter(tool => tool.isEnabled)
      .map(tool => ({
        functionDeclarations: [
          {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        ],
      }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- speechConfig not in current TS definitions
    const config: Record<string, any> = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      tools: enabledTools,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };

    setConfig(config);
  }, [setConfig, systemPrompt, tools, voice]);

  useEffect(() => {
    if (!client) return;

    const { addTurn, updateLastTurn } = useLogStore.getState();

    const handleInputTranscription = (text: string, isFinal: boolean) => {
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];
      if (last?.role === 'user' && !last.isFinal) {
        updateLastTurn({
          text: last.text + text,
          isFinal,
        });
      } else {
        addTurn({ role: 'user', text, isFinal });
      }
    };

    const handleOutputTranscription = (text: string, isFinal: boolean) => {
      const { turns, updateLastTurn, addTurn, mergeIntoLastAgentTurn } = useLogStore.getState();
      const last = turns[turns.length - 1];

      if (last?.role === 'agent' && !last.isFinal) {
        updateLastTurn({
          text: last.text + text,
          isFinal,
        });
      } else {
        const lastAgentTurnIndex = turns.map(t => t.role).lastIndexOf('agent');
        let shouldMerge = false;
        if (lastAgentTurnIndex !== -1) {
          const subsequentTurns = turns.slice(lastAgentTurnIndex + 1);
          if (subsequentTurns.length > 0 && subsequentTurns.every(t => t.role === 'system')) {
            shouldMerge = true;
          }
        }

        const turnData: Omit<ConversationTurn, 'timestamp' | 'role'> = {
          text,
          isFinal,
        };
        if (heldGroundingChunks) {
          turnData.groundingChunks = heldGroundingChunks;
          clearHeldGroundingChunks();
        }
        if (heldGroundedResponse) {
          turnData.toolResponse = heldGroundedResponse;
          clearHeldGroundedResponse();
        }

        if (shouldMerge) {
          mergeIntoLastAgentTurn(turnData);
        } else {
          addTurn({ ...turnData, role: 'agent' });
        }
      }
    };

    const handleContent = (serverContent: LiveServerContent) => {
      const { turns, updateLastTurn, addTurn, mergeIntoLastAgentTurn } = useLogStore.getState();
      const text =
        serverContent.modelTurn?.parts
          ?.map((p: Part) => p.text)
          .filter(Boolean)
          .join('') ?? '';
      const groundingChunks = serverContent.groundingMetadata?.groundingChunks;

      if (!text && !groundingChunks) return;

      const last = turns[turns.length - 1];

      if (last?.role === 'agent' && !last.isFinal) {
        const updatedTurn: Partial<ConversationTurn> = {
          text: last.text + text,
        };
        if (groundingChunks) {
          updatedTurn.groundingChunks = [...(last.groundingChunks ?? []), ...groundingChunks];
        }
        updateLastTurn(updatedTurn);
      } else {
        const lastAgentTurnIndex = turns.map(t => t.role).lastIndexOf('agent');
        let shouldMerge = false;
        if (lastAgentTurnIndex !== -1) {
          const subsequentTurns = turns.slice(lastAgentTurnIndex + 1);
          if (subsequentTurns.length > 0 && subsequentTurns.every(t => t.role === 'system')) {
            shouldMerge = true;
          }
        }

        const newTurnData: Omit<ConversationTurn, 'timestamp' | 'role'> = {
          text,
          isFinal: false,
          groundingChunks,
        };
        if (heldGroundingChunks) {
          const combinedChunks = [...heldGroundingChunks, ...(newTurnData.groundingChunks ?? [])];
          newTurnData.groundingChunks = combinedChunks;
          clearHeldGroundingChunks();
        }
        if (heldGroundedResponse) {
          newTurnData.toolResponse = heldGroundedResponse;
          clearHeldGroundedResponse();
        }

        if (shouldMerge) {
          mergeIntoLastAgentTurn(newTurnData);
        } else {
          addTurn({ ...newTurnData, role: 'agent' });
        }
      }
    };

    const handleTurnComplete = () => {
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];
      if (last && !last.isFinal) {
        updateLastTurn({ isFinal: true });
      }
    };

    client.on('inputTranscription', handleInputTranscription);
    client.on('outputTranscription', handleOutputTranscription);
    client.on('content', handleContent);
    client.on('turncomplete', handleTurnComplete);
    client.on('generationcomplete', handleTurnComplete);

    return () => {
      client.off('inputTranscription', handleInputTranscription);
      client.off('outputTranscription', handleOutputTranscription);
      client.off('content', handleContent);
      client.off('turncomplete', handleTurnComplete);
      client.off('generationcomplete', handleTurnComplete);
    };
  }, [
    client,
    heldGroundingChunks,
    clearHeldGroundingChunks,
    heldGroundedResponse,
    clearHeldGroundedResponse,
  ]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    // The widget has a 300ms transition for max-height. We need to wait
    // for that transition to finish before we can accurately scroll to the bottom.
    const scrollTimeout = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 350); // A little longer than the transition duration

    return () => {
      clearTimeout(scrollTimeout);
    };
  }, [turns, isAwaitingFunctionResponse]);

  return (
    <div className="transcription-container">
      {displayedTurns.length === 0 && !isAwaitingFunctionResponse ? (
        <div></div>
      ) : (
        <div className="transcription-view" ref={scrollRef}>
          {displayedTurns.map(t => {
            if (t.role === 'system') {
              return (
                <motion.div
                  key={t.timestamp.toISOString()}
                  className={`transcription-entry system`}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={transitions.modalIn}
                >
                  <div className="transcription-header">
                    <div className="transcription-source">System</div>
                    <div className="transcription-timestamp">{formatTimestamp(t.timestamp)}</div>
                  </div>
                  <div className="transcription-text-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.text}</ReactMarkdown>
                  </div>
                </motion.div>
              );
            }
            const widgetToken =
              t.toolResponse?.candidates?.[0]?.groundingMetadata?.googleMapsWidgetContextToken;

            let sources: { uri: string; title: string }[] = [];
            if (t.groundingChunks) {
              sources = t.groundingChunks
                .map(chunk => {
                  const source = chunk.web ?? chunk.maps;
                  if (source?.uri) {
                    return {
                      uri: source.uri,
                      title: source.title ?? source.uri,
                    };
                  }
                  return null;
                })
                .filter((s): s is { uri: string; title: string } => s !== null);

              if (t.groundingChunks.length === 1) {
                const chunk = t.groundingChunks[0];
                if (chunk) {
                  // The type for `placeAnswerSources` might be missing or incomplete. Use type assertion for safety.
                  const mapsData = chunk.maps as
                    | { placeAnswerSources?: { reviewSnippets?: unknown[] } }
                    | undefined;
                  const placeAnswerSources = mapsData?.placeAnswerSources;
                  if (placeAnswerSources && Array.isArray(placeAnswerSources.reviewSnippets)) {
                    const reviewSources = (
                      placeAnswerSources.reviewSnippets as {
                        googleMapsUri?: string;
                        title?: string;
                      }[]
                    )
                      .map(review => {
                        if (review.googleMapsUri && review.title) {
                          return {
                            uri: review.googleMapsUri,
                            title: review.title,
                          };
                        }
                        return null;
                      })
                      .filter((s): s is { uri: string; title: string } => s !== null);
                    sources.push(...reviewSources);
                  }
                }
              }
            }

            const hasSources = sources.length > 0;

            return (
              <motion.div
                key={t.timestamp.toISOString()}
                className={`transcription-entry ${t.role} ${!t.isFinal ? 'interim' : ''}`}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={transitions.modalIn}
              >
                <div className="avatar">
                  <span className="icon">{t.role === 'user' ? 'person' : 'auto_awesome'}</span>
                </div>
                <div className="message-bubble">
                  <div className="transcription-text-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.text}</ReactMarkdown>
                  </div>
                  {hasSources && <SourcesPopover className="grounding-chunks" sources={sources} />}
                  {widgetToken && !isMobile && (
                    <div
                      style={{
                        marginTop: '12px',
                      }}
                    >
                      <GroundingWidget contextToken={widgetToken} mapHidden={true} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          {isAwaitingFunctionResponse && (
            <motion.div
              className="spinner-container"
              variants={staggerItem}
              initial="initial"
              animate="animate"
              transition={transitions.modalIn}
            >
              <AnimatedSpinner size={24} label="Calling tool..." />
              <p>Calling tool...</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
