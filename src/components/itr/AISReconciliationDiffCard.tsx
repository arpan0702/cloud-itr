"use client";

import React from "react";
import { AISRecord, ClientProfile } from "@/lib/itr/types";
import {
  generateReconciliationDiff,
  autoReconcileProfileWithAIS,
} from "@/lib/itr/ingestion/aisReconciler";

interface Props {
  profile: ClientProfile;
  aisRecords: AISRecord[];
  onProfileUpdated: (updated: ClientProfile) => void;
}

export function AISReconciliationDiffCard({
  profile,
  aisRecords,
  onProfileUpdated,
}: Props) {
  const diffSummary = generateReconciliationDiff(profile, aisRecords);

  const handleAutoReconcile = () => {
    const updated = autoReconcileProfileWithAIS(profile, aisRecords);
    onProfileUpdated(updated);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              AIS / 26AS Diff Inspector
            </span>
            {diffSummary.isFullyReconciled ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                ✓ 100% Reconciled
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                ⚠ {diffSummary.underReportedCount} Discrepancies Flagged
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Tax Information Network & Ingestion Reconciliation
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cross-verifies reported annual information (AIS/TIS/26AS) against your return entries to prevent Section 143(1)(a) intimation notices.
          </p>
        </div>

        {!diffSummary.isFullyReconciled && (
          <button
            onClick={handleAutoReconcile}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-md shadow-[#22c55e]/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            1-Click Auto-Reconcile
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-500 block">AIS Reported Income</span>
          <span className="text-base font-bold text-white">
            ₹{diffSummary.totalAisReportedIncome.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-500 block">Declared Return Income</span>
          <span className="text-base font-bold text-white">
            ₹{diffSummary.totalItrDeclaredIncome.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-500 block">26AS Available TDS</span>
          <span className="text-base font-bold text-[#22c55e]">
            ₹{diffSummary.totalAisTds.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-500 block">Claimed TDS Credit</span>
          <span className="text-base font-bold text-white">
            ₹{diffSummary.totalItrTdsClaimed.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Reconciliation Diff Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-900/90 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="py-2.5 px-3">Information Category</th>
              <th className="py-2.5 px-3">Counterparty / TAN</th>
              <th className="py-2.5 px-3 text-right">AIS Reported</th>
              <th className="py-2.5 px-3 text-right">Declared in Return</th>
              <th className="py-2.5 px-3 text-right">TDS (26AS / Claim)</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Resolution Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {diffSummary.items.map((item) => {
              const isUnder = item.status === "UNDER_REPORTED";
              const isExcess = item.status === "EXCESS_CREDIT";
              const isMatched = item.status === "MATCHED";

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-neutral-900/40 transition-colors ${
                    isUnder
                      ? "bg-red-950/15"
                      : isExcess
                      ? "bg-amber-950/15"
                      : ""
                  }`}
                >
                  <td className="py-3 px-3 font-medium text-white">{item.category}</td>
                  <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">{item.description}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    ₹{item.aisReportedAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    <span className={isUnder ? "text-red-400 font-bold" : "text-neutral-200"}>
                      ₹{item.itrDeclaredAmount.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px]">
                    <span className="text-neutral-400">₹{item.aisTdsReported.toLocaleString("en-IN")}</span>
                    {" / "}
                    <span className={isExcess ? "text-amber-400 font-bold" : "text-neutral-300"}>
                      ₹{item.itrTdsClaimed.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isMatched && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold">
                        MATCHED
                      </span>
                    )}
                    {isUnder && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                        UNDER-REPORTED
                      </span>
                    )}
                    {isExcess && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        EXCESS CLAIM
                      </span>
                    )}
                    {item.status === "OVER_REPORTED" && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        OVER-REPORTED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-neutral-400 max-w-xs">
                    {item.actionRecommendation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
