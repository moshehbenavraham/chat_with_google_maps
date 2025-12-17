/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';
import { itineraryPlannerTools } from '@/lib/tools/itinerary-planner';

export type Template = 'itinerary-planner';

const toolsets: Record<Template, FunctionCall[]> = {
  'itinerary-planner': itineraryPlannerTools,
};

import { itineraryPlannerPrompt, scavengerHuntPrompt } from '@/lib/prompts';

const systemPrompts: Record<Template, string> = {
  'itinerary-planner': itineraryPlannerPrompt.content,
};

import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from '@/lib/constants';
import {
  type GenerateContentResponse,
  type FunctionResponse,
  type FunctionResponseScheduling,
  type LiveServerToolCall,
  type GroundingChunk,
} from '@google/genai';
import { type Map3DCameraProps } from '@/components/map-3d';

/**
 * Personas
 */
export const SCAVENGER_HUNT_PERSONA = 'ClueMaster Cory, the Scavenger Hunt Creator';

export const personas: Record<string, { prompt: string; voice: string }> = {
  [SCAVENGER_HUNT_PERSONA]: {
    prompt: scavengerHuntPrompt.content,
    voice: scavengerHuntPrompt.defaultVoice,
  },
};

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  isEasterEggMode: boolean;
  activePersona: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
  setPersona: (persona: string) => void;
  activateEasterEggMode: () => void;
}>(set => ({
  systemPrompt: systemPrompts['itinerary-planner'],
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  isEasterEggMode: false,
  activePersona: SCAVENGER_HUNT_PERSONA,
  setSystemPrompt: prompt => {
    set({ systemPrompt: prompt });
  },
  setModel: model => {
    set({ model });
  },
  setVoice: voice => {
    set({ voice });
  },
  setPersona: (persona: string) => {
    if (personas[persona]) {
      set({
        activePersona: persona,
        systemPrompt: personas[persona].prompt,
        voice: personas[persona].voice,
      });
    }
  },
  activateEasterEggMode: () => {
    set(state => {
      if (!state.isEasterEggMode) {
        const persona = SCAVENGER_HUNT_PERSONA;
        const personaConfig = personas[persona];
        if (personaConfig) {
          return {
            isEasterEggMode: true,
            activePersona: persona,
            systemPrompt: personaConfig.prompt,
            voice: personaConfig.voice,
            model: DEFAULT_LIVE_API_MODEL,
          };
        }
      }
      return {};
    });
  },
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  showSystemMessages: boolean;
  toggleShowSystemMessages: () => void;
}>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => {
    set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
  showSystemMessages: false,
  toggleShowSystemMessages: () => {
    set(state => ({ showSystemMessages: !state.showSystemMessages }));
  },
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON Schema object, structure varies by tool
  parameters?: Record<string, any>;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export const useTools = create<{
  tools: FunctionCall[];
  template: Template;
  setTemplate: (template: Template) => void;
}>(set => ({
  tools: itineraryPlannerTools,
  template: 'itinerary-planner',
  setTemplate: (template: Template) => {
    set({ tools: toolsets[template], template });
    useSettings.getState().setSystemPrompt(systemPrompts[template]);
  },
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
  toolResponse?: GenerateContentResponse;
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  isAwaitingFunctionResponse: boolean;
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  mergeIntoLastAgentTurn: (update: Omit<ConversationTurn, 'timestamp' | 'role'>) => void;
  clearTurns: () => void;
  setIsAwaitingFunctionResponse: (isAwaiting: boolean) => void;
}>((set, _get) => ({
  turns: [],
  isAwaitingFunctionResponse: false,
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => {
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    }));
  },
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const existingTurn = newTurns[newTurns.length - 1];
      if (existingTurn) {
        const lastTurn = { ...existingTurn, ...update };
        newTurns[newTurns.length - 1] = lastTurn;
      }
      return { turns: newTurns };
    });
  },
  mergeIntoLastAgentTurn: (update: Omit<ConversationTurn, 'timestamp' | 'role'>) => {
    set(state => {
      const turns = state.turns;
      const lastAgentTurnIndex = turns.map(t => t.role).lastIndexOf('agent');

      if (lastAgentTurnIndex === -1) {
        // Fallback: add a new turn.
        return {
          turns: [...turns, { ...update, role: 'agent' as const, timestamp: new Date() }],
        };
      }

      const lastAgentTurn = turns[lastAgentTurnIndex];
      if (!lastAgentTurn) {
        return state;
      }

      const mergedTurn: ConversationTurn = {
        ...lastAgentTurn,
        text: lastAgentTurn.text + update.text,
        isFinal: update.isFinal,
        groundingChunks: [
          ...(lastAgentTurn.groundingChunks ?? []),
          ...(update.groundingChunks ?? []),
        ],
        toolResponse: update.toolResponse ?? lastAgentTurn.toolResponse,
      };

      // Rebuild the turns array, replacing the old agent turn.
      const newTurns = [...turns];
      newTurns[lastAgentTurnIndex] = mergedTurn;

      return { turns: newTurns };
    });
  },
  clearTurns: () => {
    set({ turns: [] });
  },
  setIsAwaitingFunctionResponse: isAwaiting => {
    set({ isAwaitingFunctionResponse: isAwaiting });
  },
}));

/**
 * Map Entities
 */
export interface MapMarker {
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  label: string;
  showLabel: boolean;
}

export const useMapStore = create<{
  markers: MapMarker[];
  cameraTarget: Map3DCameraProps | null;
  preventAutoFrame: boolean;
  setMarkers: (markers: MapMarker[]) => void;
  clearMarkers: () => void;
  setCameraTarget: (target: Map3DCameraProps | null) => void;
  setPreventAutoFrame: (prevent: boolean) => void;
}>(set => ({
  markers: [],
  cameraTarget: null,
  preventAutoFrame: false,
  setMarkers: markers => {
    set({ markers });
  },
  clearMarkers: () => {
    set({ markers: [] });
  },
  setCameraTarget: target => {
    set({ cameraTarget: target });
  },
  setPreventAutoFrame: prevent => {
    set({ preventAutoFrame: prevent });
  },
}));
