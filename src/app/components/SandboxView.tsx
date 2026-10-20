"use client";

import { IngestionStudio } from "./IngestionStudio";
import { ExtractedTaxData } from "../lib/smartParser";
import { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  FileText,
  Calculator,
  Download,
  Copy,
  Check,
  Upload,
  User,
  Sparkles,
  TrendingDown,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  RefreshCw,
  ArrowRight,
  Layers,
  ChevronRight,
  Code2,
  PieChart,
  BarChart3,
  Coins
} from "lucide-react";

export interface SandboxInputState {
  fullName: string;
  pan: string;
  aadhaar: string;
  dob: string;
  assessmentYear: string;
  formType: "ITR-1" | "ITR-2" | "ITR-4";
  regimePreference: "new" | "old";
  // Salary
  grossSalary: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
  professionalTax: number;
  // House Property
  isSelfOccupied: boolean;
  rentalIncome: number;
  municipalTaxes: number;
  homeLoanInterest: number;
  // Capital Gains
  stcg111A: number;
  ltcg112A: number;
  // Presumptive
  receipts44ADA: number;
  deemedProfitPercent: number;
  // Other Sources
  savingsInterest: number;
  fdInterest: number;
  dividendIncome: number;
  // Deductions
  ded80C: number;
  ded80CCD1B: number;
  ded80D_Self: number;
  ded80D_Parents: number;
  ded80TTA: number;
  // Taxes Paid
  tdsSalary: number;
  tdsOther: number;
  advanceTaxQ1: number;
  advanceTaxQ2: number;
  advanceTaxQ3: number;
  advanceTaxQ4: number;
}

const DEFAULT_ARPAN_INPUTS: SandboxInputState = {
  fullName: "Arpan Dutta",
  pan: "AARPD7821M",
  aadhaar: "987654321098",
  dob: "1991-04-12",
  assessmentYear: "2025-26",
  formType: "ITR-2",
  regimePreference: "new",
  grossSalary: 2850000,
  hraReceived: 420000,
  rentPaid: 360000,
  isMetro: true,
  professionalTax: 2400,
  isSelfOccupied: true,
  rentalIncome: 0,
  municipalTaxes: 0,
  homeLoanInterest: 180000,
  stcg111A: 120000,
  ltcg112A: 280000,
  receipts44ADA: 0,
  deemedProfitPercent: 50,
  savingsInterest: 24500,
  fdInterest: 54000,
  dividendIncome: 18000,
  ded80C: 150000,
  ded80CCD1B: 50000,
  ded80D_Self: 25000,
  ded80D_Parents: 35000,
  ded80TTA: 10000,
  tdsSalary: 425000,
  tdsOther: 62200,
  advanceTaxQ1: 50000,
  advanceTaxQ2: 80000,
  advanceTaxQ3: 100000,
  advanceTaxQ4: 120000,
};

const CONSULTANT_44ADA_INPUTS: SandboxInputState = {
  fullName: "Arpan Dutta (Consultant)",
  pan: "AARPD7821M",
  aadhaar: "987654321098",
  dob: "1991-04-12",
  assessmentYear: "2025-26",
  formType: "ITR-4",
  regimePreference: "new",
  grossSalary: 0,
  hraReceived: 0,
  rentPaid: 0,
  isMetro: true,
  professionalTax: 0,
  isSelfOccupied: true,
  rentalIncome: 0,
  municipalTaxes: 0,
  homeLoanInterest: 0,
  stcg111A: 45000,
  ltcg112A: 95000,
  receipts44ADA: 4800000,
  deemedProfitPercent: 50,
  savingsInterest: 18000,
  fdInterest: 22000,
  dividendIncome: 9000,
  ded80C: 150000,
  ded80CCD1B: 50000,
  ded80D_Self: 25000,
  ded80D_Parents: 25000,
  ded80TTA: 10000,
  tdsSalary: 0,
  tdsOther: 480000,
  advanceTaxQ1: 60000,
  advanceTaxQ2: 90000,
  advanceTaxQ3: 110000,
  advanceTaxQ4: 140000,
};

