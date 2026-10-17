import { ClientProfile, PreFlightAuditResult, ValidationError } from "../types";

export function validateClientProfileForITD(
  profile: ClientProfile
): PreFlightAuditResult {
  const blockingErrors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. PAN validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!profile.personal.pan) {
    blockingErrors.push({
      id: "ERR_PAN_MISSING",
      field: "pan",
      code: "ITD_SCHEMA_PAN_REQ",
      message: "Permanent Account Number (PAN) is mandatory.",
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  } else if (!panRegex.test(profile.personal.pan.toUpperCase())) {
    blockingErrors.push({
      id: "ERR_PAN_INVALID",
      field: "pan",
      code: "ITD_SCHEMA_PAN_FMT",
      message: `Invalid PAN format "${profile.personal.pan}". Must be 5 uppercase letters, 4 numbers, and 1 letter (e.g. ABCDE1234F).`,
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  }

  // 2. Aadhaar validation
  const aadhaarRegex = /^\d{12}$/;
  if (profile.personal.aadhaar && !aadhaarRegex.test(profile.personal.aadhaar.replace(/\s+/g, ""))) {
    blockingErrors.push({
      id: "ERR_AADHAAR_INVALID",
      field: "aadhaar",
      code: "ITD_SCHEMA_AADHAAR_FMT",
      message: "Aadhaar number must contain exactly 12 numeric digits.",
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  }

  // 3. Name & Contact
  if (!profile.personal.firstName || !profile.personal.lastName) {
    blockingErrors.push({
      id: "ERR_NAME_MISSING",
      field: "name",
      code: "ITD_SCHEMA_NAME_REQ",
      message: "First name and last name are required for ITD verification.",
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  }

  if (!profile.personal.mobile || !/^\d{10}$/.test(profile.personal.mobile)) {
    blockingErrors.push({
      id: "ERR_MOBILE_INVALID",
      field: "mobile",
      code: "ITD_SCHEMA_MOBILE_FMT",
      message: "Valid 10-digit mobile number is required.",
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  }

  // 4. Bank Account for Refund
  const primaryBank = profile.personal.bankAccounts.find((b) => b.isPrimaryForRefund);
  if (!primaryBank) {
    blockingErrors.push({
      id: "ERR_BANK_REFUND_REQ",
      field: "bankAccounts",
      code: "ITD_SCHEMA_REFUND_BANK",
      message: "At least one bank account must be nominated for tax refund credit.",
      severity: "BLOCKING",
      tabTarget: "personal",
    });
  } else {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(primaryBank.ifscCode.toUpperCase())) {
      blockingErrors.push({
        id: "ERR_IFSC_INVALID",
        field: "ifscCode",
        code: "ITD_SCHEMA_IFSC_FMT",
        message: `Invalid IFSC code "${primaryBank.ifscCode}". Must be 4 letters, zero, and 6 alphanumeric characters.`,
        severity: "BLOCKING",
        tabTarget: "personal",
      });
    }
  }

  // 5. Statutory Deduction Limits (Chapter VI-A)
  if (profile.regime === "old") {
    if (profile.deductions.sec80C > 150000) {
      warnings.push({
        id: "WARN_80C_EXCEEDED",
        field: "sec80C",
        code: "STATUTORY_CAP_80C",
        message: `Claimed Section 80C deduction (₹${profile.deductions.sec80C.toLocaleString(
          "en-IN"
        )}) exceeds statutory limit of ₹1,50,000. Engine auto-capped to ₹1,50,000.`,
        severity: "WARNING",
        tabTarget: "deductions",
      });
    }

    if (profile.deductions.sec80CCD1B > 50000) {
      warnings.push({
        id: "WARN_80CCD1B_EXCEEDED",
        field: "sec80CCD1B",
        code: "STATUTORY_CAP_80CCD1B",
        message: `Claimed NPS self-contribution exceeds statutory cap of ₹50,000. Capped automatically.`,
        severity: "WARNING",
        tabTarget: "deductions",
      });
    }

    const selfCap = profile.deductions.selfSeniorCitizen ? 50000 : 25000;
    if (profile.deductions.sec80D_Self > selfCap) {
      warnings.push({
        id: "WARN_80D_SELF_EXCEEDED",
        field: "sec80D_Self",
        code: "STATUTORY_CAP_80D",
        message: `Section 80D health insurance for self exceeds maximum allowed ₹${selfCap.toLocaleString(
          "en-IN"
        )}. Capped automatically.`,
        severity: "WARNING",
        tabTarget: "deductions",
      });
    }
  }

  // 6. TDS Claim vs 26AS Records Check
  for (const tds of profile.tdsRecords) {
    if (tds.tdsClaimed > tds.tdsDeducted + 50) {
      blockingErrors.push({
        id: `ERR_TDS_MISMATCH_${tds.id}`,
        field: "tdsClaimed",
        code: "ITD_TDS_26AS_MISMATCH",
        message: `TDS claimed (₹${tds.tdsClaimed.toLocaleString(
          "en-IN"
        )}) from deductor ${tds.deductorName} exceeds available credit (₹${tds.tdsDeducted.toLocaleString(
          "en-IN"
        )}). ITD server will reject with mismatch notice.`,
        severity: "BLOCKING",
        tabTarget: "tds",
      });
    }
  }

  // 7. Balance Sheet Balance Check (for ITR-3 / ITR-4 Presumptive / Schedule BPS)
  if (profile.presumptive.isApplicable && (profile.selectedForm === "ITR-3" || profile.selectedForm === "ITR-4")) {
    const bs = profile.presumptive.balanceSheet;
    const totalAssets =
      bs.sundryDebtors +
      bs.cashInHand +
      bs.bankBalances +
      bs.inventories +
      bs.fixedAssets;
    const totalLiabilities =
      bs.proprietorCapital +
      bs.sundryCreditors +
      bs.securedLoans +
      bs.unsecuredLoans;

    // In double-entry accounting, Assets must balance Liabilities + Capital
    // If user entered financial particulars, enforce balancing
    if (totalAssets > 0 || totalLiabilities > 0) {
      const diff = Math.abs(totalAssets - totalLiabilities);
      if (diff > 1) {
        blockingErrors.push({
          id: "ERR_BALANCE_SHEET_UNBALANCED",
          field: "balanceSheet",
          code: "ITD_SCHEMA_BS_UNBALANCED",
          message: `Schedule BPS Balance Sheet does not balance. Total Assets (₹${totalAssets.toLocaleString(
            "en-IN"
          )}) != Total Capital & Liabilities (₹${totalLiabilities.toLocaleString(
            "en-IN"
          )}). Difference: ₹${diff.toLocaleString("en-IN")}.`,
          severity: "BLOCKING",
          tabTarget: "business",
        });
      }
    }
  }

  // 8. Form-specific Schema Blocking
  if (profile.selectedForm === "ITR-1") {
    if (profile.otherSources.agriculturalIncome > 5000) {
      blockingErrors.push({
        id: "ERR_ITR1_AGRI_CAP",
        field: "agriculturalIncome",
        code: "ITD_SCHEMA_ITR1_AGRI",
        message: `ITR-1 is blocked because agricultural income (₹${profile.otherSources.agriculturalIncome.toLocaleString(
          "en-IN"
        )}) exceeds statutory limit of ₹5,000. Switch to ITR-2.`,
        severity: "BLOCKING",
        tabTarget: "form-selector",
      });
    }

    const hasCG =
      profile.capitalGains.stcg111A > 0 ||
      profile.capitalGains.stcgOther > 0 ||
      profile.capitalGains.ltcg112A > 0 ||
      profile.capitalGains.ltcg112Other > 0;
    if (hasCG) {
      blockingErrors.push({
        id: "ERR_ITR1_CG_PROHIBITED",
        field: "capitalGains",
        code: "ITD_SCHEMA_ITR1_CG",
        message: "ITR-1 does not permit Capital Gains. Switch to ITR-2 or ITR-3.",
        severity: "BLOCKING",
        tabTarget: "form-selector",
      });
    }

    if (profile.houseProperties.length > 1) {
      blockingErrors.push({
        id: "ERR_ITR1_MULTIPLE_HP",
        field: "houseProperties",
        code: "ITD_SCHEMA_ITR1_HP",
        message: "ITR-1 permits only 1 house property. Multiple properties require ITR-2.",
        severity: "BLOCKING",
        tabTarget: "form-selector",
      });
    }
  }

  const isValid = blockingErrors.length === 0;
  const canExportJson = isValid;

  return {
    isValid,
    canExportJson,
    blockingErrors,
    warnings,
    auditTimestamp: new Date().toISOString(),
  };
}
