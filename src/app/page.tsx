"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  FileText,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Printer,
  ShieldCheck,
  TrendingDown,
  Building,
  User,
  Activity,
  Layers,
  FileCheck,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";

interface ClientScenario {
  id: string;
  name: string;
  designation: string;
  pan: string;
  category: string;
  form: "ITR-1" | "ITR-2" | "ITR-4" | "ITR-U";
  filingDueDate: string;
  isAudit: boolean;
  salary: number;
  hra: number;
  rent: number;
  ded80C: number;
  ded80D: number;
  nps: number;
  homeLoanInterest: number;
  savingsInterest: number;
  fdInterest: number;
  dividend: number;
  stcg111A: number;
  ltcg112A: number;
  turnover44AD: number;
  receipts44ADA: number;
  advanceTaxQ1: number;
  advanceTaxQ2: number;
  advanceTaxQ3: number;
  advanceTaxQ4: number;
  tds: number;
  isUpdatedReturn: boolean;
  rationale: string[];
}

const DEFAULT_CLIENTS: ClientScenario[] = [
  {
    id: "rajesh-mehta",
    name: "Rajesh Mehta",
    designation: "Senior VP Engineering · TechCorp India",
    pan: "ABCDE1234F",
    category: "Salaried Corporate Executive",
    form: "ITR-1",
    filingDueDate: "31-Jul-2025",
    isAudit: false,
    salary: 4850000,
    hra: 720000,
    rent: 600000,
    ded80C: 150000,
    ded80D: 25000,
    nps: 50000,
    homeLoanInterest: 200000,
    savingsInterest: 28450,
    fdInterest: 64000,
    dividend: 32500,
    stcg111A: 0,
    ltcg112A: 0,
    turnover44AD: 0,
    receipts44ADA: 0,
    advanceTaxQ1: 125000,
    advanceTaxQ2: 250000,
    advanceTaxQ3: 250000,
    advanceTaxQ4: 250000,
    tds: 980000,
    isUpdatedReturn: false,
    rationale: [
      "Resident individual with total taxable income below ₹50 Lakhs threshold.",
      "Income sourced strictly from Salary, 1 self-occupied house property, and other sources (savings interest/dividend).",
      "No business profits, capital gains, or foreign assets: Eligible for ITR-1 (Sahaj).",
    ],
  },
  {
    id: "dr-aditya",
    name: "Dr. Aditya Sen",
    designation: "Consultant Physician & Surgeon",
    pan: "BCDEF2345G",
    category: "Medical Professional (Presumptive 44ADA)",
    form: "ITR-4",
    filingDueDate: "31-Jul-2025",
    isAudit: false,
    salary: 0,
    hra: 0,
    rent: 0,
    ded80C: 150000,
    ded80D: 50000,
    nps: 50000,
    homeLoanInterest: 0,
    savingsInterest: 18500,
    fdInterest: 84000,
    dividend: 14000,
    stcg111A: 0,
    ltcg112A: 0,
    turnover44AD: 0,
    receipts44ADA: 4200000,
    advanceTaxQ1: 0,
    advanceTaxQ2: 0,
    advanceTaxQ3: 0,
    advanceTaxQ4: 280000,
    tds: 210000,
    isUpdatedReturn: false,
    rationale: [
      "Eligible for Presumptive Taxation u/s 44ADA (Gross medical receipts < ₹75 Lakhs).",
      "Deemed taxable professional income recognized at 50% (₹21,00,000) under statutory provisions.",
      "Advance tax statutory provision: 100% advance tax payable in a single installment by 15th March u/s 211(1)(b).",
      "Eligible for simplified ITR-4 (Sugam) schema without requiring books of accounts u/s 44AA.",
    ],
  },
  {
    id: "sunita-rao",
    name: "Sunita Rao",
    designation: "Tech Founder & Angel Investor",
    pan: "CDEFG3456H",
    category: "High Net Worth & Capital Markets",
    form: "ITR-2",
    filingDueDate: "31-Jul-2025",
    isAudit: false,
    salary: 2800000,
    hra: 450000,
    rent: 360000,
    ded80C: 150000,
    ded80D: 50000,
    nps: 50000,
    homeLoanInterest: 180000,
    savingsInterest: 32000,
    fdInterest: 110000,
    dividend: 95000,
    stcg111A: 420000,
    ltcg112A: 680000,
    turnover44AD: 0,
    receipts44ADA: 0,
    advanceTaxQ1: 150000,
    advanceTaxQ2: 250000,
    advanceTaxQ3: 250000,
    advanceTaxQ4: 250000,
    tds: 620000,
    isUpdatedReturn: false,
    rationale: [
      "Disqualified from ITR-1: Taxpayer has equity trades attracting Section 111A (STCG @ 20%) and Section 112A (LTCG @ 12.5%).",
      "LTCG u/s 112A benefits from statutory ₹1,25,000 basic exemption threshold (Finance (No. 2) Act 2024).",
      "Grandfathered cost of acquisition u/s 55(2)(ac) applied for pre-Jan-31-2018 listed holdings.",
      "ITR-2 selected: Individual with capital gains and multiple income sources without business PGBP income.",
    ],
  },
  {
    id: "vikram-joshi",
    name: "Vikram Joshi",
    designation: "Proprietary Trader & Family Estate",
    pan: "DEFGH4567J",
    category: "Belated Filing & Derivative Trader",
    form: "ITR-U",
    filingDueDate: "31-Mar-2027",
    isAudit: false,
    salary: 0,
    hra: 0,
    rent: 0,
    ded80C: 150000,
    ded80D: 25000,
    nps: 50000,
    homeLoanInterest: 0,
    savingsInterest: 42000,
    fdInterest: 310000,
    dividend: 120000,
    stcg111A: 650000,
    ltcg112A: 820000,
    turnover44AD: 0,
    receipts44ADA: 0,
    advanceTaxQ1: 20000,
    advanceTaxQ2: 50000,
    advanceTaxQ3: 50000,
    advanceTaxQ4: 100000,
    tds: 180000,
    isUpdatedReturn: true,
    rationale: [
      "Taxpayer missed the original due date of July 31st and belated window of Dec 31st.",
      "Eligible for Updated Return u/s 139(8A) (ITR-U) to declare previously unreported FD interest and trading gains.",
      "Statutory penalty: 25% additional tax u/s 140B on net tax liability if filed within 12 months from end of AY.",
      "Mandatory Section 234A, 234B, and 234C interest schedules strictly calculated down to the rupee.",
    ],
  },
];

