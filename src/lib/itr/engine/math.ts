/**
 * Deterministic math module with fixed-point half-up rounding
 * Implements Section 288A and 288B of the Indian Income Tax Act.
 * Eliminates IEEE-754 floating-point drift.
 */

export function roundHalfUp(num: number): number {
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round(num + (num > 0 ? Number.EPSILON : -Number.EPSILON));
}

/**
 * Section 288A: Rounding off of total income to the nearest multiple of ten rupees.
 * If the last digit of the amount is 5 or more, the amount is increased to the next multiple of 10.
 * If less than 5, it is reduced to the lower multiple of 10.
 */
export function roundSec288A(totalIncome: number): number {
  const rounded = roundHalfUp(totalIncome);
  if (rounded <= 0) return 0;
  const rem = rounded % 10;
  if (rem >= 5) {
    return rounded + (10 - rem);
  } else {
    return rounded - rem;
  }
}

/**
 * Section 288B: Rounding off of tax, interest, penalty, rebate, or refund to the nearest multiple of ten rupees.
 */
export function roundSec288B(amount: number): number {
  const rounded = roundHalfUp(amount);
  if (rounded <= 0) return 0;
  const rem = rounded % 10;
  if (rem >= 5) {
    return rounded + (10 - rem);
  } else {
    return rounded - rem;
  }
}

/**
 * Safe currency clamp (never negative for taxes/incomes where negative is illegal)
 */
export function clampZero(amount: number): number {
  return Math.max(0, roundHalfUp(amount));
}

/**
 * Safe ratio multiplication with rupee rounding
 */
export function calcRatioAmount(base: number, percent: number): number {
  return roundHalfUp((base * percent) / 100);
}
