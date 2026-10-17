"use client";

import React, { useState } from "react";
import { ClientProfile, ITRFormType } from "@/lib/itr/types";
import { classifyITRForm } from "@/lib/itr/formClassifier";

interface Props {
  profile: ClientProfile;
  onUpdateForm: (form: ITRFormType) => void;
}

export function AutoFormClassifierCard({ profile, onUpdateForm }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const classification = classifyITRForm(profile);

  const formDescriptions: Record<ITRFormType, string> = {
    "ITR-1": "Sahaj: Resident individuals with salary, 1 house property, other sources, income up to ₹50L.",
    "ITR-2": "Individuals & HUFs not having business/profession income. Permits capital gains, multiple properties, foreign assets.",
    "ITR-3": "Individuals & HUFs having income from business, profession, F&O trading, or balance sheet audit.",
    "ITR-4": "Sugam: Presumptive business (44AD), profession (44ADA), or goods transport (44AE) up to ₹50L.",
    "ITR-5": "Firms, LLPs, AOPs, and BOIs.",
    "ITR-6": "Companies other than companies claiming exemption under section 11.",
    "ITR-U": "Updated return under Section 139(8A) within 24 months from the end of Assessment Year.",
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              Rule-Based Auto Classifier
            </span>
            <span className="text-xs text-neutral-400">
              Deterministic Tax Form Engine
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            Recommended Filing Form:
            <span className="text-xl font-extrabold text-[#22c55e] px-2.5 py-0.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
              {classification.recommendedForm}
            </span>
            {profile.selectedForm !== classification.recommendedForm && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Manual Override Active: {profile.selectedForm}
              </span>
            )}
          </h2>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 transition-all cursor-pointer"
        >
          {showDetails ? "Hide Rationale" : "Inspect Form Rationale ▾"}
        </button>
      </div>

      <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
        {formDescriptions[classification.recommendedForm]}
      </p>

      {/* Rationale Bullet points */}
      <div className="space-y-1.5 mb-4 bg-neutral-950/60 p-3 rounded-xl border border-neutral-900">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Classification Rationale:
        </span>
        {classification.rationale.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
            <span className="text-[#22c55e] font-bold mt-0.5">✓</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* Ineligible Forms Reasons (Expandable) */}
      {showDetails && (
        <div className="pt-3 border-t border-neutral-900 mt-3 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 mb-2">
              Excluded Forms & Disqualification Reasons:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {classification.ineligibleForms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs flex flex-col gap-1"
                >
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {item.form} Ineligible
                  </span>
                  <span className="text-neutral-400 text-[11px] leading-relaxed">
                    {item.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Switcher for CAs */}
          <div className="pt-2">
            <span className="text-xs text-neutral-400 mr-2">Select Active Form:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {(["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-U"] as ITRFormType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => onUpdateForm(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    profile.selectedForm === f
                      ? "bg-[#22c55e] text-black font-bold"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
