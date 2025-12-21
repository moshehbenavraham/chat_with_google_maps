/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unit tests for utility functions.
 */

import { describe, it, expect } from 'vitest';
import { base64ToArrayBuffer, cn } from './utils';

describe('cn', () => {
  // T016: Basic merging tests
  it('merges multiple class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles single class', () => {
    expect(cn('single')).toBe('single');
  });

  // T017: Conditional handling tests
  it('handles conditional classes with falsy values', () => {
    const isFalse = false as boolean;
    expect(cn('a', isFalse && 'b', 'c')).toBe('a c');
    expect(cn('a', null, 'b')).toBe('a b');
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('handles object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
    expect(cn({ foo: true, bar: true })).toBe('foo bar');
    expect(cn({ hidden: false })).toBe('');
  });

  it('handles array syntax', () => {
    expect(cn(['a', 'b'])).toBe('a b');
    expect(cn(['foo'], ['bar'])).toBe('foo bar');
  });

  it('handles mixed inputs', () => {
    const isFalse = false as boolean;
    expect(cn('base', ['arr'], { obj: true })).toBe('base arr obj');
    expect(cn('static', isFalse && 'conditional', { dynamic: true })).toBe('static dynamic');
  });

  // T018: Tailwind conflict resolution tests
  it('resolves Tailwind padding conflicts', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
    expect(cn('py-2', 'py-4')).toBe('py-4');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
  });

  it('resolves Tailwind color conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('resolves Tailwind spacing conflicts', () => {
    expect(cn('m-4', 'm-8')).toBe('m-8');
    expect(cn('mt-2', 'mt-4')).toBe('mt-4');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8');
    expect(cn('text-sm font-bold', 'text-lg')).toBe('font-bold text-lg');
  });
});

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
