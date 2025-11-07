/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

'use client';

// FIX: Added missing React import for JSX.
import React from 'react';
import {useMapsLibrary} from '@vis.gl/react-google-maps';
import {useEffect, useRef} from 'react';

export function GroundingWidget({
  contextToken,
  mapHidden = false
}: {
  contextToken: string;
  mapHidden?: boolean;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const placesLibrary = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLibrary || !contextToken) return;

    const currentElement = elementRef.current;

    async function initializeElement() {
      if (currentElement && placesLibrary) {
        const element = new placesLibrary.PlaceContextualElement();
        element.id="widget";
        element.contextToken = contextToken;

        // Create and append the list config element
        const listConfig = new placesLibrary.PlaceContextualListConfigElement();
        if (mapHidden) {
          listConfig.mapHidden = true;
        }

        element.appendChild(listConfig);

        currentElement.appendChild(element);
      }
    }

    initializeElement();

    return () => {
      if (currentElement) {
        currentElement.innerHTML = '';
      }
    };
  }, [placesLibrary, contextToken, mapHidden]);

  return <div className="widget" ref={elementRef} />;
}