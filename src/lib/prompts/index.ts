/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Prompt Registry
 *
 * This module provides a centralized registry of all available system prompts.
 * To add a new prompt:
 * 1. Create a new file in lib/prompts/ (e.g., my-prompt.ts)
 * 2. Export a PromptDefinition object from that file
 * 3. Import and add it to the PROMPTS array below
 */

// Type exports
export type { PromptDefinition } from './types';

// Individual prompt exports
export { itineraryPlannerPrompt } from './itinerary-planner';
export { scavengerHuntPrompt } from './scavenger-hunt';

// Import for registry
import { itineraryPlannerPrompt } from './itinerary-planner';
import { scavengerHuntPrompt } from './scavenger-hunt';
import type { PromptDefinition } from './types';

/**
 * Array of all available prompts for use in UI dropdowns.
 * Prompts are ordered with the default/recommended option first.
 */
export const PROMPTS: PromptDefinition[] = [
  itineraryPlannerPrompt,
  scavengerHuntPrompt,
];

/**
 * Map of prompts by ID for quick lookup.
 */
export const PROMPTS_BY_ID: Record<string, PromptDefinition> = Object.fromEntries(
  PROMPTS.map(prompt => [prompt.id, prompt])
);

/**
 * The default prompt to use when no specific prompt is selected.
 */
export const DEFAULT_PROMPT = itineraryPlannerPrompt;

/**
 * Helper function to get a prompt by ID.
 * Returns the default prompt if the ID is not found.
 */
export function getPromptById(id: string): PromptDefinition {
  return PROMPTS_BY_ID[id] ?? DEFAULT_PROMPT;
}
