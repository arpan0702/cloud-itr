"use client";

import React from "react";
import { ClientProfile } from "@/lib/itr/types";
import { computeRegimeTax } from "@/lib/itr/engine/regime";

interface Props {
  profile: ClientProfile;
}

export function AdvanceTaxTimelineCard({ profile }: Props) {
  const calc = computeRegimeTax(profile, profile.regime);
  const assessedTax = Math.max(0, calc.grossTaxLiability - calc.totalTaxesPaid + calc.totalInterestAndFees);

  // Quarterly targets
  const q1Target = Math.round(assessedTax * 0.15);
  const q2Target = Math.round(assessedTax * 0.45);
  const q3Target = Math.round(assessedTax * 0.75);
  const q4Target = Math.round(assessedTax * 1.0);

  // Paid amounts
  let q1Paid = 0;
  let q2Paid = 0;
  let q3Paid = 0;
  let q4Paid = 0;

  for (const at of profile.advanceTaxInstallments) {
    if (at.depositDate <= "2024-06-15") q1Paid += at.amount;
    else if (at.depositDate <= "2024-09-15") q2Paid += at.amount;
    else if (at.depositDate <= "2024-12-15") q3Paid += at.amount;
    else q4Paid += at.amount;
  }

  const cumQ1 = q1Paid;
  const cumQ2 = cumQ1 + q2Paid;
  const cumQ3 = cumQ2 + q3Paid;
  const cumQ4 = cumQ3 + q4Paid;

  const quarters = [
    {
      quarter: "Q1 Installment",
      due: "15th June",
      minPercent: "15%",
      target: q1Target,
      cumPaid: cumQ1,
      compliant: cumQ1 >= Math.round(assessedTax * 0.12),
      shortfall: Math.max(0, q1Target - cumQ1),
    },
    {
      quarter: "Q2 Installment",
      due: "15th September",
      minPercent: "45%",
      target: q2Target,
      cumPaid: cumQ2,
      compliant: cumQ2 >= Math.round(assessedTax * 0.36),
      shortfall: Math.max(0, q2Target - cumQ2),
    },
    {
      quarter: "Q3 Installment",
      due: "15th December",
      minPercent: "75%",
      target: q3Target,
      cumPaid: cumQ3,
      compliant: cumQ3 >= q3Target,
      shortfall: Math.max(0, q3Target - cumQ3),
    },
    {
      quarter: "Q4 Installment",
      due: "15th March",
      minPercent: "100%",
      target: q4Target,
      cumPaid: cumQ4,
      compliant: cumQ4 >= q4Target,
      shortfall: Math.max(0, q4Target - cumQ4),
    },
  ];

  return (
    <div className="bg-[#12141a] border border-[#232733] rounded-2xl p-6 mb-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#202534]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-mono">
              Section 234C Audit Schedule
            </span>
            <span className="text-xs text-neutral-400">
              Advance Tax Milestone Tracking
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Quarterly Advance Tax Compliance &amp; Interest Analyzer
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Evaluates quarterly tax installments against Section 234C thresholds to prevent 1% monthly penal interest.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#1a1d26] px-4 py-2.5 rounded-xl border border-[#2b3040]">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">
              Total 234C Interest
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              ₹{calc.interest234C.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-700" />
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-mono">
              Assessed Net Tax
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              ₹{assessedTax.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarters.map((q, idx) => {
          const percentPaid = q.target > 0 ? Math.min(100, Math.round((q.cumPaid / q.target) * 100)) : 100;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                q.compliant
                  ? "bg-[#141d17] border-emerald-500/30 text-neutral-200"
                  : "bg-[#201515] border-red-500/30 text-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white">{q.quarter}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    q.compliant
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {q.compliant ? "✓ Compliant" : "⚠ Shortfall"}
                </span>
              </div>

              <div className="text-[11px] text-neutral-400 mb-3">
                Due: <span className="text-neutral-200 font-semibold">{q.due}</span> ({q.minPercent})
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    q.compliant ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ width: `${percentPaid}%` }}
                />
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Statutory Target:</span>
                  <span className="text-white font-medium">₹{q.target.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Cumulative Paid:</span>
                  <span className={q.compliant ? "text-emerald-400 font-bold" : "text-neutral-300 font-medium"}>
                    ₹{q.cumPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                {!q.compliant && (
                  <div className="flex justify-between text-red-400 text-[11px] font-bold pt-1 border-t border-red-900/40">
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
  );
}