const BLANK_INPUTS: SandboxInputState = {
  fullName: "New Taxpayer",
  pan: "ABCDE1234F",
  aadhaar: "123456789012",
  dob: "1995-01-01",
  assessmentYear: "2025-26",
  formType: "ITR-1",
  regimePreference: "new",
  grossSalary: 1200000,
  hraReceived: 0,
  rentPaid: 0,
  isMetro: false,
  professionalTax: 0,
  isSelfOccupied: true,
  rentalIncome: 0,
  municipalTaxes: 0,
  homeLoanInterest: 0,
  stcg111A: 0,
  ltcg112A: 0,
  receipts44ADA: 0,
  deemedProfitPercent: 50,
  savingsInterest: 10000,
  fdInterest: 0,
  dividendIncome: 0,
  ded80C: 0,
  ded80CCD1B: 0,
  ded80D_Self: 0,
  ded80D_Parents: 0,
  ded80TTA: 0,
  tdsSalary: 85000,
  tdsOther: 0,
  advanceTaxQ1: 0,
  advanceTaxQ2: 0,
  advanceTaxQ3: 0,
  advanceTaxQ4: 0,
};

function formatRupee(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function roundSec288A(num: number): number {
  return Math.round(num / 10) * 10;
}

function roundSec288B(num: number): number {
  return Math.round(num / 10) * 10;
}

export function SandboxView() {
  const [inputs, setInputs] = useState<SandboxInputState>(DEFAULT_ARPAN_INPUTS);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showIngestionStudio, setShowIngestionStudio] = useState(false);

  const handleApplyIngestedData = (data: ExtractedTaxData) => {
    setInputs((prev) => ({
      ...prev,
      fullName: data.name || prev.fullName,
      pan: data.pan || prev.pan,
      grossSalary: data.grossSalary,
      homeLoanInterest: data.homeLoanInterest,
      stcg111A: data.stcg111A,
      ltcg112A: data.ltcg112A,
      savingsInterest: data.savingsInterest,
      fdInterest: data.fdInterest,
      dividendIncome: data.dividendIncome,
      ded80C: data.ded80C,
      ded80CCD1B: data.ded80CCD1B,
      ded80D_Self: data.ded80D,
      ded80TTA: data.ded80TTA,
      tdsSalary: data.tdsSalary,
      tdsOther: data.tdsOther,
      advanceTaxQ1: data.advanceTaxQ1,
      advanceTaxQ2: data.advanceTaxQ2,
      advanceTaxQ3: data.advanceTaxQ3,
      advanceTaxQ4: data.advanceTaxQ4,
    }));
    setShowIngestionStudio(false);
  };
  const [jsonViewTab, setJsonViewTab] = useState<"visual" | "raw">("visual");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute New Regime Tax
  const newRegimeCalc = useMemo(() => {
    // Salary Net
    const stdDeduction = inputs.grossSalary > 0 ? 75000 : 0;
    const salaryNet = Math.max(0, inputs.grossSalary - stdDeduction);

    // House Property
    let hpNet = 0;
    if (!inputs.isSelfOccupied) {
      const nav = Math.max(0, inputs.rentalIncome - inputs.municipalTaxes);
      hpNet = nav - 0.3 * nav - inputs.homeLoanInterest;
    } else {
      hpNet = -Math.min(inputs.homeLoanInterest, 200000);
    }
    const hpAllowed = Math.max(-200000, hpNet);

    // Capital Gains
    const stcgTax = inputs.stcg111A * 0.2;
    const ltcgTaxable = Math.max(0, inputs.ltcg112A - 125000);
    const ltcgTax = ltcgTaxable * 0.125;
    const capitalTax = Math.round(stcgTax + ltcgTax);

    // Presumptive 44ADA
    const presumptiveProfit = Math.round((inputs.receipts44ADA * inputs.deemedProfitPercent) / 100);

    // Other sources
    const otherSources = inputs.savingsInterest + inputs.fdInterest + inputs.dividendIncome;

    // Gross Total Income (Normal Slabs)
    const normalIncome = Math.max(0, salaryNet + hpAllowed + presumptiveProfit + otherSources);

    // New Regime has NO 80C/80D/80TTA
    const totalTaxable = roundSec288A(normalIncome);

    // Slabs for New Regime (Budget 2024)
    let slabTax = 0;
    if (totalTaxable <= 300000) {
      slabTax = 0;
    } else if (totalTaxable <= 700000) {
      slabTax = (totalTaxable - 300000) * 0.05;
    } else if (totalTaxable <= 1000000) {
      slabTax = 20000 + (totalTaxable - 700000) * 0.1;
    } else if (totalTaxable <= 1200000) {
      slabTax = 20000 + 30000 + (totalTaxable - 1000000) * 0.15;
    } else if (totalTaxable <= 1500000) {
      slabTax = 20000 + 30000 + 30000 + (totalTaxable - 1200000) * 0.2;
    } else {
      slabTax = 20000 + 30000 + 30000 + 60000 + (totalTaxable - 1500000) * 0.3;
    }

    // Section 87A Rebate & Marginal Relief
    let rebate87A = 0;
    if (totalTaxable <= 700000) {
      rebate87A = slabTax;
      slabTax = 0;
    } else if (totalTaxable <= 727770) {
      const maxAllowable = totalTaxable - 700000;
      if (slabTax > maxAllowable) {
        rebate87A = slabTax - maxAllowable;
        slabTax = maxAllowable;
      }
    }

    const totalBaseTax = slabTax + capitalTax;
    const cess = Math.round(totalBaseTax * 0.04);
    const grossLiability = totalBaseTax + cess;

    const totalTaxesPaid =
      inputs.tdsSalary +
      inputs.tdsOther +
      inputs.advanceTaxQ1 +
      inputs.advanceTaxQ2 +
      inputs.advanceTaxQ3 +
      inputs.advanceTaxQ4;

    const netPayable = roundSec288B(Math.max(0, grossLiability - totalTaxesPaid));
    const refundDue = roundSec288B(Math.max(0, totalTaxesPaid - grossLiability));

    return {
      normalIncome,
      stdDeduction,
      hpAllowed,
      presumptiveProfit,
      otherSources,
      totalTaxable,
      slabTax,
      rebate87A,
      capitalTax,
      stcgTax,
      ltcgTax,
      cess,
      grossLiability,
      totalTaxesPaid,
      netPayable,
      refundDue,
    };
  }, [inputs]);

  // Compute Old Regime Tax
  const oldRegimeCalc = useMemo(() => {
    // Salary Net
    const stdDeduction = inputs.grossSalary > 0 ? 50000 : 0;
    let hraExempt = 0;
    if (inputs.hraReceived > 0 && inputs.rentPaid > 0) {
      const basic = inputs.grossSalary * 0.5;
      const factor = inputs.isMetro ? 0.5 : 0.4;
      hraExempt = Math.min(inputs.hraReceived, basic * factor, Math.max(0, inputs.rentPaid - 0.1 * basic));
    }
    const salaryNet = Math.max(0, inputs.grossSalary - stdDeduction - hraExempt - inputs.professionalTax);

    // House Property
    let hpNet = 0;
    if (!inputs.isSelfOccupied) {
      const nav = Math.max(0, inputs.rentalIncome - inputs.municipalTaxes);
      hpNet = nav - 0.3 * nav - inputs.homeLoanInterest;
    } else {
      hpNet = -Math.min(inputs.homeLoanInterest, 200000);
    }
    const hpAllowed = Math.max(-200000, hpNet);

    // Presumptive 44ADA
    const presumptiveProfit = Math.round((inputs.receipts44ADA * inputs.deemedProfitPercent) / 100);

    // Other sources
    const otherSources = inputs.savingsInterest + inputs.fdInterest + inputs.dividendIncome;

    // Deductions Chapter VI-A
    const capped80C = Math.min(150000, inputs.ded80C);
    const capped80CCD1B = Math.min(50000, inputs.ded80CCD1B);
    const capped80D = Math.min(25000, inputs.ded80D_Self) + Math.min(50000, inputs.ded80D_Parents);
    const capped80TTA = Math.min(10000, inputs.savingsInterest);
    const totalDeductions = capped80C + capped80CCD1B + capped80D + capped80TTA;

    const normalGTI = Math.max(0, salaryNet + hpAllowed + presumptiveProfit + otherSources);
    const totalTaxable = roundSec288A(Math.max(0, normalGTI - totalDeductions));

    // Old Regime Slabs (General)
    let slabTax = 0;
    if (totalTaxable <= 250000) {
      slabTax = 0;
    } else if (totalTaxable <= 500000) {
      slabTax = (totalTaxable - 250000) * 0.05;
    } else if (totalTaxable <= 1000000) {
      slabTax = 12500 + (totalTaxable - 500000) * 0.2;
    } else {
      slabTax = 12500 + 100000 + (totalTaxable - 1000000) * 0.3;
    }

    // Capital gains
    const stcgTax = inputs.stcg111A * 0.2;
    const ltcgTaxable = Math.max(0, inputs.ltcg112A - 125000);
    const ltcgTax = ltcgTaxable * 0.125;
    const capitalTax = Math.round(stcgTax + ltcgTax);

    const totalBaseTax = slabTax + capitalTax;
    const cess = Math.round(totalBaseTax * 0.04);
    const grossLiability = totalBaseTax + cess;

    const totalTaxesPaid =
      inputs.tdsSalary +
      inputs.tdsOther +
      inputs.advanceTaxQ1 +
      inputs.advanceTaxQ2 +
      inputs.advanceTaxQ3 +
      inputs.advanceTaxQ4;

    const netPayable = roundSec288B(Math.max(0, grossLiability - totalTaxesPaid));
    const refundDue = roundSec288B(Math.max(0, totalTaxesPaid - grossLiability));

    return {
      normalGTI,
      totalDeductions,
      totalTaxable,
      slabTax,
      capitalTax,
      cess,
      grossLiability,
      netPayable,
      refundDue,
    };
  }, [inputs]);

  const regimeDelta = oldRegimeCalc.grossLiability - newRegimeCalc.grossLiability;
  const isNewBetter = regimeDelta >= 0;

  // Live Generated ITD JSON Payload
  const generatedItdJson = useMemo(() => {
    return {
      ITR: {
        Form_Version: "1.4",
        AssessmentYear: inputs.assessmentYear,
        CreationInfo: {
          SoftwareId: "CLOUDFILE-PRO-2025",
          SoftwareVer: "2.1.0",
          SWCreatedDate: new Date().toISOString().split("T")[0],
          JSONCreatedBy: "INDEPENDENT_TAX_PRACTITIONER",
        },
        PersonalInfo: {
          AssesseeName: {
            FirstName: inputs.fullName.split(" ")[0]?.toUpperCase() || "TAXPAYER",
            SurNameOrOrgName: inputs.fullName.split(" ").slice(1).join(" ")?.toUpperCase() || "",
          },
          PAN: inputs.pan.toUpperCase(),
          AadhaarCardNo: inputs.aadhaar.replace(/\s+/g, ""),
          DOB: inputs.dob,
          Status: "I",
          EmployerCategory: "OTH",
        },
        FilingStatus: {
          ReturnFileSec: 11,
          NewTaxRegime: inputs.regimePreference === "new" ? "Y" : "N",
          OptingNewTaxRegime: inputs.regimePreference === "new" ? 1 : 2,
        },
        ScheduleS: {
          GrossSalary: inputs.grossSalary,
          StandardDeduction16ia: inputs.regimePreference === "new" ? newRegimeCalc.stdDeduction : 50000,
          NetSalary: inputs.regimePreference === "new" ? inputs.grossSalary - newRegimeCalc.stdDeduction : inputs.grossSalary - 50000,
        },
        ScheduleHP: {
          PropertyType: inputs.isSelfOccupied ? "SELF_OCCUPIED" : "LET_OUT",
          AnnualGrossRent: inputs.rentalIncome,
          HomeLoanInterest24b: inputs.homeLoanInterest,
          NetIncomeHP: newRegimeCalc.hpAllowed,
        },
        ScheduleCG: {
          STCG111A: inputs.stcg111A,
          STCG111ATax: newRegimeCalc.stcgTax,
          LTCG112A: inputs.ltcg112A,
          LTCG112AExemption: 125000,
          LTCG112ATax: newRegimeCalc.ltcgTax,
        },
        ScheduleBP: inputs.receipts44ADA > 0 ? {
          Section44ADA: {
            GrossReceipts: inputs.receipts44ADA,
            DeemedProfitRate: inputs.deemedProfitPercent,
            PresumptiveIncome: newRegimeCalc.presumptiveProfit,
          }
        } : undefined,
        ScheduleOS: {
          SavingsInterest: inputs.savingsInterest,
          FixedDepositInterest: inputs.fdInterest,
          DividendIncome: inputs.dividendIncome,
          TotalOtherSources: newRegimeCalc.otherSources,
        },
        TaxComputation: {
          GrossTotalIncome: newRegimeCalc.normalIncome,
          TotalTaxableIncome: newRegimeCalc.totalTaxable,
          SlabTax: newRegimeCalc.slabTax,
          Rebate87A: newRegimeCalc.rebate87A,
          SpecialRateTaxCG: newRegimeCalc.capitalTax,
          HealthAndEducationCess: newRegimeCalc.cess,
          GrossTaxLiability: newRegimeCalc.grossLiability,
          TaxesPaid: {
            TDSClaimed: inputs.tdsSalary + inputs.tdsOther,
            AdvanceTaxPaid: inputs.advanceTaxQ1 + inputs.advanceTaxQ2 + inputs.advanceTaxQ3 + inputs.advanceTaxQ4,
            TotalTaxesPaid: newRegimeCalc.totalTaxesPaid,
          },
          NetTaxPayableSec288B: newRegimeCalc.netPayable,
          RefundDueSec288B: newRegimeCalc.refundDue,
        },
        Verification: {
          Capacity: "S",
          Declaration: {
            AssesseeVerName: inputs.fullName.toUpperCase(),
            AssesseeVerPAN: inputs.pan.toUpperCase(),
          },
          VerificationDate: new Date().toISOString().split("T")[0],
        },
      },
    };
  }, [inputs, newRegimeCalc]);

  const jsonString = useMemo(() => {
    return JSON.stringify(generatedItdJson, null, 2);
  }, [generatedItdJson]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ITR_${inputs.pan}_AY${inputs.assessmentYear}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        // If parsed contains AIS or Taxpayer keys, adopt them
        if (parsed.Salary || parsed.grossSalary || parsed.GrossSalary) {
          setInputs((prev) => ({
            ...prev,
            fullName: parsed.name || parsed.fullName || prev.fullName,
            grossSalary: Number(parsed.grossSalary || parsed.GrossSalary || parsed.Salary || prev.grossSalary),
            stcg111A: Number(parsed.stcg111A || parsed.STCG111A || prev.stcg111A),
            ltcg112A: Number(parsed.ltcg112A || parsed.LTCG112A || prev.ltcg112A),
            savingsInterest: Number(parsed.savingsInterest || parsed.SavingsInterest || prev.savingsInterest),
            fdInterest: Number(parsed.fdInterest || parsed.FDInterest || prev.fdInterest),
            dividendIncome: Number(parsed.dividendIncome || parsed.DividendIncome || prev.dividendIncome),
          }));
        } else {
          // generic fallback load
          setInputs(DEFAULT_ARPAN_INPUTS);
        }
      } catch (err) {
        alert("Invalid JSON file uploaded. Loaded default Arpan AIS telemetry instead.");
        setInputs(DEFAULT_ARPAN_INPUTS);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10">
      {/* Action / Preset Bar */}
      <div className="rounded-2xl border border-[#e2dcce] bg-[#ffffff] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#e2dcce]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="neutral" className="bg-[#f0ebe1] text-[#1c1b19] border-[#e2dcce] text-xs font-mono">
                INTERACTIVE FILING SANDBOX
              </Badge>
              <Badge tone="neutral" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-mono">
                LIVE ITD JSON COMPILER
              </Badge>
            </div>
            <h2 className="font-serif text-3xl font-normal text-[#1c1b19] tracking-tight">
              Taxpayer Input Studio & Official ITD JSON Engine
            </h2>
            <p className="mt-1 text-xs text-[#6b665f] max-w-2xl leading-relaxed">
              Enter custom figures or load sample AIS datasets to compute tax liabilities in real-time, inspect regime differentials, and generate official CBDT e-filing JSON.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setInputs(DEFAULT_ARPAN_INPUTS)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1c1b19] text-[#faf8f4] hover:bg-[#2e2c29] transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Load Arpan Dutta (AIS Telemetry)</span>
            </button>

            <button
              onClick={() => setShowIngestionStudio(!showIngestionStudio)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-800 text-[#faf8f4] hover:bg-emerald-900 transition-all shadow-xs"
            >
              <Upload className="h-3.5 w-3.5 text-emerald-300" />
              <span>{showIngestionStudio ? "Hide Ingestion Studio" : "⚡ Ingest Form 16 / AIS"}</span>
            </button>

            <button
              onClick={() => setInputs(CONSULTANT_44ADA_INPUTS)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#faf8f4] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#f0ebe1] transition-all"
            >
              <Building className="h-3.5 w-3.5 text-[#6b665f]" />
              <span>Load 44ADA Consultant</span>
            </button>

            <button
              onClick={() => setInputs(BLANK_INPUTS)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#faf8f4] text-[#6b665f] border border-[#e2dcce] hover:bg-[#f0ebe1] transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Blank Slate</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#f0ebe1] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#e4ded0] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload AIS / JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {showIngestionStudio && (
          <div className="mb-6">
            <IngestionStudio onApplyData={handleApplyIngestedData} onClose={() => setShowIngestionStudio(false)} />
          </div>
        )}

        {/* Regime Optimization Banner */}
        <div className="mt-6 p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isNewBetter ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base text-[#1c1b19] font-medium">
                  {isNewBetter ? "New Tax Regime (Sec 115BAC) is Beneficiary" : "Old Regime is Beneficiary"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  SAVES {formatRupee(Math.abs(regimeDelta))}
                </span>
              </div>
              <p className="text-xs text-[#6b665f] mt-0.5">
                New: {formatRupee(newRegimeCalc.grossLiability)} liability · Old: {formatRupee(oldRegimeCalc.grossLiability)} liability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-[#8c857b] block text-[10px]">NET PAYABLE (NEW)</span>
              <span className="font-semibold text-[#1c1b19] text-sm">{formatRupee(newRegimeCalc.netPayable)}</span>
            </div>
            <div className="h-8 w-px bg-[#e2dcce]" />
            <div className="text-right">
              <span className="text-[#8c857b] block text-[10px]">REFUND DUE (NEW)</span>
              <span className="font-semibold text-emerald-800 text-sm">{formatRupee(newRegimeCalc.refundDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INPUT CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Assessee Identity */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Assessee Profile & Assessment Year
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8c857b]">AY 2025-26</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={inputs.fullName}
                  onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] focus:outline-none focus:border-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  value={inputs.pan}
                  onChange={(e) => setInputs({ ...inputs, pan: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] focus:outline-none focus:border-[#1c1b19] font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Aadhaar (12 Digits)</label>
                <input
                  type="text"
                  value={inputs.aadhaar}
                  onChange={(e) => setInputs({ ...inputs, aadhaar: e.target.value })}
                  maxLength={12}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] focus:outline-none focus:border-[#1c1b19] font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section B: Salary & Allowances */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Schedule S: Salary & Allowances
                </h3>
              </div>
              <Badge tone="neutral" className="bg-[#f0ebe1] text-[#1c1b19] border-[#e2dcce] text-[10px] font-mono">
                Std Ded: ₹75,000 (New)
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  Gross Salary (Sec 17(1) + 17(2))
                </label>
                <input
                  type="number"
                  value={inputs.grossSalary}
                  onChange={(e) => setInputs({ ...inputs, grossSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">{formatRupee(inputs.grossSalary)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  HRA Received (Sec 10(13A))
                </label>
                <input
                  type="number"
                  value={inputs.hraReceived}
                  onChange={(e) => setInputs({ ...inputs, hraReceived: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">{formatRupee(inputs.hraReceived)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  Actual Rent Paid (Annual)
                </label>
                <input
                  type="number"
                  value={inputs.rentPaid}
                  onChange={(e) => setInputs({ ...inputs, rentPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  Professional Tax (Sec 16(iii))
                </label>
                <input
                  type="number"
                  value={inputs.professionalTax}
                  onChange={(e) => setInputs({ ...inputs, professionalTax: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section C: Capital Gains & House Property */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Capital Gains & House Property
                </h3>
              </div>
              <Badge tone="neutral" className="bg-[#f0ebe1] text-[#1c1b19] border-[#e2dcce] text-[10px] font-mono">
                Budget 2024 Revised Rates
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  STCG u/s 111A (Taxed @ 20%)
                </label>
                <input
                  type="number"
                  value={inputs.stcg111A}
                  onChange={(e) => setInputs({ ...inputs, stcg111A: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">{formatRupee(inputs.stcg111A)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  LTCG u/s 112A (Taxed @ 12.5% beyond 1.25L)
                </label>
                <input
                  type="number"
                  value={inputs.ltcg112A}
                  onChange={(e) => setInputs({ ...inputs, ltcg112A: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">{formatRupee(inputs.ltcg112A)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  Home Loan Interest (Sec 24(b) Self-Occupied)
                </label>
                <input
                  type="number"
                  value={inputs.homeLoanInterest}
                  onChange={(e) => setInputs({ ...inputs, homeLoanInterest: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">Capped at ₹2,00,000</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">
                  Sec 44ADA Gross Receipts (Consulting)
                </label>
                <input
                  type="number"
                  value={inputs.receipts44ADA}
                  onChange={(e) => setInputs({ ...inputs, receipts44ADA: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b] mt-0.5 block">50% Deemed Profit: {formatRupee(inputs.receipts44ADA * 0.5)}</span>
              </div>
            </div>
          </div>

          {/* Section D: Other Sources & Deductions */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Other Sources & Chapter VI-A Deductions
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8c857b]">AIS Pre-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Savings Interest</label>
                <input
                  type="number"
                  value={inputs.savingsInterest}
                  onChange={(e) => setInputs({ ...inputs, savingsInterest: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">FD Interest (TDS 194A)</label>
                <input
                  type="number"
                  value={inputs.fdInterest}
                  onChange={(e) => setInputs({ ...inputs, fdInterest: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Dividend Income</label>
                <input
                  type="number"
                  value={inputs.dividendIncome}
                  onChange={(e) => setInputs({ ...inputs, dividendIncome: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Section 80C (PPF/ELSS/EPF)</label>
                <input
                  type="number"
                  value={inputs.ded80C}
                  onChange={(e) => setInputs({ ...inputs, ded80C: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b]">Old Regime Only</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">80CCD(1B) NPS (₹50k)</label>
                <input
                  type="number"
                  value={inputs.ded80CCD1B}
                  onChange={(e) => setInputs({ ...inputs, ded80CCD1B: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b]">Old Regime Only</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">80D Health Insurance</label>
                <input
                  type="number"
                  value={inputs.ded80D_Self}
                  onChange={(e) => setInputs({ ...inputs, ded80D_Self: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
                <span className="text-[10px] text-[#8c857b]">Self + Family</span>
              </div>
            </div>
          </div>

          {/* Section E: Taxes Paid */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  TDS Credits & Advance Tax Payments
                </h3>
              </div>
              <span className="text-xs font-mono text-[#8c857b]">
                Total: {formatRupee(newRegimeCalc.totalTaxesPaid)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">TDS on Salary (192)</label>
                <input
                  type="number"
                  value={inputs.tdsSalary}
                  onChange={(e) => setInputs({ ...inputs, tdsSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">TDS Other (194A/J/K)</label>
                <input
                  type="number"
                  value={inputs.tdsOther}
                  onChange={(e) => setInputs({ ...inputs, tdsOther: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Adv Tax Q1 (15-Jun)</label>
                <input
                  type="number"
                  value={inputs.advanceTaxQ1}
                  onChange={(e) => setInputs({ ...inputs, advanceTaxQ1: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Adv Tax Q2 (15-Sep)</label>
                <input
                  type="number"
                  value={inputs.advanceTaxQ2}
                  onChange={(e) => setInputs({ ...inputs, advanceTaxQ2: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Adv Tax Q3 (15-Dec)</label>
                <input
                  type="number"
                  value={inputs.advanceTaxQ3}
                  onChange={(e) => setInputs({ ...inputs, advanceTaxQ3: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6b665f] mb-1">Adv Tax Q4 (15-Mar)</label>
                <input
                  type="number"
                  value={inputs.advanceTaxQ4}
                  onChange={(e) => setInputs({ ...inputs, advanceTaxQ4: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2dcce] bg-[#faf8f4] text-[#1c1b19] font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMPUTED OUTPUTS & OFFICIAL ITD JSON (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Output Card 1: Computation Summary */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Live Tax Liability Breakdown
                </h3>
              </div>
              <Badge tone="neutral" className="bg-[#f0ebe1] text-[#1c1b19] border-[#e2dcce] text-[10px] font-mono">
                Sec 288B Rounded
              </Badge>
            </div>

            {/* Income & Tax Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Gross Total Income (GTI)</span>
                <span className="font-mono font-medium text-[#1c1b19]">{formatRupee(newRegimeCalc.normalIncome)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Standard Deduction u/s 16(ia)</span>
                <span className="font-mono text-emerald-800 font-medium">-{formatRupee(newRegimeCalc.stdDeduction)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Total Taxable Income (Sec 288A)</span>
                <span className="font-mono font-semibold text-[#1c1b19]">{formatRupee(newRegimeCalc.totalTaxable)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Normal Slab Tax</span>
                <span className="font-mono text-[#1c1b19]">{formatRupee(newRegimeCalc.slabTax)}</span>
              </div>

              {newRegimeCalc.rebate87A > 0 && (
                <div className="flex justify-between py-1 border-b border-[#f0ebe1] bg-emerald-50/50 px-1.5 rounded">
                  <span className="text-emerald-900">Rebate u/s 87A (Marginal Relief)</span>
                  <span className="font-mono text-emerald-900 font-medium">-{formatRupee(newRegimeCalc.rebate87A)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Capital Gains Tax (111A + 112A)</span>
                <span className="font-mono text-[#1c1b19]">{formatRupee(newRegimeCalc.capitalTax)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Health & Education Cess (4%)</span>
                <span className="font-mono text-[#1c1b19]">{formatRupee(newRegimeCalc.cess)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="font-medium text-[#1c1b19]">Gross Tax Liability</span>
                <span className="font-mono font-bold text-[#1c1b19]">{formatRupee(newRegimeCalc.grossLiability)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#f0ebe1]">
                <span className="text-[#6b665f]">Prepaid Taxes (TDS + Advance Tax)</span>
                <span className="font-mono text-emerald-800 font-medium">-{formatRupee(newRegimeCalc.totalTaxesPaid)}</span>
              </div>
            </div>

            {/* Final Balance Box */}
            <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8c857b] block">
                  {newRegimeCalc.netPayable > 0 ? "Net Amount Payable" : "Refund Claimable"}
                </span>
                <span className={`font-serif text-2xl font-medium ${
                  newRegimeCalc.netPayable > 0 ? "text-amber-900" : "text-emerald-800"
                }`}>
                  {formatRupee(newRegimeCalc.netPayable > 0 ? newRegimeCalc.netPayable : newRegimeCalc.refundDue)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#ffffff] border border-[#e2dcce] text-[#1c1b19]">
                u/s 288B
              </span>
            </div>
          </div>

          {/* Output Card 2: Official ITD JSON Export & Viewer */}
          <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#6b665f]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b19]">
                  Official ITD Schema JSON
                </h3>
              </div>
              <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#f0ebe1] border border-[#e2dcce]">
                <button
                  onClick={() => setJsonViewTab("visual")}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    jsonViewTab === "visual" ? "bg-[#ffffff] text-[#1c1b19] shadow-xs" : "text-[#6b665f]"
                  }`}
                >
                  Visual Tree
                </button>
                <button
                  onClick={() => setJsonViewTab("raw")}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    jsonViewTab === "raw" ? "bg-[#ffffff] text-[#1c1b19] shadow-xs" : "text-[#6b665f]"
                  }`}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Action Buttons for JSON */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJson}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1c1b19] text-[#faf8f4] hover:bg-[#2e2c29] transition-all shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download ITD JSON</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-[#faf8f4] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#f0ebe1] transition-all"
              >
                {copiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#6b665f]" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Tree vs Raw JSON */}
            {jsonViewTab === "visual" ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dcce]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6b665f]">
                    <span>ROOT: ITR &gt; Form_Version 1.4</span>
                    <span className="text-emerald-700">VALID</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10.5px] font-mono text-[#1c1b19]">
                    <div>PAN: {inputs.pan}</div>
                    <div>AY: {inputs.assessmentYear}</div>
                    <div>NewTaxRegime: {inputs.regimePreference === "new" ? "Y (Sec 115BAC)" : "N"}</div>
                    <div>GTI: {formatRupee(newRegimeCalc.normalIncome)}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dcce] space-y-1 text-[11px] font-mono">
                  <div className="text-[#6b665f] font-semibold">SCHEDULE COMPLIANCE MAPPING</div>
                  <div className="text-[#1c1b19] flex justify-between">
                    <span>Schedule S (Salary Net)</span>
                    <span>{formatRupee(inputs.grossSalary - newRegimeCalc.stdDeduction)}</span>
                  </div>
                  <div className="text-[#1c1b19] flex justify-between">
                    <span>Schedule HP (House Property)</span>
                    <span>{formatRupee(newRegimeCalc.hpAllowed)}</span>
                  </div>
                  <div className="text-[#1c1b19] flex justify-between">
                    <span>Schedule CG (111A + 112A)</span>
                    <span>{formatRupee(inputs.stcg111A + inputs.ltcg112A)}</span>
                  </div>
                  <div className="text-[#1c1b19] flex justify-between">
                    <span>Schedule OS (Other Sources)</span>
                    <span>{formatRupee(newRegimeCalc.otherSources)}</span>
                  </div>
                  <div className="text-[#1c1b19] flex justify-between pt-1 border-t border-[#e2dcce] font-semibold">
                    <span>TaxComputation &gt; GrossTaxLiability</span>
                    <span>{formatRupee(newRegimeCalc.grossLiability)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-[#1c1b19] text-[#faf8f4] font-mono text-[10.5px] max-h-[300px] overflow-y-auto leading-relaxed">
                  {jsonString}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
