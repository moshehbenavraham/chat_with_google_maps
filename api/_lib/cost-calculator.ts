/**
 * AI Cost Calculator for Gemini Models
 *
 * Calculates the cost of AI requests based on token usage and model pricing.
 * Pricing data sourced from Google AI pricing documentation.
 *
 * @module api/_lib/cost-calculator
 */

/**
 * Pricing structure for a Gemini model.
 * Costs are per token (already divided by 1M).
 */
export interface GeminiPricing {
  /** Cost per input token in USD */
  input: number;
  /** Cost per output token in USD */
  output: number;
}

/**
 * Gemini model pricing table.
 *
 * Pricing from Google AI pricing (as of Jan 2025):
 * - gemini-2.5-flash: $0.075 per 1M input, $0.30 per 1M output
 * - gemini-2.0-flash: $0.10 per 1M input, $0.40 per 1M output
 * - gemini-1.5-flash: $0.075 per 1M input, $0.30 per 1M output
 * - gemini-1.5-pro: $1.25 per 1M input, $5.00 per 1M output
 *
 * Note: Pricing may vary. Update values when Google announces changes.
 */
export const GEMINI_PRICING: Record<string, GeminiPricing> = {
  'gemini-2.5-flash': {
    input: 0.075 / 1_000_000,
    output: 0.3 / 1_000_000,
  },
  'gemini-2.0-flash': {
    input: 0.1 / 1_000_000,
    output: 0.4 / 1_000_000,
  },
  'gemini-1.5-flash': {
    input: 0.075 / 1_000_000,
    output: 0.3 / 1_000_000,
  },
  'gemini-1.5-pro': {
    input: 1.25 / 1_000_000,
    output: 5.0 / 1_000_000,
  },
};

/**
 * Default pricing for unknown models.
 * Uses gemini-2.5-flash pricing as a reasonable default.
 */
const DEFAULT_PRICING: GeminiPricing = {
  input: 0.075 / 1_000_000,
  output: 0.3 / 1_000_000,
};

/**
 * Calculate the cost of an AI request based on token usage.
 *
 * @param model - The model name (e.g., 'gemini-2.5-flash')
 * @param inputTokens - Number of input/prompt tokens
 * @param outputTokens - Number of output/completion tokens
 * @returns Total cost in USD (may be very small, e.g., 0.000045)
 *
 * @example
 * ```typescript
 * const cost = calculateCost('gemini-2.5-flash', 1000, 500);
 * console.log(`Request cost: $${cost.toFixed(6)}`);
 * ```
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Handle zero or negative tokens
  if (inputTokens <= 0 && outputTokens <= 0) {
    return 0;
  }

  // Get pricing for the model, or use default
  const pricing: GeminiPricing = GEMINI_PRICING[model] ?? DEFAULT_PRICING;

  // Calculate costs
  const inputCost = Math.max(0, inputTokens) * pricing.input;
  const outputCost = Math.max(0, outputTokens) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Get the pricing for a specific model.
 *
 * @param model - The model name
 * @returns The pricing object, or null if model not found
 */
export function getModelPricing(model: string): GeminiPricing | null {
  return GEMINI_PRICING[model] ?? null;
}

/**
 * Check if a model has known pricing.
 *
 * @param model - The model name
 * @returns True if pricing is known for this model
 */
export function hasKnownPricing(model: string): boolean {
  return model in GEMINI_PRICING;
}
