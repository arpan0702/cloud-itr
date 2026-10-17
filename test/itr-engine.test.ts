import { test, describe } from "node:test";
import assert from "node:assert";

import { roundSec288A, roundSec288B, roundHalfUp } from "../src/lib/itr/engine/math.ts";
import { computeRegimeTax } from "../src/lib/itr/engine/regime.ts";
import { calculateCapitalGainsTax, calculateGrandfatheredCost } from "../src/lib/itr/engine/capitalGains.ts";
import { computeLossSetoff } from "../src/lib/itr/engine/losses.ts";
import { calculateStatutoryInterest } from "../src/lib/itr/engine/interest.ts";
import { classifyITRForm } from "../src/lib/itr/formClassifier.ts";
import { validateClientProfileForITD } from "../src/lib/itr/validation/schemaValidator.ts";
import { generateOfficialITDJson } from "../src/lib/itr/export/itdJsonGenerator.ts";
import { MOCK_PROFILES, MOCK_AIS_RECORDS } from "../src/lib/itr/mockProfiles.ts";
import { generateReconciliationDiff } from "../src/lib/itr/ingestion/aisReconciler.ts";

describe("Deterministic Math & Statutory Rounding (Sec 288A & 288B)", () => {
  test("Section 288A rounds total taxable income to nearest 10 rupees", () => {
    assert.strictEqual(roundSec288A(456784), 456780);
    assert.strictEqual(roundSec288A(456785), 456790);
    assert.strictEqual(roundSec288A(456789), 456790);
    assert.strictEqual(roundSec288A(1000000), 1000000);
    assert.strictEqual(roundSec288A(0), 0);
  });

  test("Section 288B rounds net tax liability or refund to nearest 10 rupees", () => {
    assert.strictEqual(roundSec288B(12344), 12340);
    assert.strictEqual(roundSec288B(12345), 12350);
    assert.strictEqual(roundSec288B(9876.49), 9880);
  });

  test("roundHalfUp avoids floating point drift", () => {
    assert.strictEqual(roundHalfUp(10.5), 11);
    assert.strictEqual(roundHalfUp(10.4), 10);
  });
});

describe("Section 87A Rebate & Marginal Relief (New Regime)", () => {
  test("Income exactly at or below 7,00,000 has ZERO tax liability under New Regime", () => {
    const profile = JSON.parse(JSON.stringify(MOCK_PROFILES[0]));
    // Set gross salary to 7,75,000. With 75,000 std deduction, taxable income is 7,00,000.
    profile.salary.grossSalary = 775000;
    profile.houseProperties = [];
    profile.otherSources = {
      savingsBankInterest: 0,
      fixedDepositInterest: 0,
      dividendIncome: 0,
      dividendQuarterly: { upto15Jun: 0, upto15Sep: 0, upto15Dec: 0, upto15Mar: 0 },
      winningLotteriesOnlineGames: 0,
      agriculturalIncome: 0,
      otherIncome: 0,
    };
    profile.deductions.sec80CCD2 = 0;

    const result = computeRegimeTax(profile, "new");
    assert.strictEqual(result.taxableTotalIncome, 700000);
    assert.strictEqual(result.taxAfterRebate, 0);
    assert.strictEqual(result.grossTaxLiability, 0);
  });

  test("Marginal relief u/s 87A ensures Delta Tax <= Delta Income above 7,00,000", () => {
    const profile = JSON.parse(JSON.stringify(MOCK_PROFILES[0]));
    // Taxable income = 7,15,000 (Gross = 7,90,000 - 75,000)
    profile.salary.grossSalary = 790000;
    profile.houseProperties = [];
    profile.otherSources.savingsBankInterest = 0;
    profile.otherSources.fixedDepositInterest = 0;
    profile.otherSources.dividendIncome = 0;
    profile.deductions.sec80CCD2 = 0;

    const result = computeRegimeTax(profile, "new");
    assert.strictEqual(result.taxableTotalIncome, 715000);
    // Excess over 7L is 15,000. Tax before cess cannot exceed 15,000!
    assert.ok(result.taxAfterRebate <= 15000, `Expected tax <= 15000, got ${result.taxAfterRebate}`);
  });
});

