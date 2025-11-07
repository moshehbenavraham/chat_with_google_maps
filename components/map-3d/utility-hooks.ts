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

import React, {
  DependencyList,
  EffectCallback,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import isDeepEqual from 'fast-deep-equal';

export function useCallbackRef<T>() {
  const [el, setEl] = useState<T | null>(null);
  const ref = useCallback((value: T) => setEl(value), [setEl]);

  return [el, ref as Ref<T>] as const;
}

export function useDeepCompareEffect(
  effect: EffectCallback,
  deps: DependencyList
) {
  const ref = useRef<DependencyList | undefined>(undefined);

  if (!ref.current || !isDeepEqual(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
}

export function useDebouncedEffect(
  effect: EffectCallback,
  timeout: number,
  deps: DependencyList
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      timerRef.current = setTimeout(() => effect(), timeout);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeout, ...deps]
  );
}