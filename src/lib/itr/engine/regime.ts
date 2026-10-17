import {
  ClientProfile,
  RegimeTaxBreakdown,
  DualRegimeComparison,
  TaxRegime,
} from "../types";
import { roundSec288A, roundSec288B, roundHalfUp } from "./math";
import { calculateCapitalGainsTax } from "./capitalGains";
import { computeLossSetoff } from "./losses";
import { calculateStatutoryInterest } from "./interest";

interface Slab {
  from: number;
  to: number | null;
  rate: number;
}

// New Regime Slabs (Budget 2024 onwards / FY 24-25, FY 25-26)
const NEW_REGIME_SLABS: Slab[] = [
  { from: 0, to: 300000, rate: 0.0 },
  { from: 300000, to: 700000, rate: 0.05 },
  { from: 700000, to: 1000000, rate: 0.1 },
  { from: 1000000, to: 1200000, rate: 0.15 },
  { from: 1200000, to: 1500000, rate: 0.2 },
  { from: 1500000, to: null, rate: 0.3 },
];

// Old Regime Slabs (General <60)
const OLD_REGIME_GENERAL_SLABS: Slab[] = [
  { from: 0, to: 250000, rate: 0.0 },
  { from: 250000, to: 500000, rate: 0.05 },
  { from: 500000, to: 1000000, rate: 0.2 },
  { from: 1000000, to: null, rate: 0.3 },
];

// Old Regime Slabs (Senior Citizen 60-79)
const OLD_REGIME_SENIOR_SLABS: Slab[] = [
  { from: 0, to: 300000, rate: 0.0 },
  { from: 300000, to: 500000, rate: 0.05 },
  { from: 500000, to: 1000000, rate: 0.2 },
  { from: 1000000, to: null, rate: 0.3 },
];

// Old Regime Slabs (Super Senior Citizen 80+)
const OLD_REGIME_SUPER_SENIOR_SLABS: Slab[] = [
  { from: 0, to: 500000, rate: 0.0 },
  { from: 500000, to: 1000000, rate: 0.2 },
  { from: 1000000, to: null, rate: 0.3 },
];

function computeTaxFromSlabs(taxableIncome: number, slabs: Slab[]): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const slab of slabs) {
    if (taxableIncome <= slab.from) break;
    const slabMax = slab.to ?? Infinity;
    const taxableInSlab = Math.min(taxableIncome, slabMax) - slab.from;
    tax += taxableInSlab * slab.rate;
  }
  return roundHalfUp(tax);
}

function calculateHRAExemption(
  basic: number,
  hraReceived: number,
  actualRentPaid: number,
  isMetro: boolean
): number {
  if (hraReceived <= 0 || actualRentPaid <= 0 || basic <= 0) return 0;
  const metroFactor = isMetro ? 0.5 : 0.4;
  const rentMinus10PercentBasic = Math.max(0, actualRentPaid - 0.1 * basic);
  return Math.min(hraReceived, basic * metroFactor, rentMinus10PercentBasic);
}

function calculateSurcharge(
  taxableIncome: number,
  baseTax: number,
  regime: TaxRegime
): { surcharge: number; marginalRelief: number } {
  if (taxableIncome <= 5000000) return { surcharge: 0, marginalRelief: 0 };

  let rate = 0;
  let threshold = 5000000;

  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    rate = 0.1;
    threshold = 5000000;
  } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
    rate = 0.15;
    threshold = 10000000;
  } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
    rate = 0.25;
    threshold = 20000000;
  } else if (taxableIncome > 50000000) {
    rate = regime === "new" ? 0.25 : 0.37; // Capped at 25% under New Regime
    threshold = 50000000;
  }

  const rawSurcharge = roundHalfUp(baseTax * rate);

  // Surcharge Marginal Relief:
  // (Total Tax + Surcharge) cannot exceed (Tax on Threshold + (Taxable Income - Threshold))
  const excessIncomeOverThreshold = taxableIncome - threshold;
  // Calculate approximate tax on threshold
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_GENERAL_SLABS;
  const taxOnThreshold = computeTaxFromSlabs(threshold, slabs);

  const maxAllowableTaxAndSurcharge = taxOnThreshold + excessIncomeOverThreshold;
  const actualTaxAndSurcharge = baseTax + rawSurcharge;

  let marginalRelief = 0;
  let finalSurcharge = rawSurcharge;

  if (actualTaxAndSurcharge > maxAllowableTaxAndSurcharge) {
    marginalRelief = actualTaxAndSurcharge - maxAllowableTaxAndSurcharge;
    finalSurcharge = Math.max(0, rawSurcharge - marginalRelief);
  }

  return { surcharge: finalSurcharge, marginalRelief };
}

