"use client";

import React from "react";
import { ClientProfile } from "@/lib/itr/types";

interface Props {
  profile: ClientProfile;
}

export function DeductionUtilizationGauges({ profile }: Props) {
  const isOldRegime = profile.regime === "old";

  const sec80CClaimed = profile.deductions.sec80C;
  const sec80CMax = 150000;
  const sec80CPct = Math.min(100, Math.round((sec80CClaimed / sec80CMax) * 100));

  const npsClaimed = profile.deductions.sec80CCD1B;
  const npsMax = 50000;
  const npsPct = Math.min(100, Math.round((npsClaimed / npsMax) * 100));

  const selfLimit = profile.deductions.selfSeniorCitizen ? 50000 : 25000;
  const parentsLimit = profile.deductions.parentsSeniorCitizen ? 50000 : 25000;
  const total80DMax = selfLimit + parentsLimit;
  const total80DClaimed = profile.deductions.sec80D_Self + profile.deductions.sec80D_Parents;
  const healthPct = Math.min(100, Math.round((total80DClaimed / total80DMax) * 100));

  let homeLoanInterest = 0;
  for (const hp of profile.houseProperties) {
    if (hp.propertyType === "SELF_OCCUPIED") homeLoanInterest += hp.homeLoanInterest;
  }
  const homeLoanMax = 200000;
  const homeLoanPct = Math.min(100, Math.round((homeLoanInterest / homeLoanMax) * 100));

  return (
    <div className="bg-[#12141a] border border-[#232733] rounded-2xl p-6 mb-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#202534]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider font-mono">
              Statutory Exemption Caps
            </span>
            <span className="text-xs text-neutral-400">
              Tax Deductions Efficiency
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Chapter VI-A &amp; Section 24(b) Deduction Utilization
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Visual tracking of claimed investments against statutory statutory caps to ensure zero leaked deductions.
          </p>
        </div>

        {!isOldRegime && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 self-start sm:self-auto">
            ℹ Active: New Regime (Sec 115BAC) — Exemptions Foregone
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 80C Gauge */}
        <div className="p-4 rounded-xl bg-[#171a22] border border-[#282d3d]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-xs font-bold text-white">Section 80C</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{sec80CPct}%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block mb-3">EPF, PPF, ELSS, Life Insurance</span>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${sec80CPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>₹{sec80CClaimed.toLocaleString("en-IN")}</span>
            <span>Cap: ₹1.5L</span>
          </div>
        </div>

        {/* 80CCD(1B) NPS Gauge */}
        <div className="p-4 rounded-xl bg-[#171a22] border border-[#282d3d]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-xs font-bold text-white">Sec 80CCD(1B) NPS</span>
            <span className="text-xs font-mono font-bold text-blue-400">{npsPct}%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block mb-3">Voluntary Tier-1 NPS</span>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${npsPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>₹{npsClaimed.toLocaleString("en-IN")}</span>
            <span>Cap: ₹50K</span>
          </div>
        </div>

        {/* 80D Health Gauge */}
        <div className="p-4 rounded-xl bg-[#171a22] border border-[#282d3d]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-xs font-bold text-white">Section 80D Health</span>
            <span className="text-xs font-mono font-bold text-purple-400">{healthPct}%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block mb-3">Self + Senior Parents</span>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>₹{total80DClaimed.toLocaleString("en-IN")}</span>
            <span>Cap: ₹{(total80DMax / 1000).toFixed(0)}K</span>
          </div>
        </div>

        {/* Home Loan 24(b) Gauge */}
        <div className="p-4 rounded-xl bg-[#171a22] border border-[#282d3d]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-xs font-bold text-white">Sec 24(b) Housing</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{homeLoanPct}%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block mb-3">Self-Occupied Home Loan</span>
          <div className="w-full bg-neutral-800 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${homeLoanPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
            <span>₹{homeLoanInterest.toLocaleString("en-IN")}</span>
            <span>Cap: ₹2.0L</span>
          </div>
        </div>
      </div>
    </div>
  );
}
