export type ITRFormType =
  | "ITR-1"
  | "ITR-2"
  | "ITR-3"
  | "ITR-4"
  | "ITR-5"
  | "ITR-6"
  | "ITR-U";

export type AssessmentYear = "2024-25" | "2025-26" | "2026-27";
export type FiscalYear = "2023-24" | "2024-25" | "2025-26";

export type TaxRegime = "new" | "old";
export type ResidentialStatus = "RES" | "RNOR" | "NR"; // Resident, Resident but Not Ordinarily Resident, Non-Resident
export type AssesseeCategory = "IND" | "HUF" | "FIRM" | "LLP" | "COMPANY";
export type SeniorCitizenStatus = "GENERAL" | "SENIOR" | "SUPER_SENIOR"; // <60, 60-79, 80+

export interface PersonalDetails {
  pan: string;
  aadhaar: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: "M" | "F" | "O";
  fatherName?: string;
  mobile: string;
  email: string;
  flatDoorBlock?: string;
  premisesName?: string;
  roadStreet?: string;
  areaLocality?: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
  bankAccounts: BankAccountDetails[];
}

export interface BankAccountDetails {
  id: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CURRENT";
  isPrimaryForRefund: boolean;
}

export interface SalaryDetails {
  grossSalary: number; // Sec 17(1)
  perquisitesValue: number; // Sec 17(2)
  profitsInLieuOfSalary: number; // Sec 17(3)
  hraReceived: number;
  actualRentPaid: number;
  isMetroCity: boolean;
  ltaExemption: number;
  otherExemptAllowances: number;
  professionalTax: number;
  standardDeduction: number; // 75k new regime, 50k old regime
}

export interface HousePropertyDetails {
  id: string;
  propertyType: "SELF_OCCUPIED" | "LET_OUT" | "DEEMED_LET_OUT";
  annualGrossRent: number;
  municipalTaxesPaid: number;
  homeLoanInterest: number; // Sec 24(b)
  preConstructionInterest: number;
}

export interface QuarterlyAmount {
  upto15Jun: number;
  upto15Sep: number;
  upto15Dec: number;
  upto15Mar: number;
  upto31Mar?: number;
}

export interface CapitalGainsDetails {
  // STCG
  stcg111A: number; // Equity / Equity MFs with STT (20% post Budget 2024 / 15%)
  stcgOther: number; // Normal slab rate
  stcgQuarterly: QuarterlyAmount;

  // LTCG
  ltcg112A: number; // Listed equities / MFs with STT (12.5% post Budget 2024 / 10% with 1.25L exemption)
  ltcg112AExemption: number; // 1,25,000 for FY24-25/25-26
  ltcg112Other: number; // Unlisted, land, gold (12.5% / 20%)
  ltcgQuarterly: QuarterlyAmount;

  // Grandfathering (31-Jan-2018 FMV)
  grandfatheringFMVApplied: boolean;
  grandfatheringBenefitAmount?: number;
}

export interface PresumptiveDetails {
  isApplicable: boolean;
  // 44AD (Business)
  grossTurnoverDigital: number; // @ 6%
  grossTurnoverCash: number; // @ 8%
  declaredProfit44AD: number;
  natureOfBusinessDescription?: string;

  // 44ADA (Professionals)
  grossReceipts44ADA: number;
  declaredProfit44ADA: number; // min 50%
  professionCode?: string;

  // 44AE (Goods carriages)
  gross44AEIncome: number;

  // Financial Particulars of Business (Schedule BPS / Balance Sheet)
  balanceSheet: {
    sundryDebtors: number;
    sundryCreditors: number;
    cashInHand: number;
    bankBalances: number;
    inventories: number;
    fixedAssets: number;
    proprietorCapital: number;
    securedLoans: number;
    unsecuredLoans: number;
  };
}

export interface OtherSourcesDetails {
  savingsBankInterest: number;
  fixedDepositInterest: number;
  dividendIncome: number;
  dividendQuarterly: QuarterlyAmount;
  winningLotteriesOnlineGames: number; // Sec 115BB/115BBJ flat 30%
  agriculturalIncome: number; // <= 5000 in ITR-1, > 5000 triggers ITR-2
  otherIncome: number;
}

export interface ChapterVIADeductions {
  sec80C: number; // EPF, PPF, ELSS, Life Insurance, Tuition, Principal (cap 1.5L)
  sec80CCC: number;
  sec80CCD1: number;
  sec80CCD1B: number; // Additional NPS (cap 50k)
  sec80CCD2: number; // Employer NPS (allowed in both old and new regime)
  sec80D_Self: number; // Health insurance (cap 25k/50k)
  sec80D_Parents: number; // (cap 25k/50k)
  sec80D_PreventiveCheckup: number; // (cap 5k within overall)
  parentsSeniorCitizen: boolean;
  selfSeniorCitizen: boolean;
  sec80E: number; // Education loan interest
  sec80EEA: number; // Affordable housing
  sec80G: number; // Donations
  sec80GG: number; // Rent paid when no HRA
  sec80TTA: number; // Savings interest (cap 10k)
  sec80TTB: number; // Senior citizen interest (cap 50k)
  sec80U: number; // Disability
}

