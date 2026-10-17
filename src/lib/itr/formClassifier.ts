import { ClientProfile, FormClassificationResult, ITRFormType } from "./types";

export function classifyITRForm(profile: ClientProfile): FormClassificationResult {
  const rationale: string[] = [];
  const ineligibleForms: { form: ITRFormType; reason: string }[] = [];
  const eligibleForms: ITRFormType[] = [];

  // Updated Return takes precedence if requested
  if (profile.updatedReturn.isUpdatedReturn) {
    return {
      recommendedForm: "ITR-U",
      rationale: [
        `ITR-U (Section 139(8A)) selected: Taxpayer is filing an Updated Return for ${profile.assessmentYear} (${profile.updatedReturn.filingPeriod.replace(/_/g, " ").toLowerCase()}).`,
      ],
      eligibleForms: ["ITR-U"],
      ineligibleForms: [
        { form: "ITR-1", reason: "Standard return filing window closed; filing under Section 139(8A)." },
        { form: "ITR-2", reason: "Standard return filing window closed; filing under Section 139(8A)." },
        { form: "ITR-3", reason: "Standard return filing window closed; filing under Section 139(8A)." },
        { form: "ITR-4", reason: "Standard return filing window closed; filing under Section 139(8A)." },
      ],
    };
  }

  const grossSalary = profile.salary.grossSalary;
  const numHouseProperties = profile.houseProperties.length;
  const hasCapitalGains =
    profile.capitalGains.stcg111A > 0 ||
    profile.capitalGains.stcgOther > 0 ||
    profile.capitalGains.ltcg112A > 0 ||
    profile.capitalGains.ltcg112Other > 0;
  const hasPresumptive = profile.presumptive.isApplicable;
  const grossTurnover =
    profile.presumptive.grossTurnoverDigital +
    profile.presumptive.grossTurnoverCash +
    profile.presumptive.grossReceipts44ADA;
  const hasForeignAssets = profile.hasForeignAssetsOrIncome;
  const agriculturalIncome = profile.otherSources.agriculturalIncome;
  const isResident = profile.residentialStatus === "RES";

  const totalEstimatedIncome =
    grossSalary +
    profile.capitalGains.stcg111A +
    profile.capitalGains.stcgOther +
    profile.capitalGains.ltcg112A +
    profile.capitalGains.ltcg112Other +
    profile.otherSources.savingsBankInterest +
    profile.otherSources.fixedDepositInterest +
    profile.otherSources.dividendIncome +
    profile.otherSources.otherIncome +
    grossTurnover;

  // Evaluate ITR-1 Eligibility
  let itr1Eligible = true;
  if (!isResident) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: "Taxpayer is Non-Resident (NR) or RNOR. ITR-1 is restricted to Resident individuals.",
    });
  }
  if (totalEstimatedIncome > 5000000) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: `Total income exceeds statutory limit of ₹50 Lakhs (estimated: ₹${totalEstimatedIncome.toLocaleString("en-IN")}).`,
    });
  }
  if (hasCapitalGains) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: "Taxpayer has Capital Gains (STCG/LTCG). ITR-1 does not permit capital gains.",
    });
  }
  if (hasPresumptive || profile.presumptive.balanceSheet.proprietorCapital > 0) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: "Taxpayer has Business or Professional income (PGBP).",
    });
  }
  if (numHouseProperties > 1) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: `Taxpayer owns ${numHouseProperties} house properties. ITR-1 allows maximum 1 house property.`,
    });
  }
  if (hasForeignAssets) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: "Taxpayer holds Foreign Assets or earns Foreign Income.",
    });
  }
  if (agriculturalIncome > 5000) {
    itr1Eligible = false;
    ineligibleForms.push({
      form: "ITR-1",
      reason: `Agricultural income exceeds ₹5,000 (claimed: ₹${agriculturalIncome.toLocaleString("en-IN")}).`,
    });
  }

  if (itr1Eligible) {
    eligibleForms.push("ITR-1");
  }

  // Evaluate ITR-4 Eligibility
  let itr4Eligible = false;
  if (hasPresumptive && isResident && totalEstimatedIncome <= 5000000 && !hasCapitalGains && !hasForeignAssets && numHouseProperties <= 1 && agriculturalIncome <= 5000) {
    itr4Eligible = true;
    eligibleForms.push("ITR-4");
  } else if (hasPresumptive) {
    const reasons: string[] = [];
    if (!isResident) reasons.push("Non-resident status");
    if (totalEstimatedIncome > 5000000) reasons.push("Income exceeds ₹50 Lakhs");
    if (hasCapitalGains) reasons.push("Has capital gains");
    if (numHouseProperties > 1) reasons.push("Multiple house properties");
    if (hasForeignAssets) reasons.push("Foreign assets/income");
    ineligibleForms.push({
      form: "ITR-4",
      reason: `Presumptive scheme disqualified: ${reasons.join(", ")}.`,
    });
  }

  // Evaluate ITR-2 Eligibility
  // ITR-2 is for individuals/HUFs without business/profession (PGBP)
  if (!hasPresumptive) {
    eligibleForms.push("ITR-2");
  } else {
    ineligibleForms.push({
      form: "ITR-2",
      reason: "ITR-2 cannot be used by individuals with Business/Profession income.",
    });
  }

  // Evaluate ITR-3 Eligibility
  // ITR-3 is always eligible for any individual/HUF having business or profession
  eligibleForms.push("ITR-3");

  // Determine Recommended Form
  let recommendedForm: ITRFormType = "ITR-1";

  if (hasPresumptive) {
    if (itr4Eligible) {
      recommendedForm = "ITR-4";
      rationale.push(
        "ITR-4 (Sugam) recommended: Resident eligible for Presumptive Taxation under Section 44AD / 44ADA with turnover < ₹50 Lakhs and no capital gains."
      );
    } else {
      recommendedForm = "ITR-3";
      rationale.push(
        "ITR-3 recommended: Taxpayer has Business/Professional activities and carries capital gains, foreign assets, or turnover exceeding ITR-4 thresholds."
      );
    }
  } else if (hasCapitalGains || numHouseProperties > 1 || totalEstimatedIncome > 5000000 || hasForeignAssets || agriculturalIncome > 5000 || !isResident) {
    recommendedForm = "ITR-2";
    if (hasCapitalGains) rationale.push("Triggered by Capital Gains (Equity / Mutual Funds / Real Estate).");
    if (totalEstimatedIncome > 5000000) rationale.push(`Total income (₹${totalEstimatedIncome.toLocaleString("en-IN")}) exceeds ₹50 Lakhs.`);
    if (numHouseProperties > 1) rationale.push(`Multiple house properties (${numHouseProperties}) declared.`);
    if (hasForeignAssets) rationale.push("Taxpayer has Foreign Assets / ESOPs / Foreign Income.");
    if (!isResident) rationale.push(`Residential status is ${profile.residentialStatus}.`);
    if (agriculturalIncome > 5000) rationale.push(`Agricultural income (₹${agriculturalIncome.toLocaleString("en-IN")}) exceeds ₹5,000 threshold.`);
  } else {
    recommendedForm = "ITR-1";
    rationale.push(
      "ITR-1 (Sahaj) recommended: Resident individual with total income under ₹50 Lakhs, single house property, salary income, and other sources."
    );
  }

  return {
    recommendedForm,
    rationale,
    eligibleForms,
    ineligibleForms,
  };
}
