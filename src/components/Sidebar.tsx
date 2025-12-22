/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useMemo } from 'react';
import { useSettings, useUI, useLogStore, useTools, useMapStore, personas } from '@/stores';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import {
  AVAILABLE_VOICES_FULL,
  AVAILABLE_VOICES_LIMITED,
  MODELS_WITH_LIMITED_VOICES,
  DEFAULT_VOICE,
  AVAILABLE_LIVE_MODELS,
} from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, showSystemMessages, toggleShowSystemMessages } = useUI();
  const {
    systemPrompt,
    model,
    voice,
    setSystemPrompt,
    setModel,
    setVoice,
    isEasterEggMode,
    activePersona,
    setPersona,
  } = useSettings();
  const { connected } = useLiveAPIContext();

  const availableVoices = useMemo(() => {
    return MODELS_WITH_LIMITED_VOICES.includes(model)
      ? AVAILABLE_VOICES_LIMITED
      : AVAILABLE_VOICES_FULL;
  }, [model]);

  useEffect(() => {
    if (!availableVoices.some(v => v.name === voice)) {
      setVoice(DEFAULT_VOICE);
    }
  }, [availableVoices, voice, setVoice]);

  const handleResetSession = () => {
    useLogStore.getState().clearTurns();
    useMapStore.getState().clearMarkers();
  };

  const handleExportLogs = () => {
    const { systemPrompt, model } = useSettings.getState();
    const { tools } = useTools.getState();
    const { turns } = useLogStore.getState();

    const logData = {
      configuration: {
        model,
        systemPrompt,
      },
      tools,
      conversation: turns.map(turn => ({
        ...turn,
        // Convert Date object to ISO string for JSON serialization
        timestamp: turn.timestamp.toISOString(),
      })),
    };

    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `live-api-logs-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet
      open={isSidebarOpen}
      onOpenChange={() => {
        toggleSidebar();
      }}
    >
      <SheetContent
        side="right"
        className="w-[380px] max-w-full bg-[var(--gray-900)] border-l border-[var(--gray-800)] flex flex-col"
      >
        <SheetHeader className="border-b border-[var(--gray-800)] pb-5">
          <SheetTitle className="text-xl text-[var(--text)]">Settings</SheetTitle>
        </SheetHeader>
        <div className="sidebar-content flex-1 overflow-y-auto p-5 flex flex-col gap-8">
          <div className="sidebar-section flex flex-col gap-4">
            <fieldset disabled={connected} className="border-none p-0 m-0 flex flex-col gap-4">
              {isEasterEggMode && (
                <label className="flex flex-col gap-2 text-sm text-[var(--gray-300)]">
                  Persona
                  <select
                    value={activePersona}
                    onChange={e => {
                      setPersona(e.target.value);
                    }}
                    className="w-full appearance-none border border-[var(--gray-700)] rounded-lg p-3 text-sm bg-[var(--gray-1000)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-blue-active)] focus:shadow-[0_0_0_2px_var(--accent-blue-active-bg)]"
                  >
                    {Object.keys(personas).map(personaName => (
                      <option key={personaName} value={personaName}>
                        {personaName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-2 text-sm text-[var(--gray-300)]">
                System Prompt
                <textarea
                  value={systemPrompt}
                  onChange={e => {
                    setSystemPrompt(e.target.value);
                  }}
                  rows={10}
                  placeholder="Describe the role and personality of the AI..."
                  disabled={isEasterEggMode}
                  className="border border-[var(--gray-700)] rounded-lg p-3 text-sm bg-[var(--gray-1000)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-blue-active)] focus:shadow-[0_0_0_2px_var(--accent-blue-active-bg)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-[var(--gray-300)]">
                Model
                <select
                  value={model}
                  onChange={e => {
                    setModel(e.target.value);
                  }}
                  className="w-full appearance-none border border-[var(--gray-700)] rounded-lg p-3 text-sm bg-[var(--gray-1000)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-blue-active)] focus:shadow-[0_0_0_2px_var(--accent-blue-active-bg)]"
                >
                  {AVAILABLE_LIVE_MODELS.map(m => (
                    <option key={m.id} value={m.id} title={m.description}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-[var(--gray-300)]">
                Voice
                <select
                  value={voice}
                  onChange={e => {
                    setVoice(e.target.value);
                  }}
                  className="w-full appearance-none border border-[var(--gray-700)] rounded-lg p-3 text-sm bg-[var(--gray-1000)] text-[var(--text)] focus:outline-none focus:border-[var(--accent-blue-active)] focus:shadow-[0_0_0_2px_var(--accent-blue-active-bg)]"
                >
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.description})
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
            <div className="settings-toggle-item flex items-center gap-3 py-2 px-1">
              <label className="tool-checkbox-wrapper">
                <input
                  type="checkbox"
                  id="system-message-toggle"
                  checked={showSystemMessages}
                  onChange={toggleShowSystemMessages}
                />
                <span className="checkbox-visual"></span>
              </label>
              <label
                htmlFor="system-message-toggle"
                className="text-sm text-[var(--gray-200)] cursor-pointer flex-grow select-none"
              >
                Show system messages
              </label>
            </div>
          </div>
          <div className="sidebar-actions flex gap-3 mt-auto pt-5 border-t border-[var(--gray-800)]">
            <Button
              variant="secondary"
              onClick={handleExportLogs}
              title="Export session logs"
              className="flex-1 p-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-[var(--gray-800)] text-[var(--gray-200)] hover:bg-[var(--gray-700)] text-sm"
            >
              <Download className="w-5 h-5" />
              Export Logs
            </Button>
            <Button
              variant="secondary"
              onClick={handleResetSession}
              title="Reset session logs"
              className="flex-1 p-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-[var(--gray-800)] text-[var(--gray-200)] hover:bg-[var(--gray-700)] text-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Session
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
