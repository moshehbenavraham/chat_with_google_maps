/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Global TypeScript type definitions
 *
 * This file serves as the central location for global types that are used
 * across multiple parts of the application. More specific types should be
 * co-located with their respective modules.
 */

// Re-export types from stores for convenience
export type {
  ConversationTurn,
  FunctionCall,
  LiveClientToolResponse,
  MapMarker,
} from '@/stores';

// Re-export types from components
export type { Map3DCameraProps, Map3DProps } from '@/components/map-3d';

// Re-export types from lib
export type { ToolContext, ToolImplementation } from '@/lib/tools/tool-registry';
export type { PromptDefinition } from '@/lib/prompts';
