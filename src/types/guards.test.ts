/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for type guard utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  isObject,
  hasProperty,
  isLatLngLiteral,
  isLatLngAltitudeLiteral,
  isMapMarkerPosition,
  isNonEmptyString,
  isNonEmptyArray,
  assertDefined,
  getOrDefault,
} from './guards';

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
  });

  it('returns true for arrays', () => {
    expect(isObject([])).toBe(true);
    expect(isObject([1, 2, 3])).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(Symbol('test'))).toBe(false);
  });
});

describe('hasProperty', () => {
  it('returns true when object has the property', () => {
    expect(hasProperty({ name: 'test' }, 'name')).toBe(true);
    expect(hasProperty({ nested: { value: 1 } }, 'nested')).toBe(true);
  });

  it('returns true when property value is undefined', () => {
    expect(hasProperty({ value: undefined }, 'value')).toBe(true);
  });

  it('returns false when object does not have the property', () => {
    expect(hasProperty({}, 'missing')).toBe(false);
    expect(hasProperty({ other: 'value' }, 'missing')).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(hasProperty(null, 'key')).toBe(false);
    expect(hasProperty('string', 'length')).toBe(false);
    expect(hasProperty(123, 'toString')).toBe(false);
  });
});

describe('isLatLngLiteral', () => {
  it('returns true for valid lat/lng objects', () => {
    expect(isLatLngLiteral({ lat: 40.7128, lng: -74.006 })).toBe(true);
    expect(isLatLngLiteral({ lat: 0, lng: 0 })).toBe(true);
    expect(isLatLngLiteral({ lat: -90, lng: 180 })).toBe(true);
  });

  it('returns false when lat is not a number', () => {
    expect(isLatLngLiteral({ lat: '40.7128', lng: -74.006 })).toBe(false);
    expect(isLatLngLiteral({ lat: null, lng: -74.006 })).toBe(false);
  });

  it('returns false when lng is not a number', () => {
    expect(isLatLngLiteral({ lat: 40.7128, lng: '-74.006' })).toBe(false);
    expect(isLatLngLiteral({ lat: 40.7128, lng: undefined })).toBe(false);
  });

  it('returns false when properties are missing', () => {
    expect(isLatLngLiteral({ lat: 40.7128 })).toBe(false);
    expect(isLatLngLiteral({ lng: -74.006 })).toBe(false);
    expect(isLatLngLiteral({})).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isLatLngLiteral(null)).toBe(false);
    expect(isLatLngLiteral('coordinates')).toBe(false);
  });
});

describe('isLatLngAltitudeLiteral', () => {
  it('returns true for valid lat/lng/altitude objects', () => {
    expect(isLatLngAltitudeLiteral({ lat: 40.7128, lng: -74.006, altitude: 100 })).toBe(true);
    expect(isLatLngAltitudeLiteral({ lat: 0, lng: 0, altitude: 0 })).toBe(true);
  });

  it('returns false when altitude is missing', () => {
    expect(isLatLngAltitudeLiteral({ lat: 40.7128, lng: -74.006 })).toBe(false);
  });

  it('returns false when altitude is not a number', () => {
    expect(isLatLngAltitudeLiteral({ lat: 40.7128, lng: -74.006, altitude: '100' })).toBe(false);
    expect(isLatLngAltitudeLiteral({ lat: 40.7128, lng: -74.006, altitude: null })).toBe(false);
  });

  it('returns false when lat/lng are invalid', () => {
    expect(isLatLngAltitudeLiteral({ lat: 'invalid', lng: -74.006, altitude: 100 })).toBe(false);
  });
});

describe('isMapMarkerPosition', () => {
  it('returns true for valid marker positions', () => {
    expect(isMapMarkerPosition({ lat: 40.7128, lng: -74.006, altitude: 50 })).toBe(true);
    expect(isMapMarkerPosition({ lat: 0, lng: 0, altitude: 0 })).toBe(true);
  });

  it('returns false when any property is missing', () => {
    expect(isMapMarkerPosition({ lat: 40.7128, lng: -74.006 })).toBe(false);
    expect(isMapMarkerPosition({ lat: 40.7128, altitude: 50 })).toBe(false);
    expect(isMapMarkerPosition({ lng: -74.006, altitude: 50 })).toBe(false);
  });

  it('returns false when properties are not numbers', () => {
    expect(isMapMarkerPosition({ lat: '40.7128', lng: -74.006, altitude: 50 })).toBe(false);
    expect(isMapMarkerPosition({ lat: 40.7128, lng: '-74.006', altitude: 50 })).toBe(false);
    expect(isMapMarkerPosition({ lat: 40.7128, lng: -74.006, altitude: '50' })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isMapMarkerPosition(null)).toBe(false);
    expect(isMapMarkerPosition(undefined)).toBe(false);
    expect(isMapMarkerPosition('position')).toBe(false);
  });
});

describe('isNonEmptyString', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString(' ')).toBe(true);
    expect(isNonEmptyString('a')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString([])).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe('isNonEmptyArray', () => {
  it('returns true for arrays with elements', () => {
    expect(isNonEmptyArray([1])).toBe(true);
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
    expect(isNonEmptyArray(['a', 'b'])).toBe(true);
  });

  it('returns true for arrays with falsy values', () => {
    expect(isNonEmptyArray([null])).toBe(true);
    expect(isNonEmptyArray([undefined])).toBe(true);
    expect(isNonEmptyArray([0])).toBe(true);
    expect(isNonEmptyArray([false])).toBe(true);
    expect(isNonEmptyArray([''])).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it('returns false for non-array values', () => {
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray(undefined)).toBe(false);
    expect(isNonEmptyArray('string')).toBe(false);
    expect(isNonEmptyArray({ length: 1 })).toBe(false);
  });
});

describe('assertDefined', () => {
  it('does not throw for defined values', () => {
    expect(() => {
      assertDefined('value');
    }).not.toThrow();
    expect(() => {
      assertDefined(0);
    }).not.toThrow();
    expect(() => {
      assertDefined(false);
    }).not.toThrow();
    expect(() => {
      assertDefined('');
    }).not.toThrow();
    expect(() => {
      assertDefined({});
    }).not.toThrow();
  });

  it('throws for null', () => {
    expect(() => {
      assertDefined(null);
    }).toThrow('Value is null or undefined');
  });

  it('throws for undefined', () => {
    expect(() => {
      assertDefined(undefined);
    }).toThrow('Value is null or undefined');
  });

  it('uses custom error message', () => {
    expect(() => {
      assertDefined(null, 'Custom error message');
    }).toThrow('Custom error message');
    expect(() => {
      assertDefined(undefined, 'Missing value');
    }).toThrow('Missing value');
  });
});

describe('getOrDefault', () => {
  it('returns the value when defined', () => {
    expect(getOrDefault('hello', 'default')).toBe('hello');
    expect(getOrDefault(123, 0)).toBe(123);
    expect(getOrDefault(false, true)).toBe(false);
    expect(getOrDefault('', 'default')).toBe('');
    expect(getOrDefault(0, 42)).toBe(0);
  });

  it('returns default for null', () => {
    expect(getOrDefault(null, 'default')).toBe('default');
    expect(getOrDefault(null, 0)).toBe(0);
  });

  it('returns default for undefined', () => {
    expect(getOrDefault(undefined, 'default')).toBe('default');
    expect(getOrDefault(undefined, 42)).toBe(42);
  });
});