export function computeRegimeTax(
  profile: ClientProfile,
  regime: TaxRegime
): RegimeTaxBreakdown {
  const isNew = regime === "new";

  // 1. Salary Head
  const grossSalary = profile.salary.grossSalary + profile.salary.perquisitesValue + profile.salary.profitsInLieuOfSalary;
  const stdDeduction = isNew ? 75000 : 50000;
  const hraExemption = isNew
    ? 0
    : calculateHRAExemption(
        profile.salary.grossSalary * 0.5, // basic proxy
        profile.salary.hraReceived,
        profile.salary.actualRentPaid,
        profile.salary.isMetroCity
      );
  const ltaExemption = isNew ? 0 : profile.salary.ltaExemption;
  const profTax = isNew ? 0 : profile.salary.professionalTax;

  const netSalaryIncome = Math.max(
    0,
    grossSalary - stdDeduction - hraExemption - ltaExemption - profTax
  );

  // 2. House Property Head
  let rawHPIncome = 0;
  for (const hp of profile.houseProperties) {
    if (hp.propertyType === "SELF_OCCUPIED") {
      // In New Regime, self-occupied interest u/s 24(b) cannot be claimed!
      if (!isNew) {
        rawHPIncome -= Math.min(200000, hp.homeLoanInterest);
      }
    } else {
      // Let out property
      const nav = hp.annualGrossRent - hp.municipalTaxesPaid;
      const stdDed30 = nav > 0 ? nav * 0.3 : 0;
      const netRent = nav - stdDed30 - hp.homeLoanInterest;
      rawHPIncome += netRent;
    }
  }

  // 3. Business / Profession Head (PGBP)
  let pgbpIncome = 0;
  if (profile.presumptive.isApplicable) {
    // 44AD (6% digital, 8% cash)
    const profit44AD =
      profile.presumptive.declaredProfit44AD > 0
        ? profile.presumptive.declaredProfit44AD
        : profile.presumptive.grossTurnoverDigital * 0.06 +
          profile.presumptive.grossTurnoverCash * 0.08;

    // 44ADA (min 50% receipts)
    const profit44ADA =
      profile.presumptive.declaredProfit44ADA > 0
        ? profile.presumptive.declaredProfit44ADA
        : profile.presumptive.grossReceipts44ADA * 0.5;

    pgbpIncome = profit44AD + profit44ADA + profile.presumptive.gross44AEIncome;
  }

  // 4. Capital Gains Head
  const cgResult = calculateCapitalGainsTax(profile.capitalGains);

  // 5. Other Sources Head
  const os = profile.otherSources;
  const otherSourcesNormal =
    os.savingsBankInterest + os.fixedDepositInterest + os.dividendIncome + os.otherIncome;
  const winningSpecial = os.winningLotteriesOnlineGames; // Flat 30% u/s 115BB

  // 6. Loss Set-off enforcement
  const lossSetoffResult = computeLossSetoff({
    salaryIncome: netSalaryIncome,
    housePropertyIncome: rawHPIncome,
    pgbpIncome,
    speculativeBusinessIncome: 0,
    stcgIncome: cgResult.stcgOtherTaxableAtSlab,
    ltcgIncome: 0,
    otherSourcesIncome: otherSourcesNormal,
  });

  const grossTotalIncome =
    lossSetoffResult.grossTotalIncomeAfterSetoff +
    profile.capitalGains.stcg111A +
    profile.capitalGains.ltcg112A +
    profile.capitalGains.ltcg112Other +
    winningSpecial;

  // 7. Deductions under Chapter VI-A
  let totalDeductions = 0;
  if (isNew) {
    // Only 80CCD(2) - Employer NPS is allowed under New Regime
    totalDeductions = profile.deductions.sec80CCD2;
  } else {
    // Old Regime Deductions
    const d80C = Math.min(150000, profile.deductions.sec80C);
    const d80CCD1B = Math.min(50000, profile.deductions.sec80CCD1B);
    const d80CCD2 = profile.deductions.sec80CCD2;

    const selfCap = profile.deductions.selfSeniorCitizen ? 50000 : 25000;
    const parentCap = profile.deductions.parentsSeniorCitizen ? 50000 : 25000;
    const d80D_Self = Math.min(selfCap, profile.deductions.sec80D_Self);
    const d80D_Parents = Math.min(parentCap, profile.deductions.sec80D_Parents);
    const d80D = d80D_Self + d80D_Parents;

    const d80TTA = profile.deductions.selfSeniorCitizen
      ? 0
      : Math.min(10000, os.savingsBankInterest);
    const d80TTB = profile.deductions.selfSeniorCitizen
      ? Math.min(50000, os.savingsBankInterest + os.fixedDepositInterest)
      : 0;

    totalDeductions =
      d80C +
      d80CCD1B +
      d80CCD2 +
      d80D +
      d80TTA +
      d80TTB +
      profile.deductions.sec80E +
      profile.deductions.sec80G +
      profile.deductions.sec80GG;
  }

  // Chapter VI-A deductions cannot exceed normal gross income (excluding special rate capital gains & winnings)
  const normalGTI = lossSetoffResult.grossTotalIncomeAfterSetoff;
  const allowableDeductions = Math.min(totalDeductions, normalGTI);

  // Taxable Total Income (Rounded to nearest 10 u/s 288A)
  const taxableNormalIncome = roundSec288A(Math.max(0, normalGTI - allowableDeductions));
  const totalTaxableIncome = roundSec288A(
    taxableNormalIncome +
      profile.capitalGains.stcg111A +
      cgResult.ltcg112ATaxable +
      profile.capitalGains.ltcg112Other +
      winningSpecial
  );

  // 8. Tax Computation
  let slabs = NEW_REGIME_SLABS;
  if (!isNew) {
    if (profile.seniorCitizenStatus === "SUPER_SENIOR") {
      slabs = OLD_REGIME_SUPER_SENIOR_SLABS;
    } else if (profile.seniorCitizenStatus === "SENIOR") {
      slabs = OLD_REGIME_SENIOR_SLABS;
    } else {
      slabs = OLD_REGIME_GENERAL_SLABS;
    }
  }

  const normalTax = computeTaxFromSlabs(taxableNormalIncome, slabs);
  const specialRateTax =
    cgResult.totalSpecialRateCapitalTax + roundHalfUp(winningSpecial * 0.3);

  const initialTax = normalTax + specialRateTax;

  // 9. Section 87A Rebate & Marginal Relief
  let rebate87A = 0;
  let marginalRelief87A = 0;

  if (isNew) {
    // New Regime: 100% rebate up to ₹7,00,000 taxable income (max ₹25,000)
    if (totalTaxableIncome <= 700000) {
      rebate87A = initialTax;
    } else {
      // Marginal Relief u/s 87A:
      // Tax payable cannot exceed (Total Income - ₹7,00,000)
      const excessIncomeOver7L = totalTaxableIncome - 700000;
      if (initialTax > excessIncomeOver7L) {
        marginalRelief87A = initialTax - excessIncomeOver7L;
      }
    }
  } else {
    // Old Regime: 100% rebate up to ₹5,00,000 taxable income (max ₹12,500)
    if (totalTaxableIncome <= 500000) {
      rebate87A = Math.min(12500, initialTax);
    }
  }

  const taxAfterRebate = Math.max(0, initialTax - rebate87A - marginalRelief87A);

  // 10. Surcharge & Surcharge Marginal Relief
  const { surcharge, marginalRelief: surchargeMarginalRelief } = calculateSurcharge(
    totalTaxableIncome,
    taxAfterRebate,
    regime
  );

  // 11. Health & Education Cess (4%)
  const taxPlusSurcharge = taxAfterRebate + surcharge;
  const healthAndEducationCess = roundHalfUp(taxPlusSurcharge * 0.04);
  const grossTaxLiability = taxPlusSurcharge + healthAndEducationCess;

  // 12. Taxes Paid (TDS, Advance Tax, Self Assessment)
  let totalTDSClaimed = 0;
  for (const t of profile.tdsRecords) {
    totalTDSClaimed += t.tdsClaimed;
  }

  let totalAdvanceTaxPaid = 0;
  const advanceTaxQuarterly = {
    by15Jun: 0,
    by15Sep: 0,
    by15Dec: 0,
    by15Mar: 0,
  };

  for (const at of profile.advanceTaxInstallments) {
    totalAdvanceTaxPaid += at.amount;
    const date = at.depositDate;
    if (date <= "2025-06-15") {
      advanceTaxQuarterly.by15Jun += at.amount;
    } else if (date <= "2025-09-15") {
      advanceTaxQuarterly.by15Sep += at.amount;
    } else if (date <= "2025-12-15") {
      advanceTaxQuarterly.by15Dec += at.amount;
    } else {
      advanceTaxQuarterly.by15Mar += at.amount;
    }
  }

  const totalTaxesPaid =
    totalTDSClaimed + totalAdvanceTaxPaid + profile.selfAssessmentTax;

  // 13. Interest & Fees (234A, 234B, 234C, 234F)
  const assessedTaxForInterest = Math.max(0, grossTaxLiability - totalTDSClaimed);
  const interestResult = calculateStatutoryInterest({
    assessedTax: assessedTaxForInterest,
    advanceTaxPaid: advanceTaxQuarterly,
    dueDate: "2025-07-31",
    filingDate: new Date().toISOString().split("T")[0],
    grossTotalIncome,
    isPresumptive44AD_ADA: profile.presumptive.isApplicable,
  });

  // 14. Updated Return Additional Tax u/s 139(8A) (if applicable)
  let additionalTax139_8A = 0;
  if (profile.updatedReturn.isUpdatedReturn) {
    const taxPlusInt = grossTaxLiability + interestResult.totalInterestAndFees;
    const rate =
      profile.updatedReturn.filingPeriod === "WITHIN_12_MONTHS" ? 0.25 : 0.5;
    additionalTax139_8A = roundHalfUp(taxPlusInt * rate);
  }

  const totalTaxPlusInterest =
    grossTaxLiability +
    interestResult.totalInterestAndFees +
    additionalTax139_8A;

  // 15. Net Tax Payable or Refund (Sec 288B rounded to nearest 10)
  let netTaxPayable = 0;
  let refundDue = 0;

  if (totalTaxPlusInterest > totalTaxesPaid) {
    netTaxPayable = roundSec288B(totalTaxPlusInterest - totalTaxesPaid);
  } else {
    refundDue = roundSec288B(totalTaxesPaid - totalTaxPlusInterest);
  }

  const effectiveTaxRate =
    grossTotalIncome > 0 ? (grossTaxLiability / grossTotalIncome) * 100 : 0;

  return {
    regime,
    grossTotalIncome,
    incomeFromSalary: netSalaryIncome,
    incomeFromHouseProperty: rawHPIncome,
    incomeFromCapitalGains: cgResult.totalCapitalGainsGTI,
    incomeFromBusinessProfession: pgbpIncome,
    incomeFromOtherSources: otherSourcesNormal + winningSpecial,
    standardDeduction: stdDeduction,
    totalDeductionsChapterVIA: allowableDeductions,
    taxableTotalIncome: totalTaxableIncome,
    normalTax,
    specialRateTax,
    rebate87A,
    marginalRelief87A,
    taxAfterRebate,
    surcharge,
    surchargeMarginalRelief,
    healthAndEducationCess,
    grossTaxLiability,
    interest234A: interestResult.interest234A,
    interest234B: interestResult.interest234B,
    interest234C: interestResult.interest234C,
    lateFee234F: interestResult.lateFee234F,
    totalInterestAndFees: interestResult.totalInterestAndFees,
    additionalTax139_8A,
    totalTaxPlusInterest,
    totalTaxesPaid,
    netTaxPayable,
    refundDue,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
  };
}

export function compareRegimes(profile: ClientProfile): DualRegimeComparison {
  const oldRegime = computeRegimeTax(profile, "old");
  const newRegime = computeRegimeTax(profile, "new");

  let recommendedRegime: TaxRegime = "new";
  let taxSavings = 0;
  let summaryRationale = "";

  if (newRegime.totalTaxPlusInterest <= oldRegime.totalTaxPlusInterest) {
    recommendedRegime = "new";
    taxSavings = oldRegime.totalTaxPlusInterest - newRegime.totalTaxPlusInterest;
    summaryRationale = `New Regime saves ₹${taxSavings.toLocaleString(
      "en-IN"
    )} due to higher standard deduction (₹75,000) and lower tax brackets up to ₹15 Lakhs.`;
  } else {
    recommendedRegime = "old";
    taxSavings = newRegime.totalTaxPlusInterest - oldRegime.totalTaxPlusInterest;
    summaryRationale = `Old Regime saves ₹${taxSavings.toLocaleString(
      "en-IN"
    )} due to substantial Chapter VI-A deductions, HRA exemption, and home loan interest.`;
  }

  return {
    oldRegime,
    newRegime,
    recommendedRegime,
    taxSavings,
    summaryRationale,
  };
}
