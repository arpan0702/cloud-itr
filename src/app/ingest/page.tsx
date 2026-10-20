"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Building, Sparkles, ShieldCheck, Upload } from "lucide-react";
import { IngestionStudio } from "../components/IngestionStudio";

export default function CloudITRIngestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-stone-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/labs/cloud-itr"
              className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink-soft transition-colors hover:text-ink"
            >
              ← CloudITR Pro Workstation
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="label-uppercase text-caption font-medium tracking-[var(--tracking-label)] text-ink">
              Smart Ingestion Studio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone="new">Parser Active</Badge>
            <Link
              href="/labs/cloud-itr/sandbox"
              className="label-uppercase inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3.5 py-1 text-[11px] font-medium tracking-[var(--tracking-label)] text-ink transition-all hover:border-ink shadow-sm"
            >
              <span>Go to Filing Sandbox</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="mb-10 rounded-2xl border border-border bg-canvas p-2 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Link
              href="/labs/cloud-itr"
              className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-200/60 text-ink">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">CA Workstation</div>
                  <div className="text-[11px] mt-1 text-ink-muted">Multi-client practice</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200/70 text-ink-soft">
                4 Clients
              </span>
            </Link>

            <Link
              href="/labs/cloud-itr/sandbox"
              className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-200/60 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Filing Sandbox</div>
                  <div className="text-[11px] mt-1 text-ink-muted">Live JSON studio</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Arpan AIS
              </span>
            </Link>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-ink text-paper shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-800 text-sky-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Smart Ingestion</div>
                  <div className="text-[11px] mt-1 text-stone-300">Form 16 &amp; AIS parser</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-900/80 text-sky-300">
                Auto-Fill
              </span>
            </div>

            <Link
              href="/labs/cloud-itr/docs"
              className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/50 hover:bg-stone-100/80 text-ink-soft hover:text-ink transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-200/60 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-xs leading-none">Compliance &amp; Tests</div>
                  <div className="text-[11px] mt-1 text-ink-muted">PRD matrix &amp; 22 tests</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200/70 text-ink-soft">
                22/22 Pass
              </span>
            </Link>
          </div>
        </div>

        <IngestionStudio
          onApplyData={() => {
            router.push("/labs/cloud-itr/sandbox");
          }}
        />
      </div>
    </div>
  );
}
