"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Summary = { id: string; week_start: string; week_end: string; summary: string; stats: Record<string, any> | null };

export function WeeklySummaryCard({ summary }: { summary: Summary }) {
  const [open, setOpen] = useState(false);
  const stats = summary.stats ?? {};

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <button className="flex w-full items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="text-left">
          <p className="text-xs text-neutral-500">Week of</p>
          <p className="text-sm font-semibold text-white">{summary.week_start} → {summary.week_end}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {stats.avgCalories !== undefined && (
                <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                  <p className="text-sm font-semibold text-white">{stats.avgCalories}</p>
                  <p className="text-[10px] text-neutral-500">avg cal/day</p>
                </div>
              )}
              {stats.avgProtein !== undefined && (
                <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                  <p className="text-sm font-semibold text-blue-400">{stats.avgProtein}g</p>
                  <p className="text-[10px] text-neutral-500">avg protein</p>
                </div>
              )}
              {stats.workoutDays !== undefined && (
                <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                  <p className="text-sm font-semibold text-[#c8f065]">{stats.workoutDays}/5</p>
                  <p className="text-[10px] text-neutral-500">workout days</p>
                </div>
              )}
              {stats.latestWeight !== undefined && stats.latestWeight && (
                <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                  <p className="text-sm font-semibold text-white">{stats.latestWeight} lbs</p>
                  <p className="text-[10px] text-neutral-500">weight</p>
                </div>
              )}
            </div>
          )}
          <p className="text-sm leading-relaxed text-neutral-300">{summary.summary}</p>
        </div>
      )}
    </div>
  );
}
