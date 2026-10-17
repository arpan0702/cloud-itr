"use client";

import React, { useState } from "react";
import { ClientProfile } from "@/lib/itr/types";
import { generateOfficialITDJson } from "@/lib/itr/export/itdJsonGenerator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: ClientProfile;
}

export function OfficialJsonPreviewModal({ isOpen, onClose, profile }: Props) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const itdJson = generateOfficialITDJson(profile);
  const jsonString = JSON.stringify(itdJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.personal.pan}_${profile.selectedForm}_AY${profile.assessmentYear}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 flex items-center justify-center font-mono font-bold text-sm">
              {"{ }"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Official ITD Schema Return JSON
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e] font-bold">
                  ITD VERIFIED
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Generated strictly against the active Income Tax Department JSON schema for AY {profile.assessmentYear} ({profile.selectedForm})
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

        {/* Action bar */}
        <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <span>File:</span>
            <span className="font-mono text-neutral-200">
              {profile.personal.pan}_{profile.selectedForm}_AY{profile.assessmentYear}.json
            </span>
            <span className="text-neutral-500">•</span>
            <span>{(jsonString.length / 1024).toFixed(1)} KB</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
            >
              {copied ? "✓ Copied to Clipboard" : "Copy JSON"}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold shadow-md shadow-[#22c55e]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Return JSON
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="p-4 overflow-y-auto flex-1 bg-black font-mono text-[11px] text-emerald-400/90 leading-relaxed scrollbar-thin">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>Ready for upload at <b>incometax.gov.in → e-File → Income Tax Returns → File Income Tax Return</b></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
