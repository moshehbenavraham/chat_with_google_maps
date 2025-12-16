/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Type guard utility functions for runtime type narrowing.
 *
 * These guards help TypeScript narrow union types and validate
 * unknown values at runtime, especially useful when working with
 * API responses and user input.
 */

/**
 * Check if a value is a non-null object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Check if a value has a specific property.
 */
export function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

/**
 * Type guard for google.maps.LatLngLiteral.
 */
export function isLatLngLiteral(
  value: unknown
): value is google.maps.LatLngLiteral {
  return (
    isObject(value) &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number'
  );
}

/**
 * Type guard for google.maps.LatLngAltitudeLiteral.
 */
export function isLatLngAltitudeLiteral(
  value: unknown
): value is google.maps.LatLngAltitudeLiteral {
  return (
    isLatLngLiteral(value) &&
    'altitude' in value &&
    typeof (value as Record<string, unknown>).altitude === 'number'
  );
}

/**
 * Type guard for checking if a value is a valid MapMarker position.
 */
export function isMapMarkerPosition(
  value: unknown
): value is { lat: number; lng: number; altitude: number } {
  return (
    isObject(value) &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number' &&
    typeof value.altitude === 'number'
  );
}

/**
 * Type guard for checking if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for checking if a value is a valid array.
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Assert that a value is defined (not null or undefined).
 * Throws an error if the value is null or undefined.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value is null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Safely get a value or return a default.
 * Useful for handling optional values in strict mode.
 */
export function getOrDefault<T>(
  value: T | null | undefined,
  defaultValue: T
): T {
  return value ?? defaultValue;
}
