"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building,
  User,
  ShieldCheck,
  RotateCcw,
  Layers,
  FileCheck,
  Check,
  Copy,
  Info
} from "lucide-react";
import {
  ExtractedTaxData,
  parseForm16Text,
  parseAisJson,
  parseForm26AsJson,
  parseUploadedFile,
  SAMPLE_FORM_16_TEXT,
  SAMPLE_OFFICIAL_AIS_JSON,
  SAMPLE_FORM_26AS_JSON,
} from "../lib/smartParser";

interface IngestionStudioProps {
  onApplyData: (data: ExtractedTaxData) => void;
  onClose?: () => void;
}

function formatRupee(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function IngestionStudio({ onApplyData, onClose }: IngestionStudioProps) {
  const [extractedData, setExtractedData] = useState<ExtractedTaxData>(() =>
    parseAisJson(SAMPLE_OFFICIAL_AIS_JSON, "Official_ITD_AIS_Statement.json")
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState<"AIS" | "FORM_16" | "26AS" | "CUSTOM">("AIS");
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (type: "AIS" | "FORM_16" | "26AS") => {
    setIsProcessing(true);
    setActivePreset(type);
    setTimeout(() => {
      if (type === "AIS") {
        setExtractedData(parseAisJson(SAMPLE_OFFICIAL_AIS_JSON, "Official_ITD_AIS_Statement.json"));
      } else if (type === "FORM_16") {
        setExtractedData(parseForm16Text(SAMPLE_FORM_16_TEXT, "Form_16_Part_B_TechCorp.pdf"));
      } else {
        setExtractedData(parseForm26AsJson(SAMPLE_FORM_26AS_JSON, "Form_26AS_Tax_Credit.json"));
      }
      setIsProcessing(false);
    }, 350);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setActivePreset("CUSTOM");
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTimeout(() => {
        const parsed = parseUploadedFile(file.name, content);
        setExtractedData(parsed);
        setIsProcessing(false);
      }, 400);
    };

    reader.readAsText(file);
  };

  const handleApply = () => {
    onApplyData(extractedData);
    setAppliedSuccessfully(true);
    setTimeout(() => {
      setAppliedSuccessfully(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe1]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge tone="new" className="text-xs font-mono">
                SMART INGESTION ENGINE
              </Badge>
              <Badge tone="neutral" className="bg-[#f0ebe1] text-[#1c1b19] border-[#e2dcce] text-xs font-mono">
                FORM 16 &amp; AIS TELEMETRY
              </Badge>
            </div>
            <h3 className="font-serif text-2xl font-normal text-[#1c1b19]">
              Real-World Document Extraction &amp; Pre-Fill
            </h3>
            <p className="text-xs text-[#6b665f] mt-1 max-w-2xl">
              Upload your official Form 16 PDF, Annual Information Statement (AIS) JSON, or Form 26AS to parse salaries, capital gains, deductions, and TDS credits with zero manual data entry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectSample("AIS")}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activePreset === "AIS"
                  ? "bg-[#1c1b19] text-[#faf8f4] shadow-xs"
                  : "bg-[#faf8f4] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#f0ebe1]"
              }`}
            >
              Sample Official AIS JSON
            </button>

            <button
              onClick={() => handleSelectSample("FORM_16")}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activePreset === "FORM_16"
                  ? "bg-[#1c1b19] text-[#faf8f4] shadow-xs"
                  : "bg-[#faf8f4] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#f0ebe1]"
              }`}
            >
              Sample Form 16 (Part B)
            </button>

            <button
              onClick={() => handleSelectSample("26AS")}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activePreset === "26AS"
                  ? "bg-[#1c1b19] text-[#faf8f4] shadow-xs"
                  : "bg-[#faf8f4] text-[#1c1b19] border border-[#e2dcce] hover:bg-[#f0ebe1]"
              }`}
            >
              Sample Form 26AS JSON
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 border-2 border-dashed border-[#e2dcce] hover:border-[#1c1b19] bg-[#faf8f4] hover:bg-[#f7f4ed] p-8 rounded-2xl text-center cursor-pointer transition-all group"
        >
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#ffffff] border border-[#e2dcce] flex items-center justify-center text-[#6b665f] group-hover:text-[#1c1b19] shadow-xs">
            <Upload className="h-6 w-6" />
          </div>
          <div className="mt-3 font-serif text-base font-medium text-[#1c1b19]">
            Drag &amp; Drop Form 16, AIS JSON, or Form 26AS
          </div>
          <p className="mt-1 text-xs text-[#8c857b]">
            Supports official Income Tax Department JSON exports, Form 16 PDFs, or plaintext statements
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Extraction Results & Confidence Summary */}
      <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2dcce] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ebe1]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-lg font-normal text-[#1c1b19]">
                  Extracted Telemetry: {extractedData.sourceFileName}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {extractedData.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-xs text-[#8c857b]">
                {extractedData.parsedFieldsCount} statutory parameters extracted · Source: {extractedData.sourceType}
              </p>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#1c1b19] text-[#faf8f4] hover:bg-[#2e2c29] transition-all shadow-xs"
          >
            {appliedSuccessfully ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Applied to Filing Sandbox!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Apply Extracted Telemetry to Engine</span>
              </>
            )}
          </button>
        </div>

        {/* Breakdown Grid of Extracted Schedules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Assessee Info */}
          <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] space-y-2">
            <div className="flex items-center justify-between text-[#8c857b] text-[10.5px]">
              <span>ASSESSEE &amp; EMPLOYER</span>
              <User className="h-3.5 w-3.5 text-[#6b665f]" />
            </div>
            <div className="font-sans text-sm font-semibold text-[#1c1b19]">{extractedData.name}</div>
            <div className="text-[#6b665f]">PAN: <strong className="text-[#1c1b19]">{extractedData.pan}</strong></div>
            <div className="text-[#6b665f] truncate" title={extractedData.employerName}>
              Employer: {extractedData.employerName}
            </div>
            <div className="text-[#8c857b] text-[10px]">TAN: {extractedData.employerTan}</div>
          </div>

          {/* Schedule S (Salary) */}
          <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] space-y-2">
            <div className="flex items-center justify-between text-[#8c857b] text-[10.5px]">
              <span>SCHEDULE S (SALARY)</span>
              <Building className="h-3.5 w-3.5 text-[#6b665f]" />
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Gross 17(1):</span>
              <strong className="text-[#1c1b19]">{formatRupee(extractedData.grossSalary)}</strong>
            </div>
            <div className="text-emerald-800 flex justify-between">
              <span>Std Ded 16(ia):</span>
              <strong>-{formatRupee(extractedData.standardDeduction)}</strong>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Prof Tax:</span>
              <span>{formatRupee(extractedData.professionalTax)}</span>
            </div>
            <div className="pt-1 border-t border-[#e2dcce] flex justify-between font-semibold text-[#1c1b19]">
              <span>Net Salary:</span>
              <span>{formatRupee(extractedData.grossSalary - extractedData.standardDeduction)}</span>
            </div>
          </div>

          {/* Schedule CG & OS */}
          <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] space-y-2">
            <div className="flex items-center justify-between text-[#8c857b] text-[10.5px]">
              <span>CAPITAL GAINS &amp; OS</span>
              <Layers className="h-3.5 w-3.5 text-[#6b665f]" />
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>STCG 111A (20%):</span>
              <strong className="text-[#1c1b19]">{formatRupee(extractedData.stcg111A)}</strong>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>LTCG 112A (12.5%):</span>
              <strong className="text-[#1c1b19]">{formatRupee(extractedData.ltcg112A)}</strong>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Bank Interest:</span>
              <span>{formatRupee(extractedData.savingsInterest + extractedData.fdInterest)}</span>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Dividends:</span>
              <span>{formatRupee(extractedData.dividendIncome)}</span>
            </div>
          </div>

          {/* Taxes Paid & TDS */}
          <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#e2dcce] space-y-2">
            <div className="flex items-center justify-between text-[#8c857b] text-[10.5px]">
              <span>TAX CREDITS &amp; TDS</span>
              <FileCheck className="h-3.5 w-3.5 text-[#6b665f]" />
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Salary TDS 192:</span>
              <strong className="text-emerald-800">{formatRupee(extractedData.tdsSalary)}</strong>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Other TDS:</span>
              <span>{formatRupee(extractedData.tdsOther)}</span>
            </div>
            <div className="text-[#6b665f] flex justify-between">
              <span>Advance Tax:</span>
              <span>{formatRupee(extractedData.advanceTaxQ1 + extractedData.advanceTaxQ2 + extractedData.advanceTaxQ3 + extractedData.advanceTaxQ4)}</span>
            </div>
            <div className="pt-1 border-t border-[#e2dcce] flex justify-between font-semibold text-emerald-800">
              <span>Total Credits:</span>
              <span>{formatRupee(extractedData.totalTdsReported + extractedData.totalAdvanceTaxReported)}</span>
            </div>
          </div>
        </div>

        {/* Cross-Reconciliation & Discrepancy Observation Strip */}
        {extractedData.discrepancies.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Smart Audit Reconciler Observations:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 pl-1 font-mono">
              {extractedData.discrepancies.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
