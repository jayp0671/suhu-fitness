"use client";

import { useTracking } from "@/hooks/useTracking";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 1, emoji: "😩", label: "Rough" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🔥", label: "Great" },
];

const ENERGY = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Tired" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Energised" },
];

export function MoodTracker({ mood, energy }: { mood?: number | null; energy?: number | null }) {
  const tracking = useTracking();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-white mb-3">How are you feeling?</p>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => tracking.mutate({ mood: m.value })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border border-white/10 py-3 transition",
                mood === m.value ? "border-[#c8f065]/50 bg-[#c8f065]/10" : "hover:bg-white/[0.04]"
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] text-neutral-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-3">Energy level</p>
        <div className="grid grid-cols-5 gap-2">
          {ENERGY.map((e) => (
            <button
              key={e.value}
              onClick={() => tracking.mutate({ energy: e.value })}
              className={cn(
                "rounded-2xl border border-white/10 py-2.5 text-xs font-medium transition",
                energy === e.value ? "border-[#c8f065]/50 bg-[#c8f065]/10 text-[#c8f065]" : "text-neutral-400 hover:bg-white/[0.04]"
              )}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
