/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

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

import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { fetchMapsGroundedResponseREST } from '@/lib/maps-grounding';
import { MapMarker, useLogStore, useMapStore } from '@/lib/state';
import { lookAtWithPadding } from '../look-at';

/**
 * Context object containing shared resources and setters that can be passed
 * to any tool implementation.
 */
export interface ToolContext {
  map: google.maps.maps3d.Map3DElement | null;
  placesLib: google.maps.PlacesLibrary | null;
  elevationLib: google.maps.ElevationLibrary | null;
  geocoder: google.maps.Geocoder | null;
  padding: [number, number, number, number];
  setHeldGroundedResponse: (
    response: GenerateContentResponse | undefined,
  ) => void;
  setHeldGroundingChunks: (chunks: GroundingChunk[] | undefined) => void;
}

/**
 * Defines the signature for any tool's implementation function.
 * @param args - The arguments for the function call, provided by the model.
 * @param context - The shared context object.
 * @returns A promise that resolves to either a string or a GenerateContentResponse
 *          to be sent back to the model.
 */
export type ToolImplementation = (
  args: any,
  context: ToolContext,
) => Promise<GenerateContentResponse | string>;

/**
 * Fetches and processes place details from grounding chunks.
 * @param groundingChunks - The grounding chunks from the model's response.
 * @param placesLib - The Google Maps Places library instance.
 * @param responseText - The model's text response to filter relevant places.
 * @param markerBehavior - Controls whether to show all markers or only mentioned ones.
 * @returns A promise that resolves to an array of MapMarker objects.
 */
async function fetchPlaceDetailsFromChunks(
  groundingChunks: GroundingChunk[],
  placesLib: google.maps.PlacesLibrary,
  responseText?: string,
  markerBehavior: 'mentioned' | 'all' | 'none' = 'mentioned',
): Promise<MapMarker[]> {
  if (markerBehavior === 'none' || !groundingChunks?.length) {
    return [];
  }

  let chunksToProcess = groundingChunks.filter(c => c.maps?.placeId);
  if (markerBehavior === 'mentioned' && responseText) {
    // Filter the marker list to only what was mentioned in the grounding text.
    chunksToProcess = chunksToProcess.filter(
      chunk =>
        chunk.maps?.title && responseText.includes(chunk.maps.title),
    );
  }

  if (!chunksToProcess.length) {
    return [];
  }

  const placesRequests = chunksToProcess.map(chunk => {
    const placeId = chunk.maps!.placeId.replace('places/', '');
    const place = new placesLib.Place({ id: placeId });
    return place.fetchFields({ fields: ['location', 'displayName'] });
  });

  const locationResults = await Promise.allSettled(placesRequests);

  const newMarkers: MapMarker[] = locationResults
    .map((result, index) => {
      if (result.status !== 'fulfilled' || !result.value.place.location) {
        return null;
      }
      
      const { place } = result.value;
      const originalChunk = chunksToProcess[index];
      
      let showLabel = true; // Default for 'mentioned'
      if (markerBehavior === 'all') {
        showLabel = !!(responseText && originalChunk.maps?.title && responseText.includes(originalChunk.maps.title));
      }

      return {
        position: {
          lat: place.location.lat(),
          lng: place.location.lng(),
          altitude: 1,
        },
        label: place.displayName ?? '',
        showLabel,
      };
    })
    .filter((marker): marker is MapMarker => marker !== null);

  return newMarkers;
}

/**
 * Updates the global map state based on the provided markers and grounding data.
 * It decides whether to perform a special close-up zoom or a general auto-frame.
 * @param markers - An array of markers to display on the map.
 * @param groundingChunks - The original grounding chunks to check for metadata.
 */
