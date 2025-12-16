/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definition for a system prompt that can be used with the Gemini Live API.
 * This interface provides a consistent structure for managing prompts,
 * making it easy to display them in a UI selector.
 */
export interface PromptDefinition {
  /** Unique identifier for the prompt */
  id: string;
  /** Human-readable name for display in UI */
  name: string;
  /** Brief description of what this prompt does */
  description: string;
  /** The full system instruction content */
  content: string;
  /** Recommended voice to use with this prompt */
  defaultVoice: string;
}
