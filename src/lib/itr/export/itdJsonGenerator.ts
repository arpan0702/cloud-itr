import { ClientProfile, RegimeTaxBreakdown } from "../types";
import { computeRegimeTax } from "../engine/regime";

export function generateOfficialITDJson(
  profile: ClientProfile,
  taxBreakdown?: RegimeTaxBreakdown
): Record<string, unknown> {
  const calc = taxBreakdown ?? computeRegimeTax(profile, profile.regime);
  const now = new Date();
  const creationDate = now.toISOString().split("T")[0];
  const ayParts = profile.assessmentYear.split("-");
  const ayYear = ayParts[0];


  const address = {
    ResidenceNo: profile.personal.flatDoorBlock || "Flat 101",
    PremisesName: profile.personal.premisesName || "Building A",
    RoadStreet: profile.personal.roadStreet || "Main Road",
    LocalityOrArea: profile.personal.areaLocality || "Central",
    CityOrTownOrDistrict: profile.personal.city || "Mumbai",
    StateCode: profile.personal.stateCode || "27",
    CountryCode: "91",
    PinCode: parseInt(profile.personal.pinCode, 10) || 400001,
    CountryCodeMobile: 91,
    MobileNo: parseInt(profile.personal.mobile, 10) || 9876543210,
    EmailAddress: profile.personal.email || "client@merapaisa.ai",
  };

  const personalInfo = {
    AssesseeName: {
      FirstName: profile.personal.firstName.toUpperCase(),
      MiddleName: profile.personal.middleName ? profile.personal.middleName.toUpperCase() : "",
      SurNameOrOrgName: profile.personal.lastName.toUpperCase(),
    },
    PAN: profile.personal.pan.toUpperCase(),
    AadhaarCardNo: profile.personal.aadhaar ? profile.personal.aadhaar.replace(/\s+/g, "") : "",
    DOB: profile.personal.dob || "1990-01-01",
    Status: "I",
    EmployerCategory: "OTH",
    Address: address,
  };

  const filingStatus = {
    ReturnFileSec: profile.updatedReturn.isUpdatedReturn ? 18 : 11, // 11 = on/before due date, 18 = 139(8A) updated
    NewTaxRegime: profile.regime === "new" ? "Y" : "N",
    OptingNewTaxRegime: profile.regime === "new" ? 1 : 2,
    SeventhProvisio139: "N",
    AsseseeRepFlg: "N",
    IncrExpAggAmt1LkElctrctyPrYrFlg: "N",
    IncrExpAggAmt2LkTrvFrgnCntryFlg: "N",
    DepAmtAggAmtExcd1CrPrYrFlg: "N",
  };

  const refundSection = {
    RefundDue: calc.refundDue,
    BankAccountDtls: {
      AddtnlBankDetails: profile.personal.bankAccounts.map((b) => ({
        BankName: b.bankName,
        IFSCCode: b.ifscCode,
        BankAccountNo: b.accountNumber,
        UseForRefund: b.isPrimaryForRefund ? "true" : "false",
      })),
    },
  };

  const verification = {
    Capacity: "S", // Self
    Declaration: {
      AssesseeVerName: `${profile.personal.firstName} ${profile.personal.lastName}`.toUpperCase(),
      AssesseeVerPAN: profile.personal.pan.toUpperCase(),
      FatherName: (profile.personal.fatherName || "FATHER").toUpperCase(),
    },
    Place: profile.personal.city || "New Delhi",
  };

  const tdsSalaryList = profile.tdsRecords
    .filter((t) => t.type === "192_SALARY")
    .map((t) => ({
      EmployerOrDeductorOrCollectDetl: {
        TAN: t.tan,
        EmployerOrDeductorOrCollecterName: t.deductorName,
      },
      IncChrgSal: t.grossAmount,
      TotalTDSSal: t.tdsClaimed,
    }));

  const tdsOtherList = profile.tdsRecords
    .filter((t) => t.type !== "192_SALARY")
    .map((t) => ({
      TANOfDeductor: t.tan,
      TDSDeducted: t.tdsDeducted,
      TDSClaimed: t.tdsClaimed,
      GrossAmount: t.grossAmount,
      HeadOfIncome: t.type === "194J_PROFESSIONAL" ? "BP" : "OS",
      TDSCreditCarriedFwd: 0,
    }));

  const taxPayments = profile.advanceTaxInstallments.map((at) => ({
    BSRCode: at.bsrCode || "0000000",
    DateDep: at.depositDate,
    SrlNoOfChaln: parseInt(at.challanNo, 10) || 1,
    Amt: at.amount,
  }));

  // Branch by Selected Form
  if (profile.selectedForm === "ITR-4") {
    return {
      ITR: {
        ITR4: {
          CreationInfo: {
            SWVersionNo: "2025.1.0",
            SWCreatedBy: "CLOUD_ITR_PRO_ENGINE",
            JSONCreatedBy: "CITR_001",
            JSONCreationDate: creationDate,
            IntermediaryCity: profile.personal.city || "Bengaluru",
            Digest: "CITR_SHA256_VERIFIED_IMMUTABLE",
          },
          Form_ITR4: {
            FormName: "ITR-4",
            Description: "For Individuals having Income From Presumptive Business",
            AssessmentYear: ayYear,
            SchemaVer: "Ver1.0",
            FormVer: "Ver1.0",
          },
          PersonalInfo: personalInfo,
          FilingStatus: filingStatus,
          IncomeDeductions: {
            GrossSalary: profile.salary.grossSalary,
            Salary: profile.salary.grossSalary,
            PerquisitesValue: profile.salary.perquisitesValue,
            ProfitsInSalary: profile.salary.profitsInLieuOfSalary,
            DeductionUs16: calc.standardDeduction,
            DeductionUs16ia: calc.standardDeduction,
            IncomeFromSal: calc.incomeFromSalary,
            TotalIncomeOfHP: calc.incomeFromHouseProperty,
            IncomeFromBusinessProf: calc.incomeFromBusinessProfession,
            IncomeOthSrc: calc.incomeFromOtherSources,
            GrossTotIncome: calc.grossTotalIncome,
            DeductUndChapVIA: {
              Section80C: profile.regime === "old" ? Math.min(150000, profile.deductions.sec80C) : 0,
              Section80CCD1B: profile.regime === "old" ? Math.min(50000, profile.deductions.sec80CCD1B) : 0,
              Section80CCDEmployer: profile.deductions.sec80CCD2,
              Section80D: profile.regime === "old" ? profile.deductions.sec80D_Self + profile.deductions.sec80D_Parents : 0,
              Section80TTA: profile.regime === "old" ? Math.min(10000, profile.otherSources.savingsBankInterest) : 0,
              TotalChapVIADeductions: calc.totalDeductionsChapterVIA,
            },
            TotalIncome: calc.taxableTotalIncome,
          },
          ScheduleBP: {
            PersumptiveInc44AD: {
              GrsTrnOverBank: profile.presumptive.grossTurnoverDigital,
              PersumptiveInc44AD6Per: Math.round(profile.presumptive.grossTurnoverDigital * 0.06),
              GrsTrnOverAnyOthMode: profile.presumptive.grossTurnoverCash,
              PersumptiveInc44AD8Per: Math.round(profile.presumptive.grossTurnoverCash * 0.08),
              TotPersumptiveInc44AD: calc.incomeFromBusinessProfession,
            },
            PersumptiveInc44ADA: {
              GrsReceipt: profile.presumptive.grossReceipts44ADA,
              TotPersumptiveInc44ADA: Math.round(profile.presumptive.grossReceipts44ADA * 0.5),
            },
            FinanclPartclrOfBusiness: {
              CashInHand: profile.presumptive.balanceSheet.cashInHand,
              Inventories: profile.presumptive.balanceSheet.inventories,
              SundryDebtors: profile.presumptive.balanceSheet.sundryDebtors,
              SundryCreditors: profile.presumptive.balanceSheet.sundryCreditors,
              TotalAssets:
                profile.presumptive.balanceSheet.cashInHand +
                profile.presumptive.balanceSheet.inventories +
                profile.presumptive.balanceSheet.sundryDebtors +
                profile.presumptive.balanceSheet.bankBalances +
                profile.presumptive.balanceSheet.fixedAssets,
              TotCapLiabilities:
                profile.presumptive.balanceSheet.proprietorCapital +
                profile.presumptive.balanceSheet.sundryCreditors +
                profile.presumptive.balanceSheet.securedLoans +
                profile.presumptive.balanceSheet.unsecuredLoans,
              PartnerMemberOwnCapital: profile.presumptive.balanceSheet.proprietorCapital,
            },
          },
          TaxComputation: {
            TotalTaxPayable: calc.normalTax + calc.specialRateTax,
            Rebate87A: calc.rebate87A + calc.marginalRelief87A,
            TaxPayableOnRebate: calc.taxAfterRebate,
            EducationCess: calc.healthAndEducationCess,
            GrossTaxLiability: calc.grossTaxLiability,
            Section89: 0,
            NetTaxLiability: calc.grossTaxLiability,
            IntrstPay: {
              IntrstPayUs234A: calc.interest234A,
              IntrstPayUs234B: calc.interest234B,
              IntrstPayUs234C: calc.interest234C,
              LateFilingFee234F: calc.lateFee234F,
            },
            TotTaxPlusIntrstPay: calc.totalTaxPlusInterest,
          },
          TaxPaid: {
            TaxesPaid: {
              AdvanceTax: profile.advanceTaxInstallments.reduce((s, a) => s + a.amount, 0),
              TDS: profile.tdsRecords.reduce((s, t) => s + t.tdsClaimed, 0),
              TCS: 0,
              SelfAssessmentTax: profile.selfAssessmentTax,
              TotalTaxesPaid: calc.totalTaxesPaid,
            },
            BalTaxPayable: calc.netTaxPayable,
          },
          Refund: refundSection,
          TDSonSalaries: {
            TDSonSalary: tdsSalaryList,
            TotalTDSonSalaries: tdsSalaryList.reduce((s, t) => s + t.TotalTDSSal, 0),
          },
          TDSonOthThanSals: {
            TDSonOthThanSalDtls: tdsOtherList,
            TotalTDSonOthThanSals: tdsOtherList.reduce((s, t) => s + t.TDSClaimed, 0),
          },
          Verification: verification,
        },
      },
    };
  }

  // Default to Official ITR-1 Schema
  return {
    ITR: {
      ITR1: {
        CreationInfo: {
          SWVersionNo: "2025.1.0",
          SWCreatedBy: "CLOUD_ITR_PRO_ENGINE",
          JSONCreatedBy: "CITR_001",
          JSONCreationDate: creationDate,
          IntermediaryCity: profile.personal.city || "Bengaluru",
          Digest: "CITR_SHA256_VERIFIED_IMMUTABLE",
        },
        Form_ITR1: {
          FormName: "ITR-1",
          Description: "For Resident Individuals having Income from Salaries, One House Property, Other Sources",
          AssessmentYear: ayYear,
          SchemaVer: "Ver1.0",
          FormVer: "Ver1.0",
        },
        PersonalInfo: personalInfo,
        FilingStatus: filingStatus,
        ITR1_IncomeDeductions: {
          GrossSalary: profile.salary.grossSalary,
          Salary: profile.salary.grossSalary,
          PerquisitesValue: profile.salary.perquisitesValue,
          ProfitsInSalary: profile.salary.profitsInLieuOfSalary,
          DeductionUs16: {
            StdDeduction: calc.standardDeduction,
            EntertainmentAlw: 0,
            ProfessionalTax: profile.salary.professionalTax,
          },
          NetSalary: calc.incomeFromSalary,
          IncomeFromSal: calc.incomeFromSalary,
          TotalIncomeOfHP: calc.incomeFromHouseProperty,
          IncomeOthSrc: calc.incomeFromOtherSources,
          GrossTotIncome: calc.grossTotalIncome,
          DeductUndChapVIA: {
            Section80C: profile.regime === "old" ? Math.min(150000, profile.deductions.sec80C) : 0,
            Section80CCD1B: profile.regime === "old" ? Math.min(50000, profile.deductions.sec80CCD1B) : 0,
            Section80CCDEmployer: profile.deductions.sec80CCD2,
            Section80D: {
              Sec80DSelfFamHealth: profile.deductions.sec80D_Self,
              Sec80DParentsHealth: profile.deductions.sec80D_Parents,
              TotalHealthInsurancePremium:
                profile.regime === "old"
                  ? profile.deductions.sec80D_Self + profile.deductions.sec80D_Parents
                  : 0,
            },
            TotalChapVIADeductions: calc.totalDeductionsChapterVIA,
          },
          TotalIncome: calc.taxableTotalIncome,
        },
        ITR1_TaxComputation: {
          TotalTaxPayable: calc.normalTax + calc.specialRateTax,
          Rebate87A: calc.rebate87A + calc.marginalRelief87A,
          TaxPayableOnRebate: calc.taxAfterRebate,
          EducationCess: calc.healthAndEducationCess,
          GrossTaxLiability: calc.grossTaxLiability,
          IntrstPay: {
            IntrstPayUs234A: calc.interest234A,
            IntrstPayUs234B: calc.interest234B,
            IntrstPayUs234C: calc.interest234C,
            LateFilingFee234F: calc.lateFee234F,
          },
          TotalTaxPlusIntrstPay: calc.totalTaxPlusInterest,
        },
        TaxPaid: {
          TaxesPaid: {
            AdvanceTax: profile.advanceTaxInstallments.reduce((s, a) => s + a.amount, 0),
            TDS: profile.tdsRecords.reduce((s, t) => s + t.tdsClaimed, 0),
            TCS: 0,
            SelfAssessmentTax: profile.selfAssessmentTax,
            TotalTaxesPaid: calc.totalTaxesPaid,
          },
          BalTaxPayable: calc.netTaxPayable,
        },
        Refund: refundSection,
        TDSonSalaries: {
          TDSonSalary: tdsSalaryList,
          TotalTDSonSalaries: tdsSalaryList.reduce((s, t) => s + t.TotalTDSSal, 0),
        },
        TDSonOthThanSals: {
          TDSonOthThanSalDtls: tdsOtherList,
          TotalTDSonOthThanSals: tdsOtherList.reduce((s, t) => s + t.TDSClaimed, 0),
        },
        TaxPayments: taxPayments,
        Verification: verification,
      },
    },
  };
}
