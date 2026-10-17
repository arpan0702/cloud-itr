"use client";

import React from "react";
import { ClientProfile } from "@/lib/itr/types";

interface Props {
  clients: ClientProfile[];
  activeClientId: string;
  onSelectClient: (id: string) => void;
  onAddClient: () => void;
  onRunAudit: () => void;
  onOpenJsonModal: () => void;
  onOpenSummaryModal: () => void;
  canExportJson: boolean;
  blockingErrorCount: number;
}

export function ClientWorkspaceHeader({
  clients,
  activeClientId,
  onSelectClient,
  onAddClient,
  onRunAudit,
  onOpenJsonModal,
  onOpenSummaryModal,
  canExportJson,
  blockingErrorCount,
}: Props) {
  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];

  const getStatusBadge = (status: ClientProfile["status"]) => {
    switch (status) {
      case "DRAFT":
        return { bg: "#202533", border: "#2f364a", color: "#94a3b8", label: "Draft Entry" };
      case "IN_REVIEW":
        return { bg: "#2a2215", border: "#4a3b1a", color: "#fbbf24", label: "In Review (CA Audit)" };
      case "VALIDATED":
        return { bg: "#13231a", border: "#1f4a30", color: "#34d399", label: "Validated (Schema Passed)" };
      case "READY_TO_FILE":
        return { bg: "#152433", border: "#1d4060", color: "#38bdf8", label: "Ready to E-File" };
      case "FILED":
        return { bg: "#16281b", border: "#22552e", color: "#4ade80", label: "Filed u/s 139(1)" };
      default:
        return { bg: "#1e293b", border: "#334155", color: "#94a3b8", label: status };
    }
  };

  const statusBadge = getStatusBadge(activeClient.status);

  return (
    <header className="bg-[#0f1117] border border-[#232735] rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
      {/* Top Professional Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Dedicated Brand */}
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center font-mono text-sm shadow-sm">
                §
              </span>
              <span className="font-extrabold text-white text-base tracking-tight">
                CloudITR <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">PRO</span>
              </span>
            </div>

            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400 font-mono font-medium">
              AY {activeClient.assessmentYear} (FY {activeClient.fiscalYear})
            </span>
            <span className="text-neutral-600">•</span>

            <span
              className="text-xs px-3 py-1 rounded-full font-semibold border"
              style={{
                background: statusBadge.bg,
                borderColor: statusBadge.border,
                color: statusBadge.color,
              }}
            >
              ● {statusBadge.label}
            </span>

            {activeClient.presumptive.isApplicable && (
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono font-medium">
                Tax Audit: Sec 44AD/ADA
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {activeClient.personal.firstName} {activeClient.personal.lastName}
            </h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#191d29] text-emerald-400 border border-[#2c3347] font-bold">
              PAN: {activeClient.personal.pan}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Status: <b className="text-neutral-200">Resident Individual</b>
            </span>
          </div>
        </div>

        {/* Global CA Action Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onRunAudit}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a1f2c] hover:bg-[#232a3c] text-neutral-200 border border-[#2f384f] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pre-Flight Schema Audit</span>
            {blockingErrorCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                {blockingErrorCount} Blocking
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Passed
              </span>
            )}
          </button>

          <button
            onClick={onOpenSummaryModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a1f2c] hover:bg-[#232a3c] text-neutral-200 border border-[#2f384f] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CA Tax Statement
          </button>

          <button
            onClick={onOpenJsonModal}
            disabled={!canExportJson}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              canExportJson
                ? "bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-lg shadow-emerald-500/20"
                : "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60"
            }`}
            title={
              canExportJson
                ? "Generate & Download Official Income Tax Department Schema Return JSON"
                : "Return locked: Resolve schema blocking errors"
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {canExportJson ? "Export Official ITD JSON" : "Locked (Audit Discrepancies)"}
          </button>
        </div>
      </div>

      {/* Multi-Client Filing Grid (Tabs for CA Practice) */}
      <div className="flex items-center gap-2.5 pt-4 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-neutral-400 font-mono font-bold whitespace-nowrap uppercase tracking-wider mr-1">
          CA Practice Grid:
        </span>
        {clients.map((client) => {
          const isActive = client.id === activeClientId;
          return (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm"
                  : "bg-[#161a24] text-neutral-400 hover:text-white border border-[#252a3b] hover:border-neutral-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
              <span>
                {client.personal.firstName} {client.personal.lastName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-neutral-300 font-bold">
                {client.selectedForm}
              </span>
            </button>
          );
        })}

        <button
          onClick={onAddClient}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#1a1f2c] border border-dashed border-[#343c54] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span className="text-emerald-400 font-bold">+</span>
          <span>New Client File</span>
        </button>
      </div>
    </header>
  );
}
