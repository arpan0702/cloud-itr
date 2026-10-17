/**
 * Statutory Loss Set-Off & Carry-Forward Matrix
 * Strictly enforces Sections 70, 71, 71(2A), 71(3A), and 74 of the Income Tax Act.
 */

export interface LossSetoffInput {
  salaryIncome: number;
  housePropertyIncome: number; // can be negative (loss)
  pgbpIncome: number; // can be negative (business loss)
  speculativeBusinessIncome: number; // can be negative
  stcgIncome: number; // can be negative (STCL)
  ltcgIncome: number; // can be negative (LTCL)
  otherSourcesIncome: number;
}

export interface LossSetoffResult {
  allowedSalary: number;
  allowedHouseProperty: number;
  allowedPGBP: number;
  allowedSTCG: number;
  allowedLTCG: number;
  allowedOtherSources: number;
  grossTotalIncomeAfterSetoff: number;
  // Unabsorbed losses to carry forward
  carriedForwardHousePropertyLoss: number;
  carriedForwardBusinessLoss: number;
  carriedForwardSpeculativeLoss: number;
  carriedForwardSTCL: number;
  carriedForwardLTCL: number;
  explanation: string[];
}

export function computeLossSetoff(input: LossSetoffInput): LossSetoffResult {
  const explanation: string[] = [];
  let salary = Math.max(0, input.salaryIncome);
  let otherSources = Math.max(0, input.otherSourcesIncome);
  let pgbp = input.pgbpIncome;
  let hp = input.housePropertyIncome;
  let stcg = input.stcgIncome;
  let ltcg = input.ltcgIncome;
  let speculative = input.speculativeBusinessIncome;

  let carriedForwardHPLoss = 0;
  let carriedForwardBusinessLoss = 0;
  let carriedForwardSpeculativeLoss = 0;
  let carriedForwardSTCL = 0;
  let carriedForwardLTCL = 0;

  // 1. Speculative Business Loss: Can only be set off against Speculative Profit
  if (speculative < 0) {
    carriedForwardSpeculativeLoss = Math.abs(speculative);
    explanation.push(
      `Speculative loss of ₹${carriedForwardSpeculativeLoss.toLocaleString("en-IN")} cannot be set off against normal income; carried forward.`
    );
    speculative = 0;
  }

  // 2. Capital Loss rules (Sec 71(3)):
  // Capital losses cannot be set off against any head other than Capital Gains.
  // LTCL can only be set off against LTCG.
  if (ltcg < 0) {
    carriedForwardLTCL = Math.abs(ltcg);
    explanation.push(
      `LTCL of ₹${carriedForwardLTCL.toLocaleString("en-IN")} can only be set off against LTCG; carried forward.`
    );
    ltcg = 0;
  }

  // STCL can be set off against STCG first, then LTCG
  if (stcg < 0) {
    const stcl = Math.abs(stcg);
    if (ltcg > 0) {
      const absorbedByLTCG = Math.min(stcl, ltcg);
      ltcg -= absorbedByLTCG;
      const unabsorbedSTCL = stcl - absorbedByLTCG;
      if (unabsorbedSTCL > 0) {
        carriedForwardSTCL = unabsorbedSTCL;
        explanation.push(
          `STCL of ₹${stcl.toLocaleString("en-IN")} partially set off against LTCG; remainder ₹${unabsorbedSTCL.toLocaleString("en-IN")} carried forward.`
        );
      } else {
        explanation.push(
          `STCL of ₹${stcl.toLocaleString("en-IN")} fully absorbed by LTCG.`
        );
      }
    } else {
      carriedForwardSTCL = stcl;
      explanation.push(
        `STCL of ₹${carriedForwardSTCL.toLocaleString("en-IN")} carried forward (no capital gains available).`
      );
    }
    stcg = 0;
  }

  // 3. House Property Loss: Section 71(3A)
  // Max set off against other heads capped at ₹2,00,000. Excess carried forward.
  if (hp < 0) {
    const rawHPLoss = Math.abs(hp);
    const maxAllowableHPLoss = Math.min(200000, rawHPLoss);
    carriedForwardHPLoss = rawHPLoss - maxAllowableHPLoss;
    if (carriedForwardHPLoss > 0) {
      explanation.push(
        `House property loss capped at ₹2,00,000 under Sec 71(3A). Excess ₹${carriedForwardHPLoss.toLocaleString("en-IN")} carried forward.`
      );
    }

    // Set off allowable HP loss against available positive heads
    let hpLossToSetoff = maxAllowableHPLoss;

    // Against Salary
    if (salary > 0 && hpLossToSetoff > 0) {
      const absorb = Math.min(salary, hpLossToSetoff);
      salary -= absorb;
      hpLossToSetoff -= absorb;
    }
    // Against PGBP
    if (pgbp > 0 && hpLossToSetoff > 0) {
      const absorb = Math.min(pgbp, hpLossToSetoff);
      pgbp -= absorb;
      hpLossToSetoff -= absorb;
    }
    // Against Other Sources
    if (otherSources > 0 && hpLossToSetoff > 0) {
      const absorb = Math.min(otherSources, hpLossToSetoff);
      otherSources -= absorb;
      hpLossToSetoff -= absorb;
    }
    // Against Capital gains
    if (stcg > 0 && hpLossToSetoff > 0) {
      const absorb = Math.min(stcg, hpLossToSetoff);
      stcg -= absorb;
      hpLossToSetoff -= absorb;
    }
    if (ltcg > 0 && hpLossToSetoff > 0) {
      const absorb = Math.min(ltcg, hpLossToSetoff);
      ltcg -= absorb;
      hpLossToSetoff -= absorb;
    }

    if (hpLossToSetoff > 0) {
      carriedForwardHPLoss += hpLossToSetoff;
    }
    hp = 0;
  }

  // 4. Business Loss (PGBP): Section 71(2A)
  // Business loss cannot be set off against Salary income!
  if (pgbp < 0) {
    let busLossToSetoff = Math.abs(pgbp);
    // Can set off against Other Sources
    if (otherSources > 0 && busLossToSetoff > 0) {
      const absorb = Math.min(otherSources, busLossToSetoff);
      otherSources -= absorb;
      busLossToSetoff -= absorb;
    }
    // Can set off against Capital Gains
    if (stcg > 0 && busLossToSetoff > 0) {
      const absorb = Math.min(stcg, busLossToSetoff);
      stcg -= absorb;
      busLossToSetoff -= absorb;
    }
    if (ltcg > 0 && busLossToSetoff > 0) {
      const absorb = Math.min(ltcg, busLossToSetoff);
      ltcg -= absorb;
      busLossToSetoff -= absorb;
    }
    if (busLossToSetoff > 0) {
      carriedForwardBusinessLoss = busLossToSetoff;
      explanation.push(
        `Business loss of ₹${carriedForwardBusinessLoss.toLocaleString("en-IN")} cannot be set off against salary u/s 71(2A); carried forward.`
      );
    }
    pgbp = 0;
  }

  const grossTotalIncomeAfterSetoff =
    salary + hp + pgbp + speculative + stcg + ltcg + otherSources;

  return {
    allowedSalary: salary,
    allowedHouseProperty: hp,
    allowedPGBP: pgbp,
    allowedSTCG: stcg,
    allowedLTCG: ltcg,
    allowedOtherSources: otherSources,
    grossTotalIncomeAfterSetoff,
    carriedForwardHousePropertyLoss: carriedForwardHPLoss,
    carriedForwardBusinessLoss,
    carriedForwardSpeculativeLoss,
    carriedForwardSTCL,
    carriedForwardLTCL,
    explanation,
  };
}
