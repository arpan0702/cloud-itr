"use client";

import React from "react";
import { PreFlightAuditResult } from "@/lib/itr/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditResult: PreFlightAuditResult;
  onNavigateTab: (tab: string) => void;
}

export function PreFlightGatekeeperModal({
  isOpen,
  onClose,
  auditResult,
  onNavigateTab,
}: Props) {
  if (!isOpen) return null;

  const { isValid, blockingErrors, warnings } = auditResult;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                isValid
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {isValid ? "✓" : "⚠"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pre-Flight Validation & Schema Gatekeeper
              </h3>
              <p className="text-xs text-neutral-400">
                Official ITD JSON Schema Conformity & Mathematical Integrity Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white text-xl p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              isValid
                ? "bg-green-950/20 border-green-800/40 text-green-300"
                : "bg-red-950/20 border-red-800/40 text-red-300"
            }`}
          >
            <div className="text-2xl font-bold">{isValid ? "100%" : "FAIL"}</div>
            <div className="text-xs">
              <div className="font-bold text-sm text-white">
                {isValid
                  ? "Schema Validation Passed: Ready for E-Filing"
                  : `${blockingErrors.length} Schema-Blocking Discrepancies Found`}
              </div>
              <p className="text-neutral-400 mt-0.5">
                {isValid
                  ? "All statutory constraints, PAN/Aadhaar formats, Chapter VI-A caps, and TDS credits are verified. Official ITD JSON export is certified."
                  : "Return generation is locked to prevent defective return notices or ITD portal JSON upload rejections."}
              </p>
            </div>
          </div>

          {/* Blocking Errors */}
          {blockingErrors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>⛔ Blocking Schema Discrepancies ({blockingErrors.length})</span>
              </h4>
              <div className="space-y-2">
                {blockingErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 rounded-xl bg-red-950/15 border border-red-800/30 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-[10px] text-red-400 font-bold mb-0.5">
                        [{err.code}]
                      </div>
                      <div className="text-neutral-200">{err.message}</div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigateTab(err.tabTarget);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Fix Issue →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>⚠ Advisory Warnings ({warnings.length})</span>
              </h4>
              <div className="space-y-2">
                {warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="p-3 rounded-xl bg-amber-950/15 border border-amber-800/30 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-[10px] text-amber-400 font-bold mb-0.5">
                        [{warn.code}]
                      </div>
                      <div className="text-neutral-300">{warn.message}</div>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium whitespace-nowrap">
                      Auto-Adjusted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Checklist */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
            <h5 className="text-xs font-semibold text-neutral-300 mb-2.5">
              Statutory Verification Checklist:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className={auditResult.blockingErrors.every(e => e.field !== "pan") ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {auditResult.blockingErrors.every(e => e.field !== "pan") ? "✓" : "✗"}
                </span>
                <span>PAN Format Validation</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className={auditResult.blockingErrors.every(e => e.field !== "bankAccounts") ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {auditResult.blockingErrors.every(e => e.field !== "bankAccounts") ? "✓" : "✗"}
                </span>
                <span>Primary Refund Bank Account</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className={auditResult.blockingErrors.every(e => !e.id.includes("TDS")) ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {auditResult.blockingErrors.every(e => !e.id.includes("TDS")) ? "✓" : "✗"}
                </span>
                <span>TDS Claim vs 26AS Match</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className={auditResult.blockingErrors.every(e => !e.id.includes("BALANCE_SHEET")) ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {auditResult.blockingErrors.every(e => !e.id.includes("BALANCE_SHEET")) ? "✓" : "✗"}
                </span>
                <span>Schedule BPS Balance Check</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
