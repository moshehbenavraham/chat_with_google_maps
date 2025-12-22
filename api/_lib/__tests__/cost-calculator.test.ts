/**
 * Unit tests for cost calculator
 *
 * Tests the calculateCost function and related utilities
 * for accurate AI cost tracking.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCost,
  getModelPricing,
  hasKnownPricing,
  GEMINI_PRICING,
} from '../cost-calculator.js';

describe('cost-calculator', () => {
  describe('GEMINI_PRICING', () => {
    it('should have pricing for gemini-2.5-flash', () => {
      const pricing = GEMINI_PRICING['gemini-2.5-flash'];
      expect(pricing).toBeDefined();
      expect(pricing?.input).toBeGreaterThan(0);
      expect(pricing?.output).toBeGreaterThan(0);
    });

    it('should have pricing for gemini-1.5-pro', () => {
      const pricing = GEMINI_PRICING['gemini-1.5-pro'];
      expect(pricing).toBeDefined();
      expect(pricing?.input).toBeGreaterThan(0);
      expect(pricing?.output).toBeGreaterThan(0);
    });

    it('should have output cost higher than input cost', () => {
      // Output tokens typically cost more than input tokens
      for (const [_model, pricing] of Object.entries(GEMINI_PRICING)) {
        expect(pricing.output).toBeGreaterThan(pricing.input);
      }
    });
  });

  describe('calculateCost', () => {
    it('should return zero for zero tokens', () => {
      const cost = calculateCost('gemini-2.5-flash', 0, 0);
      expect(cost).toBe(0);
    });

    it('should return zero for negative tokens', () => {
      const cost = calculateCost('gemini-2.5-flash', -100, -50);
      expect(cost).toBe(0);
    });

    it('should calculate cost for known model', () => {
      // gemini-2.5-flash: $0.075 per 1M input, $0.30 per 1M output
      const inputTokens = 1000;
      const outputTokens = 500;
      const cost = calculateCost('gemini-2.5-flash', inputTokens, outputTokens);

      // Expected: (1000 * 0.075/1M) + (500 * 0.30/1M)
      // = 0.000075 + 0.00015 = 0.000225
      expect(cost).toBeCloseTo(0.000225, 10);
    });

    it('should calculate cost for gemini-1.5-pro', () => {
      // gemini-1.5-pro: $1.25 per 1M input, $5.00 per 1M output
      const inputTokens = 1000000; // 1M tokens
      const outputTokens = 100000; // 100K tokens
      const cost = calculateCost('gemini-1.5-pro', inputTokens, outputTokens);

      // Expected: 1.25 + 0.50 = 1.75
      expect(cost).toBeCloseTo(1.75, 6);
    });

    it('should use default pricing for unknown model', () => {
      // Unknown model should use gemini-2.5-flash pricing as default
      const cost = calculateCost('unknown-model', 1000, 500);
      const expectedCost = calculateCost('gemini-2.5-flash', 1000, 500);
      expect(cost).toBe(expectedCost);
    });

    it('should handle only input tokens', () => {
      const cost = calculateCost('gemini-2.5-flash', 1000, 0);
      // Expected: 1000 * 0.075/1M = 0.000075
      expect(cost).toBeCloseTo(0.000075, 10);
    });

    it('should handle only output tokens', () => {
      const cost = calculateCost('gemini-2.5-flash', 0, 1000);
      // Expected: 1000 * 0.30/1M = 0.0003
      expect(cost).toBeCloseTo(0.0003, 10);
    });

    it('should handle large token counts', () => {
      // 10M tokens each
      const cost = calculateCost('gemini-2.5-flash', 10_000_000, 10_000_000);
      // Expected: (10M * 0.075/1M) + (10M * 0.30/1M) = 0.75 + 3.0 = 3.75
      expect(cost).toBeCloseTo(3.75, 6);
    });
  });

  describe('getModelPricing', () => {
    it('should return pricing for known model', () => {
      const pricing = getModelPricing('gemini-2.5-flash');
      expect(pricing).not.toBeNull();
      expect(pricing?.input).toBeDefined();
      expect(pricing?.output).toBeDefined();
    });

    it('should return null for unknown model', () => {
      const pricing = getModelPricing('unknown-model');
      expect(pricing).toBeNull();
    });
  });

  describe('hasKnownPricing', () => {
    it('should return true for known model', () => {
      expect(hasKnownPricing('gemini-2.5-flash')).toBe(true);
      expect(hasKnownPricing('gemini-1.5-pro')).toBe(true);
    });

    it('should return false for unknown model', () => {
      expect(hasKnownPricing('unknown-model')).toBe(false);
      expect(hasKnownPricing('')).toBe(false);
    });
  });
});
