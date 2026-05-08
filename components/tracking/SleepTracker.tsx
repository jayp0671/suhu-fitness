"use client";

import { Moon } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

export function SleepTracker({ sleep }: { sleep: number }) {
  const tracking = useTracking();
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Moon className="h-5 w-5 text-[#c8f065]" />
        <div>
          <p className="font-semibold text-white">Sleep</p>
          <p className="text-xs text-neutral-500">{sleep || 0} hours logged</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[5, 6, 7, 8, 9].map((hrs) => (
          <button
            key={hrs}
            onClick={() => tracking.mutate({ sleep_hrs: hrs })}
            className={cn("rounded-2xl border border-white/10 px-3 py-4 text-sm font-semibold text-neutral-400 transition", sleep === hrs && "bg-[#c8f065] text-[#0a0a0a]")}
          >
            {hrs}h
          </button>
        ))}
      </div>
    </div>
  );
}