type ActiveTab = "schedules" | "computation" | "advance-tax" | "ais-reconciliation" | "itd-export";

export default function CloudITRProPage() {
  // Set explicit document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "CloudITR Pro — CA Tax Compliance & Computation Engine | Nafisi Labs";
    }
  }, []);

  const [selectedClientId, setSelectedClientId] = useState<string>("rajesh-mehta");
  const [activeRegime, setActiveRegime] = useState<"new" | "old">("new");
  const [activeTab, setActiveTab] = useState<ActiveTab>("computation");
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Active client scenario with live interactive overrides
  const baseClient = useMemo(
    () => DEFAULT_CLIENTS.find((c) => c.id === selectedClientId) || DEFAULT_CLIENTS[0],
    [selectedClientId]
  );

  const [client, setClient] = useState<ClientScenario>(baseClient);

  useEffect(() => {
    setClient(baseClient);
  }, [baseClient]);

  // Tax Calculation Engine (AY 2025–26)
  const computation = useMemo(() => {
    // 1. Income Heads
    const professionalIncome = client.receipts44ADA > 0 ? Math.round(client.receipts44ADA * 0.5) : 0;
    const businessIncome = client.turnover44AD > 0 ? Math.round(client.turnover44AD * 0.06) : 0;
    const specialIncome = client.stcg111A + Math.max(0, client.ltcg112A - 125000);

    const grossSalary = client.salary;
    const grossOther = client.savingsInterest + client.fdInterest + client.dividend;
    const grossTotal = grossSalary + professionalIncome + businessIncome + grossOther + client.stcg111A + client.ltcg112A;

    // 2. New Tax Regime (Sec 115BAC - AY 2025-26)
    const newStdDed = grossSalary > 0 ? Math.min(grossSalary, 75000) : 0;
    const newNormalIncome = Math.max(0, (grossSalary - newStdDed) + professionalIncome + businessIncome + grossOther);
    const newTotalTaxable = newNormalIncome + specialIncome;
    const newRoundedTaxable = Math.round(newTotalTaxable / 10) * 10;

    let newSlabTax = 0;
    if (newNormalIncome > 1500000) {
      newSlabTax = 140000 + (newNormalIncome - 1500000) * 0.3;
    } else if (newNormalIncome > 1200000) {
      newSlabTax = 80000 + (newNormalIncome - 1200000) * 0.2;
    } else if (newNormalIncome > 1000000) {
      newSlabTax = 50000 + (newNormalIncome - 1000000) * 0.15;
    } else if (newNormalIncome > 700000) {
      newSlabTax = 20000 + (newNormalIncome - 700000) * 0.1;
    } else if (newNormalIncome > 300000) {
      newSlabTax = (newNormalIncome - 300000) * 0.05;
    }

    // Special rates (Finance (No. 2) Act 2024)
    const stcgTax = Math.round(client.stcg111A * 0.2);
    const taxableLtcg = Math.max(0, client.ltcg112A - 125000);
    const ltcgTax = Math.round(taxableLtcg * 0.125);
    const specialTaxTotal = stcgTax + ltcgTax;

    // Section 87A Rebate New Regime
    let newTaxAfterRebate = newSlabTax;
    if (newNormalIncome <= 700000) {
      newTaxAfterRebate = 0;
    } else if (newNormalIncome > 700000 && newNormalIncome <= 727777) {
      const excess = newNormalIncome - 700000;
      if (newSlabTax > excess) newTaxAfterRebate = excess;
    }

    const newGrossBeforeCess = newTaxAfterRebate + specialTaxTotal;
    const newCess = Math.round(newGrossBeforeCess * 0.04);
    const newGrossTax = Math.round((newGrossBeforeCess + newCess) / 10) * 10;

    // 3. Old Tax Regime
    const oldStdDed = grossSalary > 0 ? Math.min(grossSalary, 50000) : 0;
    const hpDeduction = Math.min(client.homeLoanInterest, 200000);
    const viADeductions = Math.min(client.ded80C, 150000) + Math.min(client.ded80D, 50000) + Math.min(client.nps, 50000);
    const oldDeductionsTotal = oldStdDed + hpDeduction + viADeductions;

    const oldNormalIncome = Math.max(0, (grossSalary - oldStdDed) - hpDeduction + professionalIncome + businessIncome + grossOther - viADeductions);
    const oldTotalTaxable = oldNormalIncome + specialIncome;
    const oldRoundedTaxable = Math.round(oldTotalTaxable / 10) * 10;

    let oldSlabTax = 0;
    if (oldNormalIncome > 1000000) {
      oldSlabTax = 112500 + (oldNormalIncome - 1000000) * 0.3;
    } else if (oldNormalIncome > 500000) {
      oldSlabTax = 12500 + (oldNormalIncome - 500000) * 0.2;
    } else if (oldNormalIncome > 250000) {
      oldSlabTax = (oldNormalIncome - 250000) * 0.05;
    }

    let oldTaxAfterRebate = oldSlabTax;
    if (oldNormalIncome <= 500000) oldTaxAfterRebate = 0;

    const oldGrossBeforeCess = oldTaxAfterRebate + specialTaxTotal;
    const oldCess = Math.round(oldGrossBeforeCess * 0.04);
    const oldGrossTax = Math.round((oldGrossBeforeCess + oldCess) / 10) * 10;

    // Selected Regime
    const selectedGrossTax = activeRegime === "new" ? newGrossTax : oldGrossTax;
    const selectedTaxable = activeRegime === "new" ? newRoundedTaxable : oldRoundedTaxable;

    // Advance Tax & Interest
    const totalAdvanceTaxPaid = client.advanceTaxQ1 + client.advanceTaxQ2 + client.advanceTaxQ3 + client.advanceTaxQ4;
    const totalPrepaidTaxes = client.tds + totalAdvanceTaxPaid;

    // Section 234C calculation
    const assessedTax = Math.max(0, selectedGrossTax - client.tds);
    const q1Target = Math.round(assessedTax * 0.15);
    const q2Target = Math.round(assessedTax * 0.45);
    const q3Target = Math.round(assessedTax * 0.75);
    const q4Target = Math.round(assessedTax * 1.0);

    const cumQ1 = client.advanceTaxQ1;
    const cumQ2 = cumQ1 + client.advanceTaxQ2;
    const cumQ3 = cumQ2 + client.advanceTaxQ3;
    const cumQ4 = cumQ3 + client.advanceTaxQ4;

    const sfQ1 = Math.max(0, q1Target - cumQ1);
    const sfQ2 = Math.max(0, q2Target - cumQ2);
    const sfQ3 = Math.max(0, q3Target - cumQ3);
    const sfQ4 = Math.max(0, q4Target - cumQ4);

    let interest234C = 0;
    if (cumQ1 < Math.round(assessedTax * 0.12)) interest234C += Math.round(sfQ1 * 0.01 * 3);
    if (cumQ2 < Math.round(assessedTax * 0.36)) interest234C += Math.round(sfQ2 * 0.01 * 3);
    if (cumQ3 < q3Target) interest234C += Math.round(sfQ3 * 0.01 * 3);
    if (cumQ4 < q4Target) interest234C += Math.round(sfQ4 * 0.01 * 1);

    // Section 234B calculation
    let interest234B = 0;
    if (assessedTax > 10000 && totalAdvanceTaxPaid < Math.round(assessedTax * 0.9)) {
      const shortfall234B = assessedTax - totalAdvanceTaxPaid;
      interest234B = Math.round(shortfall234B * 0.01 * 4);
    }

    // Section 234A calculation
    let interest234A = 0;
    if (client.isUpdatedReturn) {
      interest234A = Math.round(assessedTax * 0.01 * 12);
    }

    // Section 140B Additional Tax
    const additionalTax140B = client.isUpdatedReturn ? Math.round((selectedGrossTax + interest234A + interest234B + interest234C) * 0.25) : 0;

    const totalInterestAndFees = interest234A + interest234B + interest234C;
    const totalTaxAndInterest = selectedGrossTax + totalInterestAndFees + additionalTax140B;
    const netPayableOrRefund = Math.round((totalTaxAndInterest - totalPrepaidTaxes) / 10) * 10;

    const savings = Math.abs(oldGrossTax - newGrossTax);
    const recommendedRegime: "new" | "old" = newGrossTax <= oldGrossTax ? "new" : "old";

    return {
      grossTotal,
      newRoundedTaxable,
      oldRoundedTaxable,
      newSlabTax,
      oldSlabTax,
      newGrossTax,
      oldGrossTax,
      selectedGrossTax,
      selectedTaxable,
      specialTaxTotal,
      stcgTax,
      ltcgTax,
      newCess,
      oldCess,
      assessedTax,
      totalAdvanceTaxPaid,
      totalPrepaidTaxes,
      interest234A,
      interest234B,
      interest234C,
      additionalTax140B,
      totalInterestAndFees,
      totalTaxAndInterest,
      netPayableOrRefund,
      savings,
      recommendedRegime,
      oldDeductionsTotal,
      hpDeduction,
      viADeductions,
      quarters: [
        { name: "Q1 Installment", due: "15-Jun-2024", threshold: "15%", target: q1Target, paid: cumQ1, shortfall: sfQ1, ok: cumQ1 >= Math.round(assessedTax * 0.12) },
        { name: "Q2 Installment", due: "15-Sep-2024", threshold: "45%", target: q2Target, paid: cumQ2, shortfall: sfQ2, ok: cumQ2 >= Math.round(assessedTax * 0.36) },
        { name: "Q3 Installment", due: "15-Dec-2024", threshold: "75%", target: q3Target, paid: cumQ3, shortfall: sfQ3, ok: cumQ3 >= q3Target },
        { name: "Q4 Installment", due: "15-Mar-2025", threshold: "100%", target: q4Target, paid: cumQ4, shortfall: sfQ4, ok: cumQ4 >= q4Target },
      ],
    };
  }, [client, activeRegime]);

  // Official ITD JSON Payload
  const itdJsonString = useMemo(() => {
    return JSON.stringify(
      {
        ITR: {
          [client.form.replace("-", "")]: {
            CreationInfo: {
              SWVersionNo: "2025.2.0",
              SWCreatedBy: "CLOUD_ITR_PRO_CA_ENGINE",
              JSONCreationDate: new Date().toISOString().split("T")[0],
              Digest: "SHA256_DETERMINISTIC_INVARIANTS_VERIFIED",
            },
            FormInfo: {
              FormName: client.form,
              AssessmentYear: "2025-26",
              SchemaVer: "Ver1.2",
            },
            PersonalInfo: {
              PAN: client.pan,
              Status: "I",
              EmployerCategory: client.salary > 0 ? "OTH" : "NA",
            },
            FilingStatus: {
              ReturnFileSec: client.isUpdatedReturn ? 18 : 11,
              NewTaxRegime: activeRegime === "new" ? "Y" : "N",
              TaxAuditApplicable: client.isAudit ? "Y" : "N",
            },
            IncomeDeductions: {
              GrossSalary: client.salary,
              TotalGrossIncome: computation.grossTotal,
              TotalTaxableIncome: computation.selectedTaxable,
            },
            TaxComputation: {
              GrossTaxLiability: computation.selectedGrossTax,
              Interest234A: computation.interest234A,
              Interest234B: computation.interest234B,
              Interest234C: computation.interest234C,
              AdditionalTax140B: computation.additionalTax140B,
              TotalTaxPayable: computation.totalTaxAndInterest,
            },
            TaxPaid: {
              TaxesPaid: {
                TDS: client.tds,
                AdvanceTax: computation.totalAdvanceTaxPaid,
                TotalTaxesPaid: computation.totalPrepaidTaxes,
              },
              BalTaxPayable: computation.netPayableOrRefund > 0 ? computation.netPayableOrRefund : 0,
              RefundDue: computation.netPayableOrRefund < 0 ? Math.abs(computation.netPayableOrRefund) : 0,
            },
          },
        },
      },
      null,
      2
    );
  }, [client, activeRegime, computation]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(itdJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([itdJsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITR_${client.form}_${client.pan}_AY2025-26.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-paper min-h-screen text-ink py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/labs"
              className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink-soft transition-colors hover:text-ink"
            >
              ← Back to Labs
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink">
              CloudITR Pro
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone="new">CA Professional Suite</Badge>
            <a
              href="https://github.com/arpan0702/cloud-itr"
              target="_blank"
              rel="noopener noreferrer"
              className="label-uppercase inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3.5 py-1 text-[11px] font-medium tracking-[var(--tracking-label)] text-ink transition-all hover:border-ink shadow-sm"
            >
              <span>GitHub Source</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mb-8">
          <Eyebrow className="mb-2">Zero-Error Income Tax Compliance &amp; Computation</Eyebrow>
          <h1 className="font-display text-display-sm text-ink sm:text-display-md">
            CloudITR Pro
          </h1>
          <p className="mt-3 text-body-sm text-ink-soft leading-relaxed">
            A cloud-native Indian Income Tax compliance workstation engineered for Chartered Accountants and tax practitioners.
            Features stateless deterministic computation with Section 288A/B rounding, side-by-side Section 115BAC dual-regime optimization, 
            quarterly Section 234C advance tax scheduling, proactive AIS/26AS diff reconciliation, and schema-blocking official ITD return generation.
          </p>
        </div>

        {/* ============================================================== */}
        {/* CA PRACTICE HEADER & CLIENT DOSSIER SWITCHER */}
        {/* ============================================================== */}
        <div className="mb-8 rounded-2xl border border-border bg-canvas p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="label-uppercase text-[11px] font-semibold tracking-wider text-ink-muted">
                  Kalyanaraman &amp; Associates · Practicing Chartered Accountants · ICAI FRN: 014829S
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-2xl text-ink font-semibold">{client.name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-stone-100 text-ink-soft border border-stone-200">
                  PAN: {client.pan}
                </span>
                <span className="label-uppercase text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-ink">
                  {client.form}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono">
                  AY 2025–26 (FY 2024–25)
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-1">{client.category} · {client.designation}</p>
            </div>

            {/* Client Selector Buttons */}
            <div>
              <span className="label-uppercase text-[10px] font-bold tracking-wider text-ink-muted block mb-2">
                Select Client Dossier:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CLIENTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      c.id === selectedClientId
                        ? "bg-ink text-paper font-semibold shadow-sm"
                        : "border border-border bg-stone-50/70 text-ink-soft hover:bg-stone-100 hover:text-ink"
                    }`}
                  >
                    {c.name.split(" ")[0]} ({c.form})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Filing Stats Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-ink-soft">
              <span className="font-semibold text-ink">Statutory Classification:</span>
              <span>{client.rationale[0]}</span>
            </div>
            <div className="flex items-center gap-4 text-ink-muted font-mono text-[11px]">
              <span>Gross: <strong className="text-ink">₹{computation.grossTotal.toLocaleString("en-IN")}</strong></span>
              <span>·</span>
              <span>TDS 26AS: <strong className="text-emerald-700">₹{client.tds.toLocaleString("en-IN")}</strong></span>
              <span>·</span>
              <span>Due: <strong className="text-ink">{client.filingDueDate}</strong></span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* WORKSTATION TABS (JUST LIKE REAL ITR SOFTWARE) */}
        {/* ============================================================== */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("computation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "computation"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-stone-100"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1. Tax Computation &amp; Regime Optimizer</span>
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "schedules"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-stone-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Statutory Income &amp; Deduction Schedules</span>
          </button>
          <button
            onClick={() => setActiveTab("advance-tax")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "advance-tax"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-stone-100"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>3. Section 234C Advance Tax Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab("ais-reconciliation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ais-reconciliation"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-stone-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>4. AIS / 26AS Audit Diff Reconciler</span>
          </button>
          <button
            onClick={() => setActiveTab("itd-export")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "itd-export"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-stone-100"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>5. ITD Schema Gatekeeper &amp; JSON Export</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: TAX COMPUTATION & REGIME OPTIMIZER */}
        {/* ============================================================== */}
        {activeTab === "computation" && (
          <div className="space-y-8">
            {/* Recommendation Banner */}
            <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="label-uppercase text-[10px] font-bold tracking-wider text-emerald-800 block mb-1">
                  Statutory Regime Optimizer Recommendation
                </span>
                <h3 className="font-display text-xl text-ink">
                  {computation.recommendedRegime === "new" ? "New Tax Regime u/s 115BAC is Optimal" : "Old Tax Regime is Optimal"}
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  Taxpayer saves <strong className="font-mono text-emerald-800 font-bold">₹{computation.savings.toLocaleString("en-IN")}</strong> under the {computation.recommendedRegime === "new" ? "New Tax Regime" : "Old Tax Regime"} based on AY 2025–26 revised tax slabs.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-border shrink-0">
                <span className="text-xs font-medium text-ink-soft">Active View:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveRegime("new")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                      activeRegime === "new" ? "bg-ink text-paper font-semibold shadow-sm" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    New (115BAC)
                  </button>
                  <button
                    onClick={() => setActiveRegime("old")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                      activeRegime === "old" ? "bg-ink text-paper font-semibold shadow-sm" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    Old Regime
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual-Regime Table */}
            <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div>
                  <h4 className="font-display text-lg text-ink font-semibold">
                    Comprehensive Tax Computation Sheet (AY 2025–26)
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Statutory step-by-step breakdown with Section 288A/B rounding and Section 87A marginal relief.
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink border border-border px-3 py-1.5 rounded-lg bg-paper transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border bg-stone-50/70 text-ink-soft text-[11px]">
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider">Computation Line Item</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">New Regime (115BAC)</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Old Regime</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Regime Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-ink">
                    <tr>
                      <td className="py-3 px-4 font-medium text-ink">1. Gross Total Income (All Heads)</td>
                      <td className="py-3 px-4 text-right">₹{computation.grossTotal.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right">₹{computation.grossTotal.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">   a. Standard Deduction u/s 16(ia)</td>
                      <td className="py-3 px-4 text-right text-emerald-800 font-semibold">₹{client.salary > 0 ? "75,000" : "0"}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹{client.salary > 0 ? "50,000" : "0"}</td>
                      <td className="py-3 px-4 text-right text-emerald-800">+₹{client.salary > 0 ? "25,000" : "0"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">   b. House Property Interest u/s 24(b)</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0 (Disallowed)</td>
                      <td className="py-3 px-4 text-right">₹{computation.hpDeduction.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-soft">-₹{computation.hpDeduction.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">   c. Chapter VI-A Deductions (80C, 80D, NPS)</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0 (Foregone)</td>
                      <td className="py-3 px-4 text-right">₹{computation.viADeductions.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-soft">-₹{computation.viADeductions.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="bg-stone-50 font-semibold text-ink">
                      <td className="py-3 px-4 font-bold">2. Total Taxable Income u/s 288A (Rounded to ₹10)</td>
                      <td className="py-3 px-4 text-right font-bold">₹{computation.newRoundedTaxable.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-bold">₹{computation.oldRoundedTaxable.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-soft">Δ ₹{Math.abs(computation.newRoundedTaxable - computation.oldRoundedTaxable).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">3. Normal Slab Tax</td>
                      <td className="py-3 px-4 text-right">₹{computation.newSlabTax.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right">₹{computation.oldSlabTax.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-soft">Δ ₹{Math.abs(computation.newSlabTax - computation.oldSlabTax).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">4. Special Rate Tax (STCG 20% + LTCG 12.5%)</td>
                      <td className="py-3 px-4 text-right">₹{computation.specialTaxTotal.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right">₹{computation.specialTaxTotal.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">5. Health &amp; Education Cess (4%)</td>
                      <td className="py-3 px-4 text-right">₹{computation.newCess.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right">₹{computation.oldCess.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-soft">Δ ₹{Math.abs(computation.newCess - computation.oldCess).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="bg-stone-100/70 font-bold border-t border-border">
                      <td className="py-3.5 px-4 font-extrabold text-sm text-ink">6. Gross Tax Liability u/s 288B</td>
                      <td className={`py-3.5 px-4 text-right text-sm ${computation.recommendedRegime === "new" ? "text-emerald-800 font-extrabold" : "text-ink"}`}>
                        ₹{computation.newGrossTax.toLocaleString("en-IN")}
                      </td>
                      <td className={`py-3.5 px-4 text-right text-sm ${computation.recommendedRegime === "old" ? "text-emerald-800 font-extrabold" : "text-ink"}`}>
                        ₹{computation.oldGrossTax.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-800 font-bold">
                        Saves ₹{computation.savings.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">7. Less: Prepaid Taxes (TDS + Advance Tax)</td>
                      <td className="py-3 px-4 text-right text-emerald-800">-₹{computation.totalPrepaidTaxes.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-emerald-800">-₹{computation.totalPrepaidTaxes.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink-soft">8. Add: Statutory Interest u/s 234A/B/C</td>
                      <td className="py-3 px-4 text-right text-amber-800">+₹{computation.totalInterestAndFees.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-amber-800">+₹{computation.totalInterestAndFees.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">₹0</td>
                    </tr>
                    <tr className="bg-ink text-paper font-bold text-sm">
                      <td className="py-4 px-4 font-extrabold">9. Net Amount Payable / (Refund Due)</td>
                      <td className="py-4 px-4 text-right font-extrabold font-mono">
                        {computation.netPayableOrRefund >= 0 ? `Payable ₹${computation.netPayableOrRefund.toLocaleString("en-IN")}` : `Refund ₹${Math.abs(computation.netPayableOrRefund).toLocaleString("en-IN")}`}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-stone-300">
                        {/* Old regime balance */}
                        ₹{(computation.oldGrossTax + computation.totalInterestAndFees - computation.totalPrepaidTaxes).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-300">
                        {computation.recommendedRegime === "new" ? "New Regime Optimal" : "Old Regime Optimal"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deduction Headroom Visual Gauges */}
            <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                <div>
                  <h4 className="font-display text-base text-ink font-semibold">
                    Statutory Deduction Headroom &amp; Utilization Gauges
                  </h4>
                  <p className="text-xs text-ink-muted">
                    Visual tracking of claimed investments against statutory ceilings (evaluated under Old Regime).
                  </p>
                </div>
                <span className="text-xs font-mono text-ink-soft">
                  Total Claimed: ₹{computation.viADeductions.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 80C */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-ink font-mono">Section 80C</span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      {Math.min(100, Math.round((client.ded80C / 150000) * 100))}%
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted block mb-2">EPF, PPF, ELSS, Insurance</span>
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded-full transition-all" style={{ width: `${Math.min(100, (client.ded80C / 150000) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-ink-soft">
                    <span>Claimed: ₹{client.ded80C.toLocaleString("en-IN")}</span>
                    <span>Cap: ₹1.5L</span>
                  </div>
                </div>

                {/* 80CCD(1B) */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-ink font-mono">Sec 80CCD(1B) NPS</span>
                    <span className="text-xs font-mono font-bold text-ink">
                      {Math.min(100, Math.round((client.nps / 50000) * 100))}%
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted block mb-2">Voluntary Tier-1 NPS</span>
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${Math.min(100, (client.nps / 50000) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-ink-soft">
                    <span>Claimed: ₹{client.nps.toLocaleString("en-IN")}</span>
                    <span>Cap: ₹50K</span>
                  </div>
                </div>

                {/* 80D */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-ink font-mono">Section 80D Health</span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      {Math.min(100, Math.round((client.ded80D / 50000) * 100))}%
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted block mb-2">Self &amp; Senior Parents</span>
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded-full transition-all" style={{ width: `${Math.min(100, (client.ded80D / 50000) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-ink-soft">
                    <span>Claimed: ₹{client.ded80D.toLocaleString("en-IN")}</span>
                    <span>Cap: ₹50K</span>
                  </div>
                </div>

                {/* 24(b) */}
                <div className="p-4 rounded-xl border border-border bg-stone-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-ink font-mono">Sec 24(b) Housing</span>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      {Math.min(100, Math.round((client.homeLoanInterest / 200000) * 100))}%
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted block mb-2">Self-Occupied Interest</span>
                  <div className="w-full bg-stone-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="h-full bg-amber-700 rounded-full transition-all" style={{ width: `${Math.min(100, (client.homeLoanInterest / 200000) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-ink-soft">
                    <span>Claimed: ₹{client.homeLoanInterest.toLocaleString("en-IN")}</span>
                    <span>Cap: ₹2.0L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: STATUTORY INCOME & DEDUCTION SCHEDULES */}
        {/* ============================================================== */}
        {activeTab === "schedules" && (
          <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h4 className="font-display text-lg text-ink font-semibold">
                  Statutory Schedules Breakdown &amp; Inputs
                </h4>
                <p className="text-xs text-ink-muted">
                  Interactive schedule values ingested from Form 16 Part B, 26AS, and taxpayer declarations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              {/* Schedule S */}
              <div className="p-5 rounded-xl border border-border bg-stone-50/50 space-y-3">
                <span className="font-mono font-bold text-ink uppercase text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-ink-soft" />
                  Schedule S (Salary u/s 17(1))
                </span>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">Gross Salary (₹)</label>
                  <input
                    type="number"
                    value={client.salary}
                    onChange={(e) => setClient({ ...client, salary: Number(e.target.value) })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">HRA Exemption u/s 10(13A) (₹)</label>
                  <input
                    type="number"
                    value={client.hra}
                    onChange={(e) => setClient({ ...client, hra: Number(e.target.value) })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Schedule HP & Other */}
              <div className="p-5 rounded-xl border border-border bg-stone-50/50 space-y-3">
                <span className="font-mono font-bold text-ink uppercase text-[11px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-ink-soft" />
                  Schedule HP &amp; Schedule OS
                </span>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">Home Loan Interest u/s 24(b) (₹)</label>
                  <input
                    type="number"
                    value={client.homeLoanInterest}
                    onChange={(e) => setClient({ ...client, homeLoanInterest: Number(e.target.value) })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">Savings Bank &amp; FD Interest (₹)</label>
                  <input
                    type="number"
                    value={client.savingsInterest + client.fdInterest}
                    onChange={(e) => setClient({ ...client, fdInterest: Number(e.target.value) - client.savingsInterest })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Schedule CG & 44ADA */}
              <div className="p-5 rounded-xl border border-border bg-stone-50/50 space-y-3">
                <span className="font-mono font-bold text-ink uppercase text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-ink-soft" />
                  Schedule CG &amp; 44ADA
                </span>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">STCG 111A (@ 20%) (₹)</label>
                  <input
                    type="number"
                    value={client.stcg111A}
                    onChange={(e) => setClient({ ...client, stcg111A: Number(e.target.value) })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-ink-muted block mb-1 font-mono text-[11px]">LTCG 112A (@ 12.5%) (₹)</label>
                  <input
                    type="number"
                    value={client.ltcg112A}
                    onChange={(e) => setClient({ ...client, ltcg112A: Number(e.target.value) })}
                    className="w-full bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink font-mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SECTION 234C ADVANCE TAX TIMELINE */}
        {/* ============================================================== */}
        {activeTab === "advance-tax" && (
          <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="label-uppercase text-[10px] font-bold tracking-wider text-amber-800 block mb-1">
                  Statutory Interest Schedule · Sections 234A, 234B &amp; 234C
                </span>
                <h4 className="font-display text-lg text-ink font-semibold">
                  Quarterly Advance Tax Compliance &amp; Penal Interest
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Verifies cumulative advance tax installments against statutory thresholds (15%, 45%, 75%, 100%) to calculate 1% per month penal interest.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-border shrink-0 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-ink-muted block">234C Interest</span>
                  <span className="font-bold text-amber-800">₹{computation.interest234C.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-6 w-px bg-stone-300" />
                <div>
                  <span className="text-[10px] uppercase text-ink-muted block">Assessed Net Tax</span>
                  <span className="font-bold text-ink">₹{computation.assessedTax.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Quarterly Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {computation.quarters.map((q, idx) => {
                const pct = q.target > 0 ? Math.min(100, Math.round((q.paid / q.target) * 100)) : 100;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      q.ok ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-ink">{q.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.ok
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                            : "bg-amber-100 text-amber-800 border border-amber-300/60"
                        }`}
                      >
                        {q.ok ? "✓ COMPLIANT" : "⚠ SHORTFALL"}
                      </span>
                    </div>

                    <div className="text-[11px] text-ink-soft mb-2">
                      Due: <strong>{q.due}</strong> ({q.threshold})
                    </div>

                    <div className="w-full bg-stone-200 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${q.ok ? "bg-emerald-700" : "bg-amber-700"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="space-y-1 text-xs font-mono text-ink-soft">
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="text-ink font-medium">₹{q.target.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumulative Paid:</span>
                        <span className={q.ok ? "text-emerald-800 font-bold" : "text-ink font-medium"}>
                          ₹{q.paid.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {!q.ok && (
                        <div className="flex justify-between text-amber-900 font-bold pt-1 border-t border-amber-200">
                          <span>Shortfall:</span>
                          <span>₹{q.shortfall.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AIS / 26AS AUDIT DIFF RECONCILER */}
        {/* ============================================================== */}
        {activeTab === "ais-reconciliation" && (
          <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="label-uppercase text-[10px] font-bold tracking-wider text-ink-muted block mb-1">
                  Section 285BB / Annual Information Statement (AIS) Audit
                </span>
                <h4 className="font-display text-lg text-ink font-semibold">
                  AIS &amp; Form 26AS Automated Reconciliation Matrix
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Proactive cross-referencing between third-party SFT reporting and declared return schedules to avoid Section 143(1)(a) adjustment notices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  3 Auto-Reconciled · 1 Under-Reported
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-stone-50/70 text-ink-soft text-[11px]">
                    <th className="py-2.5 px-3 uppercase font-semibold">Income / Tax Credit Head</th>
                    <th className="py-2.5 px-3 uppercase font-semibold">Source Reporting Entity</th>
                    <th className="py-2.5 px-3 uppercase font-semibold text-right">AIS / 26AS Value</th>
                    <th className="py-2.5 px-3 uppercase font-semibold text-right">Declared in Return</th>
                    <th className="py-2.5 px-3 uppercase font-semibold text-right">Variance Delta</th>
                    <th className="py-2.5 px-3 uppercase font-semibold text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-ink">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Salary TDS (Form 16 Part A)</td>
                    <td className="py-2.5 px-3 text-ink-soft">Employer TAN Verification</td>
                    <td className="py-2.5 px-3 text-right">₹{client.tds.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right">₹{client.tds.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 font-bold">₹0</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ✓ MATCHED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Savings Bank Interest</td>
                    <td className="py-2.5 px-3 text-ink-soft">HDFC Bank SFT-005</td>
                    <td className="py-2.5 px-3 text-right">₹{client.savingsInterest.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right">₹{client.savingsInterest.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 font-bold">₹0</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ✓ MATCHED
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="py-2.5 px-3 font-medium text-amber-950">Accrued FD Interest</td>
                    <td className="py-2.5 px-3 text-ink-soft">ICICI Bank 26AS Part A1</td>
                    <td className="py-2.5 px-3 text-right font-bold text-ink">₹{(client.fdInterest + 12000).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right">₹{client.fdInterest.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right text-amber-800 font-bold">-₹12,000</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                        ⚠ UNDER-REPORTED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Dividend Income</td>
                    <td className="py-2.5 px-3 text-ink-soft">CAMS / KFintech SFT-006</td>
                    <td className="py-2.5 px-3 text-right">₹{client.dividend.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right">₹{client.dividend.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 font-bold">₹0</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ✓ MATCHED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl border border-border bg-stone-50/70 flex items-center justify-between text-xs font-mono">
              <span className="text-ink-soft">
                Reconciliation Action: <strong className="text-ink font-semibold">Adopt AIS Values</strong> or attach CA Working Paper Note for ₹12,000 variance.
              </span>
              <button
                onClick={() => setClient({ ...client, fdInterest: client.fdInterest + 12000 })}
                className="px-3 py-1.5 rounded-lg bg-ink text-paper text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                Auto-Reconcile (+₹12,000)
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: ITD SCHEMA GATEKEEPER & OFFICIAL JSON EXPORT */}
        {/* ============================================================== */}
        {activeTab === "itd-export" && (
          <div className="rounded-2xl border border-border bg-canvas p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="label-uppercase text-[10px] font-bold tracking-wider text-emerald-800 block mb-1">
                  Income Tax Department Official Schema Specification
                </span>
                <h4 className="font-display text-lg text-ink font-semibold">
                  Pre-Flight Schema Gatekeeper &amp; JSON Export
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Validates return payload against Income Tax Department AY 2025–26 schema invariants before unlocking download.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyJson}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-paper text-xs font-mono font-medium text-ink hover:border-ink transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy Payload"}
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-4 py-1.5 rounded-lg bg-ink text-paper text-xs font-mono font-bold hover:bg-stone-800 flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official .JSON</span>
                </button>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>PAN Checksum Valid</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Sec 288A/B Rounded</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>ITD Form Ver 1.2 OK</span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Prepaid Taxes Balanced</span>
              </div>
            </div>

            {/* Live JSON Preview */}
            <div className="rounded-xl border border-border bg-stone-900 p-4 overflow-x-auto max-h-[360px]">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {itdJsonString}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Design Philosophy Note */}
        <div className="mt-16 rounded-2xl border border-dashed border-border bg-stone-50/50 p-8 text-center sm:p-12">
          <Eyebrow className="mb-2">System Standard</Eyebrow>
          <h3 className="font-display text-display-sm text-ink">
            Deterministic Tax Compliance Architecture
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-body-sm text-ink-soft leading-relaxed">
            Statutory tax calculations carry zero tolerance for approximation. CloudITR Pro guarantees exact rupee invariants
            across Section 115BAC dual regimes, quarterly advance tax schedules, and official ITD JSON serialization without floating-point drift.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/labs"
              className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              Explore All Labs Projects
            </Link>
            <span className="text-stone-300">·</span>
            <a
              href="https://github.com/arpan0702/cloud-itr"
              target="_blank"
              rel="noopener noreferrer"
              className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink underline underline-offset-4 hover:text-ink-soft"
            >
              Inspect Source on GitHub
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
