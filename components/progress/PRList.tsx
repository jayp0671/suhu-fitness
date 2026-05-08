"use client";

import { Trophy } from "lucide-react";

type PR = { id: string; exercise_name: string; weight_lbs: number; reps_done: string | null; previous_best: number | null; achieved_at: string };

export function PRList({ prs }: { prs: PR[] }) {
  if (prs.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-amber-400" />
        <p className="text-sm font-semibold text-white">Personal Records</p>
      </div>
      <div className="space-y-2">
        {prs.map((pr) => (
          <div key={pr.id} className="flex items-center justify-between rounded-2xl border border-amber-400/10 bg-amber-400/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{pr.exercise_name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{new Date(pr.achieved_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-amber-400">{pr.weight_lbs} lbs</p>
              {pr.previous_best && <p className="text-[10px] text-neutral-600">prev {pr.previous_best} lbs</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
