/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

'use client';

/**
 * Copyright 2025 Google LLC
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

// FIX: Added missing React imports.
import {useEffect, useRef} from 'react';
import {Map3DCameraProps} from './map-3d';

const cameraPropNames = ['center', 'range', 'heading', 'tilt', 'roll'] as const;

const DEFAULT_CAMERA_PROPS: Map3DCameraProps = {
  center: {lat: 0, lng: 0, altitude: 0},
  range: 0,
  heading: 0,
  tilt: 0,
  roll: 0
};

/**
 * Binds event-listeners for all camera-related events to the Map3dElement.
 * The values from the events are aggregated into a Map3DCameraProps object,
 * and changes are dispatched via the onCameraChange callback.
 */
export function useMap3DCameraEvents(
  mapEl?: google.maps.maps3d.Map3DElement | null,
  onCameraChange?: (cameraProps: Map3DCameraProps) => void
) {
  const cameraPropsRef = useRef<Map3DCameraProps>(DEFAULT_CAMERA_PROPS);

  useEffect(() => {
    if (!mapEl) return;

    const cleanupFns: (() => void)[] = [];

    let updateQueued = false;

    for (const p of cameraPropNames) {
      const removeListener = addDomListener(mapEl, `gmp-${p}change`, () => {
        const newValue = mapEl[p];

        if (newValue == null) return;

        if (p === 'center')
          // fixme: the typings say this should be a LatLngAltitudeLiteral, but in reality a
          //  LatLngAltitude object is returned, even when a LatLngAltitudeLiteral was written
          //  to the property.
          cameraPropsRef.current.center = (
            newValue as google.maps.LatLngAltitude
          ).toJSON();
        else cameraPropsRef.current[p] = newValue as number;

        if (onCameraChange && !updateQueued) {
          updateQueued = true;

          // queue a microtask so all synchronously dispatched events are handled first
          queueMicrotask(() => {
            updateQueued = false;
            onCameraChange(cameraPropsRef.current);
          });
        }
      });

      cleanupFns.push(removeListener);
    }

    return () => {
      for (const removeListener of cleanupFns) removeListener();
    };
  }, [mapEl, onCameraChange]);
}

/**
 * Adds an event-listener and returns a function to remove it again.
 */
function addDomListener(
  element: google.maps.maps3d.Map3DElement,
  type: string,
  listener: (this: google.maps.maps3d.Map3DElement, ev: unknown) => void
): () => void {
  element.addEventListener(type, listener);

  return () => {
    element.removeEventListener(type, listener);
  };
}