describe("Statutory Interest Engine (Sec 234A, 234B, 234C, 234F)", () => {
  test("Section 234A charges 1% per month for late filing past July 31st", () => {
    const res = calculateStatutoryInterest({
      assessedTax: 100000,
      advanceTaxPaid: { by15Jun: 0, by15Sep: 0, by15Dec: 0, by15Mar: 0 },
      dueDate: "2025-07-31",
      filingDate: "2025-09-15", // ~2 months late
      grossTotalIncome: 1200000,
    });
    assert.ok(res.interest234A > 0, "Interest 234A must be positive");
    assert.strictEqual(res.lateFee234F, 5000, "Late fee 234F for GTI > 5L is 5000");
  });

  test("Section 234B applies if advance tax is below 90% of assessed tax", () => {
    const res = calculateStatutoryInterest({
      assessedTax: 100000,
      advanceTaxPaid: { by15Jun: 10000, by15Sep: 20000, by15Dec: 20000, by15Mar: 20000 }, // Total 70k < 90k
      dueDate: "2025-07-31",
      filingDate: "2025-07-20",
      grossTotalIncome: 1500000,
    });
    assert.ok(res.interest234B > 0, "Interest 234B must trigger");
    assert.strictEqual(res.lateFee234F, 0, "No late fee if filed on or before due date");
  });

  test("Section 234C computes quarterly shortfall correctly", () => {
    const res = calculateStatutoryInterest({
      assessedTax: 100000,
      advanceTaxPaid: { by15Jun: 5000, by15Sep: 10000, by15Dec: 10000, by15Mar: 10000 },
      dueDate: "2025-07-31",
      filingDate: "2025-07-20",
      grossTotalIncome: 1200000,
    });
    assert.ok(res.interest234C > 0, "Interest 234C must be calculated for quarterly deferment");
    assert.ok(res.breakdown234C.q1Interest > 0, "Q1 shortfall must incur interest");
  });
});

describe("Capital Gains & Grandfathering Engine", () => {
  test("LTCG 112A applies 1.25L exemption and 12.5% rate", () => {
    const res = calculateCapitalGainsTax({
      stcg111A: 50000, // 20% = 10,000
      stcgOther: 0,
      stcgQuarterly: { upto15Jun: 0, upto15Sep: 0, upto15Dec: 0, upto15Mar: 0 },
      ltcg112A: 325000, // 325,000 - 125,000 = 200,000 @ 12.5% = 25,000
      ltcg112AExemption: 125000,
      ltcg112Other: 0,
      ltcgQuarterly: { upto15Jun: 0, upto15Sep: 0, upto15Dec: 0, upto15Mar: 0 },
      grandfatheringFMVApplied: false,
    });

    assert.strictEqual(res.stcg111ATax, 10000);
    assert.strictEqual(res.ltcg112ATaxable, 200000);
    assert.strictEqual(res.ltcg112ATax, 25000);
    assert.strictEqual(res.totalSpecialRateCapitalTax, 35000);
  });

  test("Section 55(2)(ac) Grandfathering Cost calculation", () => {
    // Purchased at 100 in 2016, FMV on 31-Jan-2018 was 300, Sold at 400
    // Capped FMV = min(300, 400) = 300. Max(100, 300) = 300.
    const cost1 = calculateGrandfatheredCost(100, 300, 400);
    assert.strictEqual(cost1, 300);

    // If sold at 250 (below FMV): Capped FMV = min(300, 250) = 250. Max(100, 250) = 250.
    const cost2 = calculateGrandfatheredCost(100, 300, 250);
    assert.strictEqual(cost2, 250);
  });
});

describe("Loss Set-off & Carry-Forward Matrix", () => {
  test("House Property loss set-off is capped at ₹2,00,000 u/s 71(3A)", () => {
    const res = computeLossSetoff({
      salaryIncome: 1500000,
      housePropertyIncome: -350000, // 3.5L loss
      pgbpIncome: 0,
      speculativeBusinessIncome: 0,
      stcgIncome: 0,
      ltcgIncome: 0,
      otherSourcesIncome: 0,
    });

    assert.strictEqual(res.allowedSalary, 1300000); // 15L - 2L
    assert.strictEqual(res.carriedForwardHousePropertyLoss, 150000); // 1.5L carried forward
  });

  test("Business loss cannot be set off against Salary income u/s 71(2A)", () => {
    const res = computeLossSetoff({
      salaryIncome: 800000,
      housePropertyIncome: 0,
      pgbpIncome: -200000, // 2L business loss
      speculativeBusinessIncome: 0,
      stcgIncome: 0,
      ltcgIncome: 0,
      otherSourcesIncome: 50000,
    });

    assert.strictEqual(res.allowedSalary, 800000, "Salary cannot absorb business loss");
    assert.strictEqual(res.carriedForwardBusinessLoss, 150000, "Remaining 1.5L carried forward");
  });
});

