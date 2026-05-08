"use client";

import { Heart } from "lucide-react";

type HeartRateCardProps = {
  restingHR?: number | null;
  averageHR?: number | null;
};

function getHRZone(hr: number): { label: string; color: string } {
  if (hr < 60) return { label: "Recovery", color: "text-blue-400" };
  if (hr < 70) return { label: "Rest", color: "text-green-400" };
  if (hr < 100) return { label: "Light activity", color: "text-[#c8f065]" };
  if (hr < 140) return { label: "Moderate", color: "text-orange-400" };
  if (hr < 170) return { label: "Hard", color: "text-red-400" };
  return { label: "Max effort", color: "text-red-600" };
}

export function HeartRateCard({ restingHR, averageHR }: HeartRateCardProps) {
  if (!restingHR && !averageHR) return null;
  const zone = averageHR ? getHRZone(averageHR) : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="h-5 w-5 text-red-400" />
        <div>
          <p className="font-semibold text-white">Heart Rate</p>
          <p className="text-xs text-neutral-500">From Apple Watch</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {restingHR && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
            <p className="text-xl font-semibold text-white">{restingHR}</p>
            <p className="text-xs text-neutral-500 mt-1">Resting BPM</p>
          </div>
        )}
        {averageHR && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
            <p className="text-xl font-semibold text-white">{averageHR}</p>
            <p className="text-xs text-neutral-500 mt-1">Avg BPM</p>
            {zone && <p className={`text-[10px] mt-1 font-medium ${zone.color}`}>{zone.label}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
