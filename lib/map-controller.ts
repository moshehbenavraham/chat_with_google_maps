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

import { Map3DCameraProps } from '@/components/map-3d';
import { lookAtWithPadding } from './look-at';
import { MapMarker } from './state';

type MapControllerDependencies = {
  map: google.maps.maps3d.Map3DElement;
  maps3dLib: google.maps.Maps3DLibrary;
  elevationLib: google.maps.ElevationLibrary;
};

/**
 * A controller class to centralize all interactions with the Google Maps 3D element.
 */
export class MapController {
  private map: google.maps.maps3d.Map3DElement;
  private maps3dLib: google.maps.Maps3DLibrary;
  private elevationLib: google.maps.ElevationLibrary;

  constructor(deps: MapControllerDependencies) {
    this.map = deps.map;
    this.maps3dLib = deps.maps3dLib;
    this.elevationLib = deps.elevationLib;
  }

  /**
   * Clears all child elements (like markers) from the map.
   */
  clearMap() {
    this.map.innerHTML = '';
  }

  /**
   * Adds a list of markers to the map.
   * @param markers - An array of marker data to be rendered.
   */
  addMarkers(markers: MapMarker[]) {
    for (const markerData of markers) {
      const marker = new this.maps3dLib.Marker3DInteractiveElement({
        position: markerData.position,
        altitudeMode: 'RELATIVE_TO_MESH',
        label: markerData.showLabel ? markerData.label : null,
        title: markerData.label,
        drawsWhenOccluded: true,
      });
      this.map.appendChild(marker);
    }
  }

  /**
   * Animate the camera to a specific set of camera properties.
   * @param cameraProps - The target camera position, range, tilt, etc.
   */
  flyTo(cameraProps: Map3DCameraProps) {
    this.map.flyCameraTo({
      durationMillis: 5000,
      endCamera: {
        center: {
          lat: cameraProps.center.lat,
          lng: cameraProps.center.lng,
          altitude: cameraProps.center.altitude,
        },
        range: cameraProps.range,
        heading: cameraProps.heading,
        tilt: cameraProps.tilt,
        roll: cameraProps.roll,
      },
    });
  }

  /**
   * Calculates the optimal camera view to frame a set of entities and animates to it.
   * @param entities - An array of entities to frame (must have a `position` property).
   * @param padding - The padding to apply around the entities.
   */
  async frameEntities(
    entities: { position: { lat: number; lng: number } }[],
    padding: [number, number, number, number],
  ) {
    if (entities.length === 0) return;

    const elevator = new this.elevationLib.ElevationService();
    const cameraProps = await lookAtWithPadding(
      entities.map(e => e.position),
      elevator,
      0, // heading
      padding,
    );

    this.flyTo({
      center: {
        lat: cameraProps.lat,
        lng: cameraProps.lng,
        altitude: cameraProps.altitude,
      },
      range: cameraProps.range + 1000, // Add a bit of extra range
      heading: cameraProps.heading,
      tilt: cameraProps.tilt,
      roll: 0,
    });
  }
}