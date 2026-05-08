"use client";

import { useState } from "react";
import { Apple, ChevronDown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppleShortcutGuide() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoint = typeof window !== "undefined" ? `${window.location.origin}/api/apple-health/sync` : "https://your-app.vercel.app/api/apple-health/sync";

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <button className="flex w-full items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <Apple className="h-4 w-4 text-white" />
          <p className="text-sm font-semibold text-white">Apple Watch Auto-Sync</p>
          <span className="rounded-full bg-[#c8f065]/10 px-2 py-0.5 text-[10px] text-[#c8f065]">Setup guide</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Set up a free iOS Shortcut that reads your Apple Health data every morning and syncs it here automatically — no app needed.
          </p>

          <div className="space-y-3">
            {[
              { step: "1", title: "Open Shortcuts app", desc: "On your iPhone, open the Shortcuts app → tap + to create new shortcut." },
              { step: "2", title: "Add 'Get Health Samples'", desc: "Search for 'Get Health Samples'. Add one for: Steps, Sleep Analysis, Active Energy, Heart Rate, Weight. Set Sample: Last Day." },
              { step: "3", title: "Add 'Get Contents of URL'", desc: "Add action → 'Get Contents of URL'. Set method to POST, content type to JSON." },
              { step: "4", title: "Set the URL", desc: "Paste your sync endpoint below into the URL field." },
              { step: "5", title: "Add JSON body", desc: `Set the body to JSON with: sync_secret (from your .env), date (current date as YYYY-MM-DD), steps, sleep_hrs, active_calories, resting_heart_rate, weight_lbs.` },
              { step: "6", title: "Automate it", desc: "Go to Automation tab → + → Time of Day → set to 7:00 AM daily → add your shortcut → done!" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c8f065] text-[10px] font-bold text-black">{step}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium text-white mb-2">Your sync endpoint:</p>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <code className="flex-1 text-[10px] text-[#c8f065] break-all">{endpoint}</code>
              <button onClick={() => copy(endpoint)} className="shrink-0 text-neutral-500 hover:text-white transition">
                {copied ? <Check className="h-3.5 w-3.5 text-[#c8f065]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
            <p className="text-xs text-amber-300">⚠️ Your <code>APPLE_HEALTH_SYNC_SECRET</code> env var is required in the POST body as <code>sync_secret</code>. Keep it private.</p>
          </div>
        </div>
      )}
    </div>
  );
}
