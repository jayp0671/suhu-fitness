"use client";

import { Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTracking } from "@/hooks/useTracking";
import { GOALS } from "@/lib/goals";
import { useState } from "react";

export function StepsTracker({ steps }: { steps: number }) {
  const tracking = useTracking();
  const [manual, setManual] = useState("");
  const pct = Math.min((steps / GOALS.steps) * 100, 100);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Footprints className="h-5 w-5 text-[#c8f065]" />
        <div className="flex-1">
          <p className="font-semibold text-white">Steps</p>
          <p className="text-xs text-neutral-500">{steps.toLocaleString()} / {GOALS.steps.toLocaleString()}</p>
        </div>
        <span className={`text-sm font-semibold ${pct >= 100 ? "text-[#c8f065]" : "text-neutral-400"}`}>{Math.round(pct)}%</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1000, 2000, 5000].map((amount) => (
          <Button key={amount} variant="outline" onClick={() => tracking.mutate({ steps: steps + amount })}>+{amount / 1000}k</Button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input placeholder="Set steps" value={manual} onChange={(e) => setManual(e.target.value)} />
        <Button onClick={() => manual && tracking.mutate({ steps: Number(manual) })}>Set</Button>
      </div>
    </div>
  );
}
