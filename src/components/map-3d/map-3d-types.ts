/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

import React from 'react';

/**
 * Module augmentations for Google Maps types that are not yet available
 * in @types/google.maps@3.58.
 *
 * This file uses declaration merging to extend existing types without
 * causing conflicts.
 */

// Augment @vis.gl/react-google-maps with additional library overloads
declare module '@vis.gl/react-google-maps' {
  export function useMapsLibrary(
    name: 'maps3d'
  ): google.maps.Maps3DLibrary | null;
  export function useMapsLibrary(
    name: 'elevation'
  ): google.maps.ElevationLibrary | null;
  export function useMapsLibrary(
    name: 'places'
  ): google.maps.PlacesLibrary | null;
  export function useMapsLibrary(
    name: 'geocoding'
  ): google.maps.GeocodingLibrary | null;
}

// Augment google.maps namespace with missing types
declare global {
  namespace google.maps {
    // Augment PlacesLibrary with experimental contextual elements
    interface PlacesLibrary {
      PlaceContextualElement: {
        new (): PlaceContextualElement;
      };
      PlaceContextualListConfigElement: {
        new (): PlaceContextualListConfigElement;
      };
    }

    // PlaceContextualElement for grounding widget
    interface PlaceContextualElement extends HTMLElement {
      contextToken: string;
    }

    // PlaceContextualListConfigElement for grounding widget
    interface PlaceContextualListConfigElement extends HTMLElement {
      mapHidden: boolean;
    }

    // Augment Maps3DLibrary with Marker3DInteractiveElement
    interface Maps3DLibrary {
      Marker3DInteractiveElement: {
        new (options: maps3d.Marker3DInteractiveElementOptions): HTMLElement;
      };
    }

    namespace maps3d {
      // Options for Marker3DInteractiveElement
      interface Marker3DInteractiveElementOptions {
        position?: LatLngAltitude | LatLngAltitudeLiteral;
        altitudeMode?: 'ABSOLUTE' | 'CLAMP_TO_GROUND' | 'RELATIVE_TO_GROUND' | 'RELATIVE_TO_MESH';
        label?: string | null;
        title?: string;
        drawsWhenOccluded?: boolean;
      }

      // Camera options for fly animations
      interface CameraOptions {
        center?: LatLngAltitude | LatLngAltitudeLiteral;
        heading?: number;
        range?: number;
        roll?: number;
        tilt?: number;
      }

      // Options for flyCameraAround
      interface FlyAroundAnimationOptions {
        camera: CameraOptions;
        durationMillis?: number;
        rounds?: number;
      }

      // Options for flyCameraTo
      interface FlyToAnimationOptions {
        endCamera: CameraOptions;
        durationMillis?: number;
      }

      // Augment Map3DElement with fly camera methods
      interface Map3DElement {
        flyCameraAround(options: FlyAroundAnimationOptions): void;
        flyCameraTo(options: FlyToAnimationOptions): void;
        mode?: 'HYBRID' | 'SATELLITE';
        defaultUIHidden?: boolean;
      }
    }
  }
}

// Add the <gmp-map-3d> custom element to JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map-3d': GmpMap3DAttributes;
    }
  }
}

// Attributes for the gmp-map-3d custom element
interface GmpMap3DAttributes
  extends Partial<google.maps.maps3d.Map3DElementOptions>,
    React.DOMAttributes<google.maps.maps3d.Map3DElement>,
    React.RefAttributes<google.maps.maps3d.Map3DElement> {
  children?: React.ReactNode;
  // Additional properties on the element that are not in Map3DElementOptions
  defaultUIHidden?: boolean;
  mode?: 'HYBRID' | 'SATELLITE';
}
