/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo } from 'react';
import { useSettings, useUI, useLogStore, useTools, useMapStore, personas } from '@/stores';
import c from 'classnames';
import {
  AVAILABLE_VOICES_FULL,
  AVAILABLE_VOICES_LIMITED,
  MODELS_WITH_LIMITED_VOICES,
  DEFAULT_VOICE,
  AVAILABLE_LIVE_MODELS,
} from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

export default function Sidebar() {
  const {
    isSidebarOpen,
    toggleSidebar,
    showSystemMessages,
    toggleShowSystemMessages,
  } = useUI();
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
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <fieldset disabled={connected}>
              {isEasterEggMode && (
                <label>
                  Persona
                  <select
                    value={activePersona}
                    onChange={e => { setPersona(e.target.value); }}
                  >
                    {Object.keys(personas).map(personaName => (
                      <option key={personaName} value={personaName}>
                        {personaName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                System Prompt
                <textarea
                  value={systemPrompt}
                  onChange={e => { setSystemPrompt(e.target.value); }}
                  rows={10}
                  placeholder="Describe the role and personality of the AI..."
                  disabled={isEasterEggMode}
                />
              </label>
              <label>
                Model
                <select
                  value={model}
                  onChange={e => { setModel(e.target.value); }}
                >
                  {AVAILABLE_LIVE_MODELS.map(m => (
                    <option key={m.id} value={m.id} title={m.description}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voice
                <select
                  value={voice}
                  onChange={e => { setVoice(e.target.value); }}
                >
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.description})
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
            <div className="settings-toggle-item">
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
                className="settings-toggle-label"
              >
                Show system messages
              </label>
            </div>
          </div>
          <div className="sidebar-actions">
            <button onClick={handleExportLogs} title="Export session logs">
              <span className="icon">download</span>
              Export Logs
            </button>
            <button
              onClick={handleResetSession}
              title="Reset session logs"
            >
              <span className="icon">refresh</span>
              Reset Session
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