function updateMapStateWithMarkers(
  markers: MapMarker[],
  groundingChunks: GroundingChunk[],
) {
  const hasPlaceAnswerSources = groundingChunks.some(
    chunk => chunk.maps?.placeAnswerSources,
  );

  if (hasPlaceAnswerSources && markers.length === 1) {
    // Special close-up zoom: prevent auto-framing and set a direct camera target.
    const { setPreventAutoFrame, setMarkers, setCameraTarget } =
      useMapStore.getState();

    setPreventAutoFrame(true);
    setMarkers(markers);
    setCameraTarget({
      center: { ...markers[0].position, altitude: 200 },
      range: 500, // A tighter range for a close-up
      tilt: 60, // A steeper tilt for a more dramatic view
      heading: 0,
      roll: 0,
    });
  } else {
    // Default behavior: just set the markers and let the App component auto-frame them.
    const { setPreventAutoFrame, setMarkers } = useMapStore.getState();
    setPreventAutoFrame(false);
    setMarkers(markers);
  }
}


/**
 * Tool implementation for grounding queries with Google Maps.
 *
 * This tool fetches a grounded response and then, in a non-blocking way,
 * processes the place data to update the markers and camera on the 3D map.
 */
const mapsGrounding: ToolImplementation = async (args, context) => {
  const { setHeldGroundedResponse, setHeldGroundingChunks, placesLib } = context;
  const {
    query,
    markerBehavior = 'mentioned',
    systemInstruction,
    enableWidget,
  } = args;

  const groundedResponse = await fetchMapsGroundedResponseREST({
    prompt: query as string,
    systemInstruction: systemInstruction as string | undefined,
    enableWidget: enableWidget as boolean | undefined,
  });

  if (!groundedResponse) {
    return 'Failed to get a response from maps grounding.';
  }

  // Hold response data for display in the chat log
  setHeldGroundedResponse(groundedResponse);
  const groundingChunks =
    groundedResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks && groundingChunks.length > 0) {
    setHeldGroundingChunks(groundingChunks);
  } else {
    // If there are no grounding chunks, clear any existing markers and return.
    useMapStore.getState().setMarkers([]);
    return groundedResponse;
  }

  // Process place details and update the map state asynchronously.
  // This is done in a self-invoking async function so that the `mapsGrounding`
  // tool can return the response to the model immediately without waiting for
  // the map UI to update.
  if (placesLib && markerBehavior !== 'none') {
    (async () => {
      try {
        const responseText =
          groundedResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        const markers = await fetchPlaceDetailsFromChunks(
          groundingChunks,
          placesLib,
          responseText,
          markerBehavior,
        );
        updateMapStateWithMarkers(markers, groundingChunks);
      } catch (e) {
        console.error('Error processing place details and updating map:', e);
      }
    })();
  } else if (markerBehavior === 'none') {
    // If no markers are to be created, ensure the map is cleared.
    useMapStore.getState().setMarkers([]);
  }

  return groundedResponse;
};

/**
 * Tool implementation for displaying a city on the 3D map.
 * This tool sets the `cameraTarget` in the global Zustand store. The main `App`
 * component has a `useEffect` hook that listens for changes to this state and
 * commands the `MapController` to fly to the new target.
 */
const frameEstablishingShot: ToolImplementation = async (args, context) => {
  let { lat, lng, geocode } = args;
  const { geocoder } = context;

  if (geocode && typeof geocode === 'string') {
    if (!geocoder) {
      const errorMessage = 'Geocoding service is not available.';
      useLogStore.getState().addTurn({
        role: 'system',
        text: errorMessage,
        isFinal: true,
      });
      return errorMessage;
    }
    try {
      const response = await geocoder.geocode({ address: geocode });
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        lat = location.lat();
        lng = location.lng();
      } else {
        const errorMessage = `Could not find a location for "${geocode}".`;
        useLogStore.getState().addTurn({
          role: 'system',
          text: errorMessage,
          isFinal: true,
        });
        return errorMessage;
      }
    } catch (error) {
      console.error(`Geocoding failed for "${geocode}":`, error);
      const errorMessage = `There was an error trying to find the location for "${geocode}". See browser console for details.`;
      useLogStore.getState().addTurn({
        role: 'system',
        text: errorMessage,
        isFinal: true,
      });
      return `There was an error trying to find the location for "${geocode}".`;
    }
  }

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return 'Invalid arguments for frameEstablishingShot. You must provide either a `geocode` string or numeric `lat` and `lng` values.';
  }

  // Instead of directly manipulating the map, we set a target in the global state.
  // The App component will observe this state and command the MapController to fly to the target.
  useMapStore.getState().setCameraTarget({
    center: { lat, lng, altitude: 5000 },
    range: 15000,
    tilt: 10,
    heading: 0,
    roll: 0,
  });

  if (geocode) {
    return `Set camera target to ${geocode}.`;
  }
  return `Set camera target to latitude ${lat} and longitude ${lng}.`;
};


