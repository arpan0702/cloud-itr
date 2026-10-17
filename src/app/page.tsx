"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientWorkspaceHeader } from "@/components/itr/ClientWorkspaceHeader";
import { AutoFormClassifierCard } from "@/components/itr/AutoFormClassifierCard";
import { AISReconciliationDiffCard } from "@/components/itr/AISReconciliationDiffCard";
import { DualRegimeComparatorCard } from "@/components/itr/DualRegimeComparatorCard";
import { AdvanceTaxTimelineCard } from "@/components/itr/AdvanceTaxTimelineCard";
import { DeductionUtilizationGauges } from "@/components/itr/DeductionUtilizationGauges";
import { IncomeDeductionsEditor } from "@/components/itr/IncomeDeductionsEditor";
import { PreFlightGatekeeperModal } from "@/components/itr/PreFlightGatekeeperModal";
import { OfficialJsonPreviewModal } from "@/components/itr/OfficialJsonPreviewModal";
import { TaxSummarySheet } from "@/components/itr/TaxSummarySheet";
import { MOCK_PROFILES, MOCK_AIS_RECORDS } from "@/lib/itr/mockProfiles";
import { ClientProfile, ITRFormType, TaxRegime } from "@/lib/itr/types";
import { validateClientProfileForITD } from "@/lib/itr/validation/schemaValidator";

export default function CloudITRProfessionalWorkspace() {
  const [clients, setClients] = useState<ClientProfile[]>(MOCK_PROFILES);
  const [activeClientId, setActiveClientId] = useState<string>(MOCK_PROFILES[0].id);
  const [activeSubTab, setActiveSubTab] = useState<string>("personal");
  const [aisRecords] = useState(MOCK_AIS_RECORDS);

  // Modals
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Active client
  const activeClient =
    clients.find((c) => c.id === activeClientId) || clients[0];

  // Pre-Flight Audit Result
  const auditResult = validateClientProfileForITD(activeClient);

  // Handlers
  const handleUpdateActiveClient = (updated: ClientProfile) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleAddClient = () => {
    const newId = `client-${Date.now()}`;
    const newClient: ClientProfile = {
      ...JSON.parse(JSON.stringify(MOCK_PROFILES[0])),
      id: newId,
      status: "DRAFT",
      personal: {
        ...MOCK_PROFILES[0].personal,
        pan: "ABCDE9999Z",
        firstName: "New",
        lastName: "Client",
        mobile: "9999999999",
        email: "client@capractice.in",
      },
      lastUpdated: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    setActiveClientId(newId);
  };

  const handleUpdateForm = (form: ITRFormType) => {
    const updated = { ...activeClient, selectedForm: form };
    handleUpdateActiveClient(updated);
  };

  const handleSelectRegime = (regime: TaxRegime) => {
    const updated = { ...activeClient, regime };
    handleUpdateActiveClient(updated);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 selection:bg-emerald-400 selection:text-black font-sans">
      {/* Dedicated Standalone CA Portal Navigation Header */}
      <nav className="border-b border-[#1c2233] bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center font-mono text-base shadow-sm">
                §
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-tight flex items-center gap-1.5">
                  CloudITR <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">PRO</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wide">
                  Cloud Income Tax Compliance Engine
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-[#192133] text-emerald-400 border border-emerald-500/30">
                Filing Console
              </span>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Pre-Flight Audit
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Computation Sheet
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#141824] px-3 py-1 rounded-lg border border-[#232a3d]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AY 2025-26 Active</span>
            </div>

            <button
              onClick={() => setIsJsonModalOpen(true)}
              disabled={!auditResult.canExportJson}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                auditResult.canExportJson
                  ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-sm"
                  : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60"
              }`}
            >
              Export ITD JSON
            </button>
          </div>
        </div>
      </nav>

      {/* Main CA Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Workspace Top Header & Practice Grid */}
        <ClientWorkspaceHeader
          clients={clients}
          activeClientId={activeClientId}
          onSelectClient={setActiveClientId}
          onAddClient={handleAddClient}
          onRunAudit={() => setIsAuditModalOpen(true)}
          onOpenJsonModal={() => setIsJsonModalOpen(true)}
          onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
          canExportJson={auditResult.canExportJson}
          blockingErrorCount={auditResult.blockingErrors.length}
        />

        {/* 1. Rule-Based Form Classifier Card */}
        <AutoFormClassifierCard
          profile={activeClient}
          onUpdateForm={handleUpdateForm}
        />

        {/* 2. Real-Time Dual-Regime Optimizer Card */}
        <DualRegimeComparatorCard
          profile={activeClient}
          onSelectRegime={handleSelectRegime}
        />

        {/* 3. Section 234C Advance Tax Schedule Timeline */}
        <AdvanceTaxTimelineCard profile={activeClient} />

        {/* 4. Deduction & Exemption Utilization Gauges */}
        <DeductionUtilizationGauges profile={activeClient} />

        {/* 5. Ingestion & AIS Reconciliation Diff Inspector */}
        <AISReconciliationDiffCard
          profile={activeClient}
          aisRecords={aisRecords}
          onProfileUpdated={handleUpdateActiveClient}
        />

        {/* 6. Comprehensive Statutory Schedules Editor */}
        <IncomeDeductionsEditor
          profile={activeClient}
          onChange={handleUpdateActiveClient}
          activeSubTab={activeSubTab}
          onSelectSubTab={setActiveSubTab}
        />
      </main>

      {/* Modals */}
      <PreFlightGatekeeperModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditResult={auditResult}
        onNavigateTab={(tab) => {
          setActiveSubTab(tab);
        }}
      />

      <OfficialJsonPreviewModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        profile={activeClient}
      />

      <TaxSummarySheet
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        profile={activeClient}
      />
    </div>
  );
}
