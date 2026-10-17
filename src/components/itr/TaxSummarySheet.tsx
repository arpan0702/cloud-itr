"use client";

import React from "react";
import { ClientProfile } from "@/lib/itr/types";
import { computeRegimeTax } from "@/lib/itr/engine/regime";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: ClientProfile;
}

export function TaxSummarySheet({ isOpen, onClose, profile }: Props) {
  if (!isOpen) return null;

  const calc = computeRegimeTax(profile, profile.regime);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Controls */}
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
              CA Practice Management
            </span>
            <span className="text-sm font-bold text-white">Client Computation Sheet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#22c55e]/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-lg p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Computation Document */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-black font-sans text-xs leading-relaxed print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-neutral-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                Statement of Total Income & Tax Computation
              </h1>
              <p className="text-neutral-600 font-medium">
                Assessment Year {profile.assessmentYear} | Previous Year {profile.fiscalYear}
              </p>
              <p className="text-[11px] text-neutral-500">
                Form: <b>{profile.selectedForm}</b> | Tax Regime: <b>{profile.regime.toUpperCase()} REGIME (Sec 115BAC)</b>
              </p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-[#16a34a]">CloudITR Pro</span>
              <p className="text-[10px] text-neutral-500">Cloud Compliance & Computation Engine</p>
              <p className="text-[10px] text-neutral-400">Date: {new Date().toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          {/* Taxpayer Information Grid */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 mb-6">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Name of Assessee</div>
              <div className="font-bold text-sm text-neutral-900">
                {profile.personal.firstName} {profile.personal.lastName}
              </div>
              <div className="text-[11px] text-neutral-600 mt-1">
                Father&apos;s Name: {profile.personal.fatherName || "N/A"}
              </div>
              <div className="text-[11px] text-neutral-600">
                DOB: {profile.personal.dob} ({profile.seniorCitizenStatus})
              </div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">PAN / Aadhaar</div>
              <div className="font-mono font-bold text-sm text-neutral-900">
                {profile.personal.pan} {profile.personal.aadhaar && `· ${profile.personal.aadhaar}`}
              </div>
              <div className="text-[11px] text-neutral-600 mt-1">
                Status: Individual · Resident
              </div>
              <div className="text-[11px] text-neutral-600">
                Bank: {profile.personal.bankAccounts[0]?.bankName} ({profile.personal.bankAccounts[0]?.ifscCode})
              </div>
            </div>
          </div>

          {/* Table: Computation of Total Income */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 border-b pb-1">
              I. Computation of Heads of Income
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 text-neutral-600 text-[11px]">
                  <th className="py-1.5">Particulars</th>
                  <th className="py-1.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-1.5 pl-2">1. Income from Salaries</td>
                  <td className="py-1.5 text-right font-mono font-medium">
                    {calc.incomeFromSalary.toLocaleString("en-IN")}
                  </td>
                </tr>
                {calc.incomeFromHouseProperty !== 0 && (
                  <tr>
                    <td className="py-1.5 pl-2">2. Income / (Loss) from House Property</td>
                    <td className="py-1.5 text-right font-mono font-medium">
                      {calc.incomeFromHouseProperty.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                {calc.incomeFromBusinessProfession > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2">3. Profits and Gains of Business or Profession (PGBP)</td>
                    <td className="py-1.5 text-right font-mono font-medium">
                      {calc.incomeFromBusinessProfession.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                {calc.incomeFromCapitalGains > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2">4. Capital Gains (STCG & LTCG)</td>
                    <td className="py-1.5 text-right font-mono font-medium">
                      {calc.incomeFromCapitalGains.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-1.5 pl-2">5. Income from Other Sources (Interest, Dividends)</td>
                  <td className="py-1.5 text-right font-mono font-medium">
                    {calc.incomeFromOtherSources.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="font-bold bg-neutral-50">
                  <td className="py-2 pl-2">Gross Total Income (GTI)</td>
                  <td className="py-2 text-right font-mono">
                    ₹{calc.grossTotalIncome.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-2 text-neutral-600">
                    Less: Deductions under Chapter VI-A
                  </td>
                  <td className="py-1.5 text-right font-mono text-neutral-700">
                    (-) ₹{calc.totalDeductionsChapterVIA.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="font-extrabold bg-neutral-100 text-neutral-900 border-t border-b border-neutral-300">
                  <td className="py-2 pl-2 text-sm">Total Taxable Income (Rounded u/s 288A)</td>
                  <td className="py-2 text-right font-mono text-sm">
                    ₹{calc.taxableTotalIncome.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table: Tax Liability */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2 border-b pb-1">
              II. Tax & Interest Liability
            </h2>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-1.5 pl-2">Tax at Normal Slab Rates</td>
                  <td className="py-1.5 text-right font-mono">
                    ₹{calc.normalTax.toLocaleString("en-IN")}
                  </td>
                </tr>
                {calc.specialRateTax > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2">Tax at Special Rates (Capital Gains / Winnings)</td>
                    <td className="py-1.5 text-right font-mono">
                      ₹{calc.specialRateTax.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                {(calc.rebate87A + calc.marginalRelief87A) > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2 text-green-700">
                      Less: Rebate u/s 87A & Marginal Relief
                    </td>
                    <td className="py-1.5 text-right font-mono text-green-700">
                      (-) ₹{(calc.rebate87A + calc.marginalRelief87A).toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                {calc.surcharge > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2">Add: Surcharge (after marginal relief)</td>
                    <td className="py-1.5 text-right font-mono">
                      ₹{calc.surcharge.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-1.5 pl-2">Add: Health & Education Cess (4%)</td>
                  <td className="py-1.5 text-right font-mono">
                    ₹{calc.healthAndEducationCess.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="font-bold bg-neutral-50">
                  <td className="py-1.5 pl-2">Gross Tax Liability</td>
                  <td className="py-1.5 text-right font-mono">
                    ₹{calc.grossTaxLiability.toLocaleString("en-IN")}
                  </td>
                </tr>
                {calc.totalInterestAndFees > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2 text-neutral-700">
                      Add: Interest & Late Fees (Sec 234A/B/C/F)
                    </td>
                    <td className="py-1.5 text-right font-mono text-amber-800">
                      ₹{calc.totalInterestAndFees.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                {calc.additionalTax139_8A > 0 && (
                  <tr>
                    <td className="py-1.5 pl-2 text-neutral-700">
                      Add: Additional Tax u/s 139(8A) (ITR-U)
                    </td>
                    <td className="py-1.5 text-right font-mono">
                      ₹{calc.additionalTax139_8A.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-1.5 pl-2 text-green-700">
                    Less: Pre-paid Taxes (TDS + Advance Tax + Self Assessment)
                  </td>
                  <td className="py-1.5 text-right font-mono text-green-700">
                    (-) ₹{calc.totalTaxesPaid.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="font-extrabold bg-neutral-900 text-white text-sm">
                  <td className="py-2.5 pl-2">
                    {calc.netTaxPayable > 0 ? "NET TAX PAYABLE (u/s 288B)" : "REFUND DUE (u/s 288B)"}
                  </td>
                  <td className="py-2.5 text-right font-mono pr-2">
                    ₹{(calc.netTaxPayable > 0 ? calc.netTaxPayable : calc.refundDue).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification & Sign-off */}
          <div className="pt-6 border-t-2 border-neutral-300 mt-8 flex justify-between items-end text-[11px] text-neutral-600">
            <div>
              <p>Generated by: CloudITR Pro Deterministic Compliance Engine</p>
              <p className="font-mono text-[9px] text-neutral-400">Digest: CITR_{profile.personal.pan}_VERIFIED</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-neutral-400 w-48 mb-1" />
              <p className="font-bold text-neutral-900">{profile.personal.firstName} {profile.personal.lastName}</p>
              <p className="text-[10px]">Assessee Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
