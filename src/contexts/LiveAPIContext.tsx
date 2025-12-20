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

import React, { createContext, type FC, type ReactNode, useContext, useEffect } from 'react';
import { useLiveApi, type UseLiveApiResults } from '@/hooks/use-live-api';
import { useAuthError } from '@/components/AuthErrorBoundary';

const LiveAPIContext = createContext<UseLiveApiResults | undefined>(undefined);

export interface LiveAPIProviderProps {
  children: ReactNode;
  map: google.maps.maps3d.Map3DElement | null;
  placesLib: google.maps.PlacesLibrary | null;
  elevationLib: google.maps.ElevationLibrary | null;
  geocoder: google.maps.Geocoder | null;
  padding: [number, number, number, number];
}

/**
 * Inner component that watches for auth errors and reports them
 * to the AuthErrorBoundary.
 */
function AuthErrorReporter({
  authError,
  clearAuthError,
}: Pick<UseLiveApiResults, 'authError' | 'clearAuthError'>) {
  const { reportAuthError } = useAuthError();

  useEffect(() => {
    if (authError) {
      // Report the error to AuthErrorBoundary which will show the modal
      reportAuthError(authError);
      // Clear the error from the hook so it doesn't keep reporting
      clearAuthError();
    }
  }, [authError, reportAuthError, clearAuthError]);

  return null;
}

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  children,
  map,
  placesLib,
  elevationLib,
  geocoder,
  padding,
}) => {
  // Note: apiKey is no longer needed here - ephemeral tokens are fetched on-demand
  const liveAPI = useLiveApi({ map, placesLib, elevationLib, geocoder, padding });

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {/* Auto-report auth errors to the boundary */}
      <AuthErrorReporter authError={liveAPI.authError} clearAuthError={liveAPI.clearAuthError} />
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = (): UseLiveApiResults => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error('useLiveAPIContext must be used wihin a LiveAPIProvider');
  }
  return context;
};
