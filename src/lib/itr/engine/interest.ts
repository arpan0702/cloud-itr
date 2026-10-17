import { roundHalfUp, clampZero } from "./math";

export interface InterestCalculationInput {
  assessedTax: number; // Gross tax liability minus TDS/TCS and relief u/s 89/90/91
  advanceTaxPaid: {
    by15Jun: number;
    by15Sep: number;
    by15Dec: number;
    by15Mar: number;
  };
  dueDate: string; // e.g. "2025-07-31"
  filingDate: string; // e.g. "2025-09-15"
  grossTotalIncome: number;
  isPresumptive44AD_ADA?: boolean;
}

export interface InterestCalculationResult {
  interest234A: number;
  interest234B: number;
  interest234C: number;
  lateFee234F: number;
  totalInterestAndFees: number;
  breakdown234C: {
    q1Shortfall: number;
    q1Interest: number;
    q2Shortfall: number;
    q2Interest: number;
    q3Shortfall: number;
    q3Interest: number;
    q4Shortfall: number;
    q4Interest: number;
  };
  monthsDelay234A: number;
  monthsDelay234B: number;
}

export function calculateStatutoryInterest(
  input: InterestCalculationInput
): InterestCalculationResult {
  const assessedTax = clampZero(input.assessedTax);

  // If assessed tax is less than ₹10,000, Section 234B & 234C advance tax rules do not apply
  const isAdvanceTaxApplicable = assessedTax >= 10000;

  // Total advance tax paid by 31st March
  const totalAdvanceTaxPaid =
    input.advanceTaxPaid.by15Jun +
    input.advanceTaxPaid.by15Sep +
    input.advanceTaxPaid.by15Dec +
    input.advanceTaxPaid.by15Mar;

  // Shortfall for 234A: Assessed tax minus advance tax paid
  const netTaxUnpaidFor234A = Math.max(0, assessedTax - totalAdvanceTaxPaid);

  // --- 1. Section 234A: Delay in filing return ---
  // Calculates months from day after due date to filing date
  const due = new Date(input.dueDate);
  const filed = new Date(input.filingDate);

  let monthsDelay234A = 0;
  if (filed > due && netTaxUnpaidFor234A > 0) {
    const diffTime = filed.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Part of a month is rounded up to a full month
    monthsDelay234A = Math.max(1, Math.ceil(diffDays / 30));
  }

  const interest234A = roundHalfUp(netTaxUnpaidFor234A * 0.01 * monthsDelay234A);

  // --- 2. Section 234B: Default in payment of advance tax ---
  // If advance tax paid is less than 90% of assessed tax, 1% per month from 1st April of AY
  let interest234B = 0;
  let monthsDelay234B = 0;
  if (isAdvanceTaxApplicable && totalAdvanceTaxPaid < assessedTax * 0.90) {
    const ayStart = new Date(`${due.getFullYear()}-04-01`);
    if (filed > ayStart) {
      const diffTime = filed.getTime() - ayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      monthsDelay234B = Math.max(1, Math.ceil(diffDays / 30));
    } else {
      monthsDelay234B = 1;
    }
    const shortfall234B = Math.max(0, assessedTax - totalAdvanceTaxPaid);
    interest234B = roundHalfUp(shortfall234B * 0.01 * monthsDelay234B);
  }

  // --- 3. Section 234C: Deferment of advance tax installments ---
  let q1Shortfall = 0;
  let q1Interest = 0;
  let q2Shortfall = 0;
  let q2Interest = 0;
  let q3Shortfall = 0;
  let q3Interest = 0;
  let q4Shortfall = 0;
  let q4Interest = 0;

  if (isAdvanceTaxApplicable) {
    if (input.isPresumptive44AD_ADA) {
      // For Section 44AD / 44ADA taxpayers: 100% can be paid by 15th March
      const cumulativeBy15Mar = totalAdvanceTaxPaid;
      if (cumulativeBy15Mar < assessedTax) {
        q4Shortfall = assessedTax - cumulativeBy15Mar;
        q4Interest = roundHalfUp(q4Shortfall * 0.01 * 1);
      }
    } else {
      // Q1: 15% due by 15 June (Safe harbor: >= 12% paid)
      const cumulativeBy15Jun = input.advanceTaxPaid.by15Jun;
      const targetQ1 = assessedTax * 0.15;
      const safeHarborQ1 = assessedTax * 0.12;
      if (cumulativeBy15Jun < safeHarborQ1) {
        q1Shortfall = Math.max(0, targetQ1 - cumulativeBy15Jun);
        q1Interest = roundHalfUp(q1Shortfall * 0.01 * 3); // 3 months
      }

      // Q2: 45% due by 15 September (Safe harbor: >= 36% paid)
      const cumulativeBy15Sep = cumulativeBy15Jun + input.advanceTaxPaid.by15Sep;
      const targetQ2 = assessedTax * 0.45;
      const safeHarborQ2 = assessedTax * 0.36;
      if (cumulativeBy15Sep < safeHarborQ2) {
        q2Shortfall = Math.max(0, targetQ2 - cumulativeBy15Sep);
        q2Interest = roundHalfUp(q2Shortfall * 0.01 * 3); // 3 months
      }

      // Q3: 75% due by 15 December
      const cumulativeBy15Dec = cumulativeBy15Sep + input.advanceTaxPaid.by15Dec;
      const targetQ3 = assessedTax * 0.75;
      if (cumulativeBy15Dec < targetQ3) {
        q3Shortfall = Math.max(0, targetQ3 - cumulativeBy15Dec);
        q3Interest = roundHalfUp(q3Shortfall * 0.01 * 3); // 3 months
      }

      // Q4: 100% due by 15 March
      const cumulativeBy15Mar = cumulativeBy15Dec + input.advanceTaxPaid.by15Mar;
      const targetQ4 = assessedTax * 1.0;
      if (cumulativeBy15Mar < targetQ4) {
        q4Shortfall = Math.max(0, targetQ4 - cumulativeBy15Mar);
        q4Interest = roundHalfUp(q4Shortfall * 0.01 * 1); // 1 month
      }
    }
  }

  const interest234C = q1Interest + q2Interest + q3Interest + q4Interest;

  // --- 4. Section 234F: Late filing fee ---
  let lateFee234F = 0;
  if (filed > due) {
    if (input.grossTotalIncome <= 500000) {
      lateFee234F = 1000;
    } else {
      lateFee234F = 5000;
    }
  }

  const totalInterestAndFees =
    interest234A + interest234B + interest234C + lateFee234F;

  return {
    interest234A,
    interest234B,
    interest234C,
    lateFee234F,
    totalInterestAndFees,
    breakdown234C: {
      q1Shortfall,
      q1Interest,
      q2Shortfall,
      q2Interest,
      q3Shortfall,
      q3Interest,
      q4Shortfall,
      q4Interest,
    },
    monthsDelay234A,
    monthsDelay234B,
  };
}
