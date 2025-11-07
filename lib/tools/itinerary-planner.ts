/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const itineraryPlannerTools: FunctionCall[] = [
  {
    name: 'mapsGrounding',
    description: `
    A versatile tool that leverages Google Maps data to generate contextual information and creative content about places. It can be used for two primary purposes:

    1.  **For Itinerary Planning:** Find and summarize information about places like restaurants, museums, or parks. Use a straightforward query to get factual summaries of top results.
        -   **Example Query:** "fun museums in Paris" or "best pizza in Brooklyn".

    2.  **For Creative Content:** Generate engaging narratives, riddles, or scavenger hunt clues based on real-world location data. Use a descriptive query combined with a custom 'systemInstruction' to guide the creative output.
        -   **Example Query:** "a famous historical restaurant in Paris".

    Args:
        query: A string describing the search parameters. You **MUST be as precise as possible**, include as much location data that you can such as city, state and/or country to reduce ambiguous results.
        markerBehavior: (Optional) Controls map markers. "mentioned" (default), "all", or "none".
        systemInstruction: (Optional) A string that provides a persona and instructions for the tool's output. Use this for creative tasks to ensure the response is formatted as a clue, riddle, etc.
        enableWidget: (Optional) A boolean to control whether the interactive maps widget is enabled for the response. Defaults to true. Set to false for simple text-only responses or when the UI cannot support the widget.

    Returns:
        A response from the maps grounding agent. The content and tone of the response will be shaped by the query and the optional 'systemInstruction'.
    `,
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
        },
        markerBehavior: {
          type: 'STRING',
          description:
            'Controls which results get markers. "mentioned" for places in the text response, "all" for all search results, or "none" for no markers.',
          enum: ['mentioned', 'all', 'none'],
        },
        systemInstruction: {
          type: 'STRING',
          description:
            "A string that provides a persona and instructions for the tool's output. Use this for creative tasks to ensure the response is formatted as a clue, riddle, etc.",
        },
        enableWidget: {
          type: 'BOOLEAN',
          description:
            'A boolean to control whether the interactive maps widget is enabled for the response. Defaults to true. Set to false for simple text-only responses or when the UI cannot support the widget.',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'frameEstablishingShot',
    description: 'Call this function to display a city or location on the map. Provide either a location name to geocode, or a specific latitude and longitude. This provides a wide, establishing shot of the area.',
    parameters: {
      type: 'OBJECT',
      properties: {
        geocode: {
          type: 'STRING',
          description: 'The name of the location to look up (e.g., "Paris, France"). You **MUST be as precise as possible**, include as much location data that you can such as city, state and/or country to reduce ambiguous results.'
        },
        lat: {
          type: 'NUMBER',
          description: 'The latitude of the location.'
        },
        lng: {
          type: 'NUMBER',
          description: 'The longitude of the location.'
        },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'frameLocations',
    description: 'Frames multiple locations on the map, ensuring all are visible. Provide either an array of location names to geocode, or an array of specific latitude/longitude points. Can optionally add markers for these locations. When relying on geocoding you **MUST be as precise as possible**, include as much location data that you can such as city, state and/or country to reduce ambiguous results.',
    parameters: {
      type: 'OBJECT',
      properties: {
        locations: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              lat: { type: 'NUMBER' },
              lng: { type: 'NUMBER' },
            },
            required: ['lat', 'lng'],
          },
        },
        geocode: {
          type: 'ARRAY',
          description: 'An array of location names to look up (e.g., ["Eiffel Tower", "Louvre Museum"]).',
          items: {
            type: 'STRING',
          },
        },
        markers: {
          type: 'BOOLEAN',
          description: 'If true, adds markers to the map for each location being framed.'
        }
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];