/**
 * Tool implementation for framing a list of locations on the map. It can either
 * fly the camera to view the locations or add markers for them, letting the
 * main app's reactive state handle the camera framing.
 */
const frameLocations: ToolImplementation = async (args, context) => {
  const {
    locations: explicitLocations,
    geocode,
    markers: shouldCreateMarkers,
  } = args;
  const { elevationLib, padding, geocoder } = context;

  const locationsWithLabels: { lat: number; lng: number; label?: string }[] =
    [];

  // 1. Collect all locations from explicit coordinates and geocoded addresses.
  if (Array.isArray(explicitLocations)) {
    locationsWithLabels.push(
      ...(explicitLocations.map((loc: { lat: number; lng: number }) => ({
        ...loc,
      })) || []),
    );
  }

  if (Array.isArray(geocode) && geocode.length > 0) {
    if (!geocoder) {
      const errorMessage = 'Geocoding service is not available.';
      useLogStore
        .getState()
        .addTurn({ role: 'system', text: errorMessage, isFinal: true });
      return errorMessage;
    }

    const geocodePromises = geocode.map(address =>
      geocoder.geocode({ address }).then(response => ({ response, address })),
    );
    const geocodeResults = await Promise.allSettled(geocodePromises);

    geocodeResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { response, address } = result.value;
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          locationsWithLabels.push({
            lat: location.lat(),
            lng: location.lng(),
            label: address,
          });
        } else {
          const errorMessage = `Could not find a location for "${address}".`;
          useLogStore
            .getState()
            .addTurn({ role: 'system', text: errorMessage, isFinal: true });
        }
      } else {
        const errorMessage = `Geocoding failed for an address.`;
        console.error(errorMessage, result.reason);
        useLogStore
          .getState()
          .addTurn({ role: 'system', text: errorMessage, isFinal: true });
      }
    });
  }

  // 2. Check if we have any valid locations.
  if (locationsWithLabels.length === 0) {
    return 'Could not find any valid locations to frame.';
  }

  // 3. Perform the requested action.
  if (shouldCreateMarkers) {
    // Create markers and update the global state. The App component will
    // reactively frame these new markers.
    const markersToSet = locationsWithLabels.map((loc, index) => ({
      position: { lat: loc.lat, lng: loc.lng, altitude: 1 },
      label: loc.label || `Location ${index + 1}`,
      showLabel: true,
    }));

    const { setMarkers, setPreventAutoFrame } = useMapStore.getState();
    setPreventAutoFrame(false); // Ensure auto-framing is enabled
    setMarkers(markersToSet);

    return `Framed and added markers for ${markersToSet.length} locations.`;
  } else {
    // No markers requested. Clear existing markers and manually fly the camera.
    if (!elevationLib) {
      return 'Elevation library is not available.';
    }

    useMapStore.getState().clearMarkers();

    const elevator = new elevationLib.ElevationService();
    const cameraProps = await lookAtWithPadding(
      locationsWithLabels,
      elevator,
      0,
      padding,
    );

    useMapStore.getState().setCameraTarget({
      center: {
        lat: cameraProps.lat,
        lng: cameraProps.lng,
        altitude: cameraProps.altitude,
      },
      range: cameraProps.range + 1000,
      heading: cameraProps.heading,
      tilt: cameraProps.tilt,
      roll: 0,
    });

    return `Framed ${locationsWithLabels.length} locations on the map.`;
  }
};

/**
 * A registry mapping tool names to their implementation functions.
 * The `onToolCall` handler uses this to dispatch function calls dynamically.
 */
export const toolRegistry: Record<string, ToolImplementation> = {
  mapsGrounding,
  frameEstablishingShot,
  frameLocations,
};