export interface TDSRecord {
  id: string;
  type: "192_SALARY" | "194A_INTEREST" | "194J_PROFESSIONAL" | "194K_DIVIDEND" | "OTHER";
  tan: string;
  deductorName: string;
  grossAmount: number;
  tdsDeducted: number;
  tdsClaimed: number;
  financialYear: string;
  matchedWith26AS: boolean;
}

export interface AdvanceTaxInstallment {
  id: string;
  bsrCode: string;
  challanNo: string;
  depositDate: string;
  amount: number;
}

export interface UpdatedReturnDetails {
  isUpdatedReturn: boolean; // Sec 139(8A)
  filingPeriod: "WITHIN_12_MONTHS" | "BETWEEN_12_AND_24_MONTHS";
  reasonCode: "PREVIOUSLY_NOT_FILED" | "INCOME_NOT_REPORTED" | "WRONG_HEAD_OF_INCOME" | "REDUCTION_OF_LOSSES" | "OTHERS";
  originalAckNumber?: string;
  originalFilingDate?: string;
}

export interface ClientProfile {
  id: string;
  status: "DRAFT" | "IN_REVIEW" | "VALIDATED" | "READY_TO_FILE" | "FILED";
  assessmentYear: AssessmentYear;
  fiscalYear: FiscalYear;
  regime: TaxRegime;
  residentialStatus: ResidentialStatus;
  seniorCitizenStatus: SeniorCitizenStatus;
  selectedForm: ITRFormType;
  personal: PersonalDetails;
  salary: SalaryDetails;
  houseProperties: HousePropertyDetails[];
  capitalGains: CapitalGainsDetails;
  presumptive: PresumptiveDetails;
  otherSources: OtherSourcesDetails;
  deductions: ChapterVIADeductions;
  tdsRecords: TDSRecord[];
  advanceTaxInstallments: AdvanceTaxInstallment[];
  selfAssessmentTax: number;
  updatedReturn: UpdatedReturnDetails;
  hasForeignAssetsOrIncome: boolean;
  lastUpdated: string;
}

export interface RegimeTaxBreakdown {
  regime: TaxRegime;
  grossTotalIncome: number;
  incomeFromSalary: number;
  incomeFromHouseProperty: number;
  incomeFromCapitalGains: number;
  incomeFromBusinessProfession: number;
  incomeFromOtherSources: number;
  standardDeduction: number;
  totalDeductionsChapterVIA: number;
  taxableTotalIncome: number; // Rounded nearest 10 u/s 288A
  normalTax: number;
  specialRateTax: number; // 111A, 112A, 115BB
  rebate87A: number;
  marginalRelief87A: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeMarginalRelief: number;
  healthAndEducationCess: number; // 4%
  grossTaxLiability: number;
  // Interest modules
  interest234A: number;
  interest234B: number;
  interest234C: number;
  lateFee234F: number;
  totalInterestAndFees: number;
  // Updated return additional tax
  additionalTax139_8A: number;
  totalTaxPlusInterest: number;
  totalTaxesPaid: number;
  netTaxPayable: number; // Rounded nearest 10 u/s 288B
  refundDue: number; // Rounded nearest 10 u/s 288B
  effectiveTaxRate: number;
}

export interface DualRegimeComparison {
  oldRegime: RegimeTaxBreakdown;
  newRegime: RegimeTaxBreakdown;
  recommendedRegime: TaxRegime;
  taxSavings: number;
  summaryRationale: string;
}

export interface AISRecord {
  id: string;
  source: "AIS" | "26AS";
  category: "SALARY" | "DIVIDEND" | "INTEREST_SAVINGS" | "INTEREST_FD" | "SECURITIES_SALE" | "PROFESSIONAL_RECEIPTS" | "MUTUAL_FUND_PURCHASE";
  infoCode: string;
  counterPartyName: string;
  counterPartyIdentifier: string; // TAN / PAN
  dateOrQuarter: string;
  reportedAmount: number;
  taxDeducted: number;
}

export interface ReconciliationDiffItem {
  id: string;
  category: string;
  description: string;
  aisReportedAmount: number;
  itrDeclaredAmount: number;
  aisTdsReported: number;
  itrTdsClaimed: number;
  amountDiff: number;
  tdsDiff: number;
  status: "MATCHED" | "UNDER_REPORTED" | "EXCESS_CREDIT" | "OVER_REPORTED";
  actionRecommendation: string;
}

export interface ReconciliationSummary {
  items: ReconciliationDiffItem[];
  totalAisReportedIncome: number;
  totalItrDeclaredIncome: number;
  totalAisTds: number;
  totalItrTdsClaimed: number;
  underReportedCount: number;
  excessCreditCount: number;
  matchedCount: number;
  isFullyReconciled: boolean;
}

export interface ValidationError {
  id: string;
  field: string;
  code: string;
  message: string;
  severity: "BLOCKING" | "WARNING";
  tabTarget: string;
}

export interface PreFlightAuditResult {
  isValid: boolean;
  canExportJson: boolean;
  blockingErrors: ValidationError[];
  warnings: ValidationError[];
  auditTimestamp: string;
}

export interface FormClassificationResult {
  recommendedForm: ITRFormType;
  rationale: string[];
  eligibleForms: ITRFormType[];
  ineligibleForms: { form: ITRFormType; reason: string }[];
}
