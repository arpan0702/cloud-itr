"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  Building,
  Sparkles,
  ShieldCheck,
  Upload,
  FileText,
  Calculator,
  Download,
  Activity,
  FileCheck
} from "lucide-react";
import { WorkstationView } from "./components/WorkstationView";
import { SandboxView } from "./components/SandboxView";
import { DocReviewView } from "./components/DocReviewView";
import { IngestionStudio } from "./components/IngestionStudio";

type ViewMode = "workstation" | "sandbox" | "ingest" | "docs";

export default function CloudITRProPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("workstation");

  // Read URL query params on mount for direct deep-linking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode") || params.get("view");
      if (modeParam === "sandbox") {
        setViewMode("sandbox");
      } else if (modeParam === "ingest" || modeParam === "upload" || modeParam === "parser") {
        setViewMode("ingest");
      } else if (modeParam === "docs" || modeParam === "review") {
        setViewMode("docs");
      }
    }
  }, []);

  // Set explicit document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (viewMode === "sandbox") {
        document.title = "Filing Sandbox & ITD JSON Studio — CloudITR Pro | Nafisi Labs";
      } else if (viewMode === "ingest") {
        document.title = "Form 16 & AIS Document Ingestion — CloudITR Pro | Nafisi Labs";
      } else if (viewMode === "docs") {
        document.title = "Compliance & Test Specification Review — CloudITR Pro | Nafisi Labs";
      } else {
        document.title = "CloudITR Pro — CA Tax Compliance & Computation Engine | Nafisi Labs";
      }
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-stone-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
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
        {/* TOP LEVEL NAVIGATION SWITCHER: WORKSTATION / SANDBOX / INGEST / DOCS */}
        {/* ============================================================== */}
        <div className="mb-10 rounded-2xl border border-border bg-canvas p-2 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => setViewMode("workstation")}
              className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
                viewMode === "workstation"
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${viewMode === "workstation" ? "bg-stone-800 text-stone-200" : "bg-stone-200/60 text-ink"}`}>
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">CA Workstation</div>
                  <div className={`text-[11px] mt-1 ${viewMode === "workstation" ? "text-stone-300" : "text-ink-muted"}`}>
                    Multi-client practice
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                viewMode === "workstation" ? "bg-stone-800 text-stone-300" : "bg-stone-200/70 text-ink-soft"
              }`}>
                4 Clients
              </span>
            </button>

            <button
              onClick={() => setViewMode("sandbox")}
              className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
                viewMode === "sandbox"
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${viewMode === "sandbox" ? "bg-stone-800 text-amber-400" : "bg-stone-200/60 text-amber-600"}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Filing Sandbox</div>
                  <div className={`text-[11px] mt-1 ${viewMode === "sandbox" ? "text-stone-300" : "text-ink-muted"}`}>
                    Live JSON studio
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                viewMode === "sandbox" ? "bg-emerald-900/80 text-emerald-300" : "bg-emerald-100 text-emerald-800"
              }`}>
                Arpan AIS
              </span>
            </button>

            <button
              onClick={() => setViewMode("ingest")}
              className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
                viewMode === "ingest"
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${viewMode === "ingest" ? "bg-stone-800 text-sky-400" : "bg-stone-200/60 text-sky-700"}`}>
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Smart Ingestion</div>
                  <div className={`text-[11px] mt-1 ${viewMode === "ingest" ? "text-stone-300" : "text-ink-muted"}`}>
                    Form 16 &amp; AIS parser
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                viewMode === "ingest" ? "bg-sky-900/80 text-sky-300" : "bg-sky-100 text-sky-800"
              }`}>
                Auto-Fill
              </span>
            </button>

            <button
              onClick={() => setViewMode("docs")}
              className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
                viewMode === "docs"
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${viewMode === "docs" ? "bg-stone-800 text-emerald-400" : "bg-stone-200/60 text-emerald-700"}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Compliance &amp; Tests</div>
                  <div className={`text-[11px] mt-1 ${viewMode === "docs" ? "text-stone-300" : "text-ink-muted"}`}>
                    PRD matrix &amp; 22 tests
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                viewMode === "docs" ? "bg-stone-800 text-stone-300" : "bg-stone-200/70 text-ink-soft"
              }`}>
                22/22 Pass
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE VIEW RENDERING */}
        {/* ============================================================== */}
        {viewMode === "workstation" && <WorkstationView />}
        {viewMode === "sandbox" && <SandboxView />}
        {viewMode === "ingest" && (
          <IngestionStudio
            onApplyData={() => {
              setViewMode("sandbox");
            }}
          />
        )}
        {viewMode === "docs" && <DocReviewView />}

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
