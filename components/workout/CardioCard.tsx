"use client";

import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CARDIO } from "@/lib/workout-plan";
import { useTracking } from "@/hooks/useTracking";

export function CardioCard({ done }: { done: boolean }) {
  const tracking = useTracking();
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c8f065] text-[#0a0a0a]">
            <Flame className="h-5 w-5" />
          </div>
          <p className="font-semibold text-white">Cardio</p>
          <p className="mt-1 text-sm text-neutral-400">{CARDIO.duration} min • {CARDIO.note}</p>
        </div>
        <Button variant={done ? "secondary" : "default"} onClick={() => tracking.mutate({ cardio_done: !done })}>
          {done ? "Done ✓" : "Mark done"}
        </Button>
      </div>
    </div>
  );
}
