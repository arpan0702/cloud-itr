import {
  AISRecord,
  ClientProfile,
  ReconciliationDiffItem,
  ReconciliationSummary,
} from "../types";

export function generateReconciliationDiff(
  profile: ClientProfile,
  aisRecords: AISRecord[]
): ReconciliationSummary {
  const items: ReconciliationDiffItem[] = [];

  let totalAisReportedIncome = 0;
  let totalItrDeclaredIncome = 0;
  let totalAisTds = 0;
  let totalItrTdsClaimed = 0;

  let underReportedCount = 0;
  let excessCreditCount = 0;
  let matchedCount = 0;

  for (const ais of aisRecords) {
    totalAisReportedIncome += ais.reportedAmount;
    totalAisTds += ais.taxDeducted;

    let declaredAmount = 0;
    let claimedTds = 0;
    let categoryTitle = "";

    // Match based on category and infoCode
    if (ais.category === "SALARY") {
      categoryTitle = "Salary Income (Sec 192)";
      declaredAmount = profile.salary.grossSalary;
      const matchingTds = profile.tdsRecords.filter(
        (t) => t.type === "192_SALARY" || t.tan === ais.counterPartyIdentifier
      );
      claimedTds = matchingTds.reduce((sum, t) => sum + t.tdsClaimed, 0);
    } else if (ais.category === "INTEREST_SAVINGS") {
      categoryTitle = "Savings Bank Interest";
      declaredAmount = profile.otherSources.savingsBankInterest;
      const matchingTds = profile.tdsRecords.filter(
        (t) => t.tan === ais.counterPartyIdentifier
      );
      claimedTds = matchingTds.reduce((sum, t) => sum + t.tdsClaimed, 0);
    } else if (ais.category === "INTEREST_FD") {
      categoryTitle = "Term / Fixed Deposit Interest (Sec 194A)";
      declaredAmount = profile.otherSources.fixedDepositInterest;
      const matchingTds = profile.tdsRecords.filter(
        (t) => t.type === "194A_INTEREST" || t.tan === ais.counterPartyIdentifier
      );
      claimedTds = matchingTds.reduce((sum, t) => sum + t.tdsClaimed, 0);
    } else if (ais.category === "DIVIDEND") {
      categoryTitle = "Dividend from Equities / MFs (Sec 194K)";
      declaredAmount = profile.otherSources.dividendIncome;
      const matchingTds = profile.tdsRecords.filter(
        (t) => t.type === "194K_DIVIDEND" || t.tan === ais.counterPartyIdentifier
      );
      claimedTds = matchingTds.reduce((sum, t) => sum + t.tdsClaimed, 0);
    } else if (ais.category === "PROFESSIONAL_RECEIPTS") {
      categoryTitle = "Professional Receipts (Sec 194J)";
      declaredAmount = profile.presumptive.grossReceipts44ADA;
      const matchingTds = profile.tdsRecords.filter(
        (t) => t.type === "194J_PROFESSIONAL" || t.tan === ais.counterPartyIdentifier
      );
      claimedTds = matchingTds.reduce((sum, t) => sum + t.tdsClaimed, 0);
    } else if (ais.category === "SECURITIES_SALE") {
      categoryTitle = "Securities Sale Consideration (SFT-017)";
      declaredAmount =
        profile.capitalGains.stcg111A +
        profile.capitalGains.stcgOther +
        profile.capitalGains.ltcg112A +
        profile.capitalGains.ltcg112Other;
      claimedTds = 0;
    } else {
      categoryTitle = `Other Income / SFT (${ais.infoCode})`;
      declaredAmount = profile.otherSources.otherIncome;
      claimedTds = 0;
    }

    const amountDiff = declaredAmount - ais.reportedAmount;
    const tdsDiff = claimedTds - ais.taxDeducted;

    let status: ReconciliationDiffItem["status"] = "MATCHED";
    let actionRecommendation = "Everything matches. No action needed.";

    // Check for Under-reporting (declared < reported)
    if (amountDiff < -100) {
      status = "UNDER_REPORTED";
      underReportedCount++;
      actionRecommendation = `Risk of 143(1)(a) discrepancy notice. Increase declared ${categoryTitle} by ₹${Math.abs(
        amountDiff
      ).toLocaleString("en-IN")}.`;
    }
    // Check for Excess TDS credit claim (claimed > reported in 26AS)
    else if (tdsDiff > 100) {
      status = "EXCESS_CREDIT";
      excessCreditCount++;
      actionRecommendation = `Schema blocking risk: Claimed TDS is ₹${tdsDiff.toLocaleString(
        "en-IN"
      )} higher than 26AS. Reduce claim or verify corrected Form 16.`;
    }
    // Over-reported
    else if (amountDiff > 1000) {
      status = "OVER_REPORTED";
      actionRecommendation = "Declared amount exceeds AIS records. Safe to file.";
    } else {
      matchedCount++;
    }

    items.push({
      id: ais.id,
      category: categoryTitle,
      description: `${ais.counterPartyName} (${ais.counterPartyIdentifier})`,
      aisReportedAmount: ais.reportedAmount,
      itrDeclaredAmount: declaredAmount,
      aisTdsReported: ais.taxDeducted,
      itrTdsClaimed: claimedTds,
      amountDiff,
      tdsDiff,
      status,
      actionRecommendation,
    });
  }

  // Count total declared
  for (const item of items) {
    totalItrDeclaredIncome += item.itrDeclaredAmount;
    totalItrTdsClaimed += item.itrTdsClaimed;
  }

  const isFullyReconciled = underReportedCount === 0 && excessCreditCount === 0;

  return {
    items,
    totalAisReportedIncome,
    totalItrDeclaredIncome,
    totalAisTds,
    totalItrTdsClaimed,
    underReportedCount,
    excessCreditCount,
    matchedCount,
    isFullyReconciled,
  };
}