describe("Auto ITR Form Selector & Classifier", () => {
  test("Recommends ITR-1 for pure salaried resident under 50L", () => {
    const res = classifyITRForm(MOCK_PROFILES[0]);
    assert.strictEqual(res.recommendedForm, "ITR-1");
    assert.ok(res.rationale.length > 0);
  });

  test("Recommends ITR-2 when Capital Gains exist", () => {
    const res = classifyITRForm(MOCK_PROFILES[1]);
    assert.strictEqual(res.recommendedForm, "ITR-2");
    assert.ok(res.rationale.some((r) => r.includes("Capital Gains")));
  });

  test("Recommends ITR-4 for Presumptive 44AD/44ADA business", () => {
    const res = classifyITRForm(MOCK_PROFILES[2]);
    assert.strictEqual(res.recommendedForm, "ITR-4");
  });

  test("Recommends ITR-U when updated return flag is active", () => {
    const profile = JSON.parse(JSON.stringify(MOCK_PROFILES[0]));
    profile.updatedReturn.isUpdatedReturn = true;
    const res = classifyITRForm(profile);
    assert.strictEqual(res.recommendedForm, "ITR-U");
  });
});

describe("Pre-Flight Schema Validation & Gatekeeper", () => {
  test("Valid profile passes audit with canExportJson: true", () => {
    const res = validateClientProfileForITD(MOCK_PROFILES[0]);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.canExportJson, true);
    assert.strictEqual(res.blockingErrors.length, 0);
  });

  test("Invalid PAN blocks JSON generation programmatically", () => {
    const invalidProfile = JSON.parse(JSON.stringify(MOCK_PROFILES[0]));
    invalidProfile.personal.pan = "INVALID_PAN";
    const res = validateClientProfileForITD(invalidProfile);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.canExportJson, false);
    assert.ok(res.blockingErrors.some((e: { code: string }) => e.code === "ITD_SCHEMA_PAN_FMT"));
  });

  test("Unbalanced balance sheet blocks ITR-4 JSON generation", () => {
    const profile = JSON.parse(JSON.stringify(MOCK_PROFILES[2]));
    profile.presumptive.balanceSheet.proprietorCapital = 100; // Breaks balance
    const res = validateClientProfileForITD(profile);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.blockingErrors.some((e: { code: string }) => e.code === "ITD_SCHEMA_BS_UNBALANCED"));
  });
});

describe("AIS vs Declared Diff Inspector", () => {
  test("Detects under-reported income and excess tax credits", () => {
    const profile = JSON.parse(JSON.stringify(MOCK_PROFILES[0]));
    // Simulate under-reporting dividend income
    profile.otherSources.dividendIncome = 0; // AIS reported 12500
    const diff = generateReconciliationDiff(profile, MOCK_AIS_RECORDS);
    assert.ok(diff.underReportedCount > 0, "Should detect under-reported dividend");
    assert.strictEqual(diff.isFullyReconciled, false);
  });
});

describe("Official ITD JSON Generator", () => {
  test("Generates valid ITR-1 structure matching ITD portal specification", () => {
    const json = generateOfficialITDJson(MOCK_PROFILES[0]) as {
      ITR: {
        ITR1: {
          Form_ITR1: { FormName: string };
          PersonalInfo: { PAN: string };
          ITR1_TaxComputation: { GrossTaxLiability: number };
        };
      };
    };
    assert.ok(json.ITR, "Must have top level ITR");
    assert.ok(json.ITR.ITR1, "Must have ITR1 section");
    assert.strictEqual(json.ITR.ITR1.Form_ITR1.FormName, "ITR-1");
    assert.strictEqual(json.ITR.ITR1.PersonalInfo.PAN, "ABCDE1234F");
    assert.ok(json.ITR.ITR1.ITR1_TaxComputation.GrossTaxLiability >= 0);
  });

  test("Generates valid ITR-4 structure matching ITD portal specification", () => {
    const json = generateOfficialITDJson(MOCK_PROFILES[2]) as {
      ITR: {
        ITR4: {
          Form_ITR4: { FormName: string };
          ScheduleBP: {
            PersumptiveInc44ADA: { TotPersumptiveInc44ADA: number };
          };
        };
      };
    };
    assert.ok(json.ITR, "Must have top level ITR");
    assert.ok(json.ITR.ITR4, "Must have ITR4 section");
    assert.strictEqual(json.ITR.ITR4.Form_ITR4.FormName, "ITR-4");
    assert.ok(json.ITR.ITR4.ScheduleBP.PersumptiveInc44ADA.TotPersumptiveInc44ADA > 0);
  });
});
