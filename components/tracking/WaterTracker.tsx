"use client";

import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTracking } from "@/hooks/useTracking";
import { GOALS } from "@/lib/goals";
import { useState } from "react";

export function WaterTracker({ water }: { water: number }) {
  const tracking = useTracking();
  const [custom, setCustom] = useState("");
  const cups = Math.round(water / 8);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-3"><Droplets className="h-5 w-5 text-[#c8f065]" /><div><p className="font-semibold text-white">Water</p><p className="text-xs text-neutral-500">{water} / {GOALS.water} oz</p></div></div>
      <div className="grid grid-cols-5 gap-2">{Array.from({ length: 10 }).map((_, i) => <button key={i} onClick={() => tracking.mutate({ water_oz: (i + 1) * 8 })} className={`h-12 rounded-2xl border border-white/10 ${i < cups ? "bg-[#c8f065]" : "bg-white/[0.03]"}`} />)}</div>
      <div className="mt-4 flex gap-2"><Input placeholder="Custom oz" value={custom} onChange={(e) => setCustom(e.target.value)} /><Button onClick={() => custom && tracking.mutate({ water_oz: Number(custom) })}>Set</Button><Button variant="outline" onClick={() => tracking.mutate({ water_oz: 0 })}>Reset</Button></div>
    </div>
  );
}
