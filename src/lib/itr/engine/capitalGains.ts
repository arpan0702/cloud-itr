import { CapitalGainsDetails } from "../types";
import { clampZero, roundHalfUp } from "./math";

export interface CapitalGainsTaxResult {
  stcg111ATax: number;
  stcgOtherTaxableAtSlab: number;
  ltcg112ATaxable: number;
  ltcg112ATax: number;
  ltcg112OtherTax: number;
  totalSpecialRateCapitalTax: number;
  totalCapitalGainsGTI: number;
}

/**
 * Calculates Capital Gains tax strictly according to statutory sections:
 * - Sec 111A: 20% post Budget 2024 (STT equity)
 * - Sec 112A: 12.5% post Budget 2024 with ₹1,25,000 exemption
 * - Sec 112: 12.5% flat (or 20% with indexation)
 */
export function calculateCapitalGainsTax(
  cg: CapitalGainsDetails
): CapitalGainsTaxResult {
  // STCG 111A rate: 20% (Budget 2024 / FY 24-25 onwards)
  const stcg111ARate = 0.20;
  const stcg111ATax = roundHalfUp(clampZero(cg.stcg111A) * stcg111ARate);

  // STCG Other is taxed at regular slab rates, so it flows to normal taxable income
  const stcgOtherTaxableAtSlab = clampZero(cg.stcgOther);

  // LTCG 112A: ₹1,25,000 exemption limit
  const ltcg112AExemptionLimit = cg.ltcg112AExemption > 0 ? cg.ltcg112AExemption : 125000;
  const grossLtcg112A = clampZero(cg.ltcg112A);
  const ltcg112ATaxable = Math.max(0, grossLtcg112A - ltcg112AExemptionLimit);
  
  // Rate: 12.5% on amount exceeding ₹1.25L
  const ltcg112ARate = 0.125;
  const ltcg112ATax = roundHalfUp(ltcg112ATaxable * ltcg112ARate);

  // LTCG 112 Other assets: 12.5%
  const ltcg112OtherRate = 0.125;
  const ltcg112OtherTax = roundHalfUp(clampZero(cg.ltcg112Other) * ltcg112OtherRate);

  const totalSpecialRateCapitalTax = stcg111ATax + ltcg112ATax + ltcg112OtherTax;
  const totalCapitalGainsGTI =
    clampZero(cg.stcg111A) +
    stcgOtherTaxableAtSlab +
    grossLtcg112A +
    clampZero(cg.ltcg112Other);

  return {
    stcg111ATax,
    stcgOtherTaxableAtSlab,
    ltcg112ATaxable,
    ltcg112ATax,
    ltcg112OtherTax,
    totalSpecialRateCapitalTax,
    totalCapitalGainsGTI,
  };
}

/**
 * Grandfathering formula for LTCG under Section 55(2)(ac):
 * For equity shares acquired before 1-Feb-2018:
 * Cost of Acquisition = Higher of (Actual Cost, Min(FMV as on 31-Jan-2018, Sale Consideration))
 */
export function calculateGrandfatheredCost(
  actualPurchaseCost: number,
  fmvAsOn31Jan2018: number,
  salePrice: number
): number {
  const cappedFMV = Math.min(fmvAsOn31Jan2018, salePrice);
  return Math.max(actualPurchaseCost, cappedFMV);
}
