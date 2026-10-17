"use client";

import React from "react";
import { ClientProfile, TaxRegime } from "@/lib/itr/types";
import { compareRegimes } from "@/lib/itr/engine/regime";

interface Props {
  profile: ClientProfile;
  onSelectRegime: (regime: TaxRegime) => void;
}

export function DualRegimeComparatorCard({ profile, onSelectRegime }: Props) {
  const comparison = compareRegimes(profile);
  const { oldRegime, newRegime, recommendedRegime, taxSavings, summaryRationale } =
    comparison;

  const activeRegime = profile.regime;

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-8 shadow-xl">
      {/* Header & Recommendation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
              Statutory Regime Optimizer
            </span>
            <span className="text-xs text-neutral-400">
              Real-Time Dual-Regime Matrix
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            New vs Old Tax Regime Optimization (Section 115BAC)
          </h3>
        </div>

        <div className="p-3 rounded-xl bg-[#1a2e1a] border border-[#22c55e]/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-bold">
            ₹
          </div>
          <div>
            <div className="text-[11px] text-[#22c55e] font-bold uppercase tracking-wider">
              Recommendation: {recommendedRegime.toUpperCase()} REGIME
            </div>
            <div className="text-xs text-neutral-200">
              Save{" "}
              <span className="font-extrabold text-white">
                ₹{taxSavings.toLocaleString("en-IN")}
              </span>{" "}
              with {recommendedRegime === "new" ? "New Regime" : "Old Regime"}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mb-5 bg-neutral-950/60 p-3 rounded-xl border border-neutral-900">
        <span className="font-semibold text-neutral-300">Analysis: </span>
        {summaryRationale}
      </p>

      {/* Side-by-Side Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[11px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="py-3 px-4">Tax Computation Component</th>
              <th
                className={`py-3 px-4 text-right cursor-pointer transition-colors ${
                  activeRegime === "new"
                    ? "bg-[#22c55e]/10 text-[#22c55e] border-b-2 border-[#22c55e]"
                    : "hover:bg-neutral-800"
                }`}
                onClick={() => onSelectRegime("new")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>New Regime (Sec 115BAC)</span>
                  {activeRegime === "new" && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#22c55e] text-black font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              </th>
              <th
                className={`py-3 px-4 text-right cursor-pointer transition-colors ${
                  activeRegime === "old"
                    ? "bg-[#22c55e]/10 text-[#22c55e] border-b-2 border-[#22c55e]"
                    : "hover:bg-neutral-800"
                }`}
                onClick={() => onSelectRegime("old")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Old Regime</span>
                  {activeRegime === "old" && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#22c55e] text-black font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-neutral-300">
            {/* Income Heads */}
            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium">Gross Total Income (GTI)</td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{newRegime.grossTotalIncome.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{oldRegime.grossTotalIncome.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium pl-6 text-neutral-400">
                • Standard Deduction (Sec 16(ia))
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[#22c55e]">
                -₹{newRegime.standardDeduction.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-neutral-400">
                -₹{oldRegime.standardDeduction.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium pl-6 text-neutral-400">
                • Chapter VI-A Deductions (80C, 80D, etc.)
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-neutral-500">
                -₹{newRegime.totalDeductionsChapterVIA.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[#22c55e]">
                -₹{oldRegime.totalDeductionsChapterVIA.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="bg-neutral-900/40 font-semibold text-white">
              <td className="py-2.5 px-4">
                Total Taxable Income (Rounded u/s 288A)
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-base">
                ₹{newRegime.taxableTotalIncome.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-base">
                ₹{oldRegime.taxableTotalIncome.toLocaleString("en-IN")}
              </td>
            </tr>

            {/* Tax Calculations */}
            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium">Normal Slab Tax</td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{newRegime.normalTax.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{oldRegime.normalTax.toLocaleString("en-IN")}
              </td>
            </tr>

            {newRegime.specialRateTax > 0 && (
              <tr className="hover:bg-neutral-900/30">
                <td className="py-2.5 px-4 font-medium pl-6 text-neutral-400">
                  • Special Rate Tax (STCG 111A / LTCG 112A)
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  ₹{newRegime.specialRateTax.toLocaleString("en-IN")}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  ₹{oldRegime.specialRateTax.toLocaleString("en-IN")}
                </td>
              </tr>
            )}

            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium pl-6 text-neutral-400">
                • Section 87A Rebate & Marginal Relief
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[#22c55e]">
                -₹{(newRegime.rebate87A + newRegime.marginalRelief87A).toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-neutral-400">
                -₹{oldRegime.rebate87A.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 font-medium pl-6 text-neutral-400">
                • Health & Education Cess (4%)
              </td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{newRegime.healthAndEducationCess.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{oldRegime.healthAndEducationCess.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="hover:bg-neutral-900/30 font-medium">
              <td className="py-2.5 px-4">Gross Tax Liability</td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{newRegime.grossTaxLiability.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono">
                ₹{oldRegime.grossTaxLiability.toLocaleString("en-IN")}
              </td>
            </tr>

            {/* Interest */}
            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 text-neutral-400">
                Interest & Fees (Sec 234A, 234B, 234C, 234F)
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                ₹{newRegime.totalInterestAndFees.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-amber-400">
                ₹{oldRegime.totalInterestAndFees.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr className="hover:bg-neutral-900/30">
              <td className="py-2.5 px-4 text-neutral-400">
                Pre-paid Taxes (TDS, TCS, Advance Tax)
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[#22c55e]">
                -₹{newRegime.totalTaxesPaid.toLocaleString("en-IN")}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-[#22c55e]">
                -₹{oldRegime.totalTaxesPaid.toLocaleString("en-IN")}
              </td>
            </tr>

            {/* Bottom Line */}
            <tr className="bg-neutral-950 font-bold border-t-2 border-neutral-800">
              <td className="py-4 px-4 text-sm text-white">
                Final Net Tax Payable / (Refund Due)
              </td>
              <td className="py-4 px-4 text-right font-mono text-lg">
                {newRegime.netTaxPayable > 0 ? (
                  <span className="text-red-400">
                    ₹{newRegime.netTaxPayable.toLocaleString("en-IN")} Payable
                  </span>
                ) : (
                  <span className="text-[#22c55e]">
                    ₹{newRegime.refundDue.toLocaleString("en-IN")} Refund
                  </span>
                )}
              </td>
              <td className="py-4 px-4 text-right font-mono text-lg">
                {oldRegime.netTaxPayable > 0 ? (
                  <span className="text-red-400">
                    ₹{oldRegime.netTaxPayable.toLocaleString("en-IN")} Payable
                  </span>
                ) : (
                  <span className="text-[#22c55e]">
                    ₹{oldRegime.refundDue.toLocaleString("en-IN")} Refund
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => onSelectRegime("new")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRegime === "new"
              ? "bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          Select New Regime
        </button>
        <button
          onClick={() => onSelectRegime("old")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeRegime === "old"
              ? "bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          Select Old Regime
        </button>
      </div>
    </div>
  );
}