/**
 * 1-Click Auto-Reconcile: synchronizes AIS records into the profile
 * to fix discrepancies instantly.
 */
export function autoReconcileProfileWithAIS(
  profile: ClientProfile,
  aisRecords: AISRecord[]
): ClientProfile {
  const updated = JSON.parse(JSON.stringify(profile)) as ClientProfile;

  for (const ais of aisRecords) {
    if (ais.category === "INTEREST_SAVINGS") {
      if (updated.otherSources.savingsBankInterest < ais.reportedAmount) {
        updated.otherSources.savingsBankInterest = ais.reportedAmount;
      }
    } else if (ais.category === "INTEREST_FD") {
      if (updated.otherSources.fixedDepositInterest < ais.reportedAmount) {
        updated.otherSources.fixedDepositInterest = ais.reportedAmount;
      }
    } else if (ais.category === "DIVIDEND") {
      if (updated.otherSources.dividendIncome < ais.reportedAmount) {
        updated.otherSources.dividendIncome = ais.reportedAmount;
      }
    } else if (ais.category === "PROFESSIONAL_RECEIPTS") {
      if (updated.presumptive.grossReceipts44ADA < ais.reportedAmount) {
        updated.presumptive.grossReceipts44ADA = ais.reportedAmount;
      }
    }

    // Auto-sync TDS records if not already present or if reported TDS > claimed
    if (ais.taxDeducted > 0) {
      const existing = updated.tdsRecords.find(
        (t) => t.tan === ais.counterPartyIdentifier
      );
      if (existing) {
        existing.tdsDeducted = ais.taxDeducted;
        existing.tdsClaimed = ais.taxDeducted;
        existing.matchedWith26AS = true;
      } else {
        updated.tdsRecords.push({
          id: `tds_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          type:
            ais.category === "SALARY"
              ? "192_SALARY"
              : ais.category === "INTEREST_FD"
              ? "194A_INTEREST"
              : ais.category === "DIVIDEND"
              ? "194K_DIVIDEND"
              : "OTHER",
          tan: ais.counterPartyIdentifier,
          deductorName: ais.counterPartyName,
          grossAmount: ais.reportedAmount,
          tdsDeducted: ais.taxDeducted,
          tdsClaimed: ais.taxDeducted,
          financialYear: updated.fiscalYear,
          matchedWith26AS: true,
        });
      }
    }
  }

  updated.lastUpdated = new Date().toISOString();
  return updated;
}
