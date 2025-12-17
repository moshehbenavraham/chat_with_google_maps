/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for utility functions.
 */

import { describe, it, expect } from 'vitest';
import { base64ToArrayBuffer } from './utils';

describe('base64ToArrayBuffer', () => {
  it('converts a simple base64 string to ArrayBuffer', () => {
    // "Hello" in base64 is "SGVsbG8="
    const base64 = 'SGVsbG8=';
    const buffer = base64ToArrayBuffer(base64);

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBe(5);

    const view = new Uint8Array(buffer);
    // H=72, e=101, l=108, l=108, o=111
    expect(view[0]).toBe(72);
    expect(view[1]).toBe(101);
    expect(view[2]).toBe(108);
    expect(view[3]).toBe(108);
    expect(view[4]).toBe(111);
  });

  it('converts an empty base64 string to empty ArrayBuffer', () => {
    const buffer = base64ToArrayBuffer('');
    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBe(0);
  });

  it('handles base64 string with binary data', () => {
    // Base64 for bytes [0, 1, 2, 255]
    const base64 = 'AAEC/w==';
    const buffer = base64ToArrayBuffer(base64);

    expect(buffer.byteLength).toBe(4);

    const view = new Uint8Array(buffer);
    expect(view[0]).toBe(0);
    expect(view[1]).toBe(1);
    expect(view[2]).toBe(2);
    expect(view[3]).toBe(255);
  });
});
