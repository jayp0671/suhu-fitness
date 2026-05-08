"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Measurement = { id: string; date: string; waist_in: number | null; hips_in: number | null; chest_in: number | null; arms_in: number | null; thighs_in: number | null };

export function MeasurementsCard() {
  const [adding, setAdding] = useState(false);
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["measurements"],
    queryFn: async () => { const r = await fetch("/api/measurements"); return r.json(); },
  });
  const measurements: Measurement[] = data?.measurements ?? [];
  const latest = measurements[0];
  const prev = measurements[1];

  const save = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/measurements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waist_in: waist ? Number(waist) : null, hips_in: hips ? Number(hips) : null, chest_in: chest ? Number(chest) : null, arms_in: arms ? Number(arms) : null, thighs_in: thighs ? Number(thighs) : null }),
      });
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["measurements"] }); setAdding(false); setWaist(""); setHips(""); setChest(""); setArms(""); setThighs(""); },
  });

  function diff(key: keyof Measurement) {
    if (!latest || !prev) return null;
    const a = latest[key] as number | null;
    const b = prev[key] as number | null;
    if (!a || !b) return null;
    const d = a - b;
    return d === 0 ? null : { value: Math.abs(d).toFixed(1), dir: d < 0 ? "▼" : "▲", good: d < 0 };
  }

  const FIELDS: { key: keyof Measurement; label: string; val: string; set: (v: string) => void }[] = [
    { key: "waist_in", label: "Waist", val: waist, set: setWaist },
    { key: "hips_in", label: "Hips", val: hips, set: setHips },
    { key: "chest_in", label: "Chest", val: chest, set: setChest },
    { key: "arms_in", label: "Arms", val: arms, set: setArms },
    { key: "thighs_in", label: "Thighs", val: thighs, set: setThighs },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-[#c8f065]" />
          <p className="text-sm font-semibold text-white">Body Measurements</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Log"}</Button>
      </div>

      {latest && !adding && (
        <div className="grid grid-cols-3 gap-2">
          {FIELDS.map(({ key, label }) => {
            const val = latest[key] as number | null;
            const d = diff(key);
            if (!val) return null;
            return (
              <div key={key as string} className="rounded-xl bg-white/[0.03] p-2 text-center">
                <p className="text-sm font-semibold text-white">{val}&quot;</p>
                {d && <p className={`text-[9px] ${d.good ? "text-[#c8f065]" : "text-red-400"}`}>{d.dir}{d.value}&quot;</p>}
                <p className="text-[10px] text-neutral-500">{label}</p>
              </div>
            );
          })}
        </div>
      )}

      {!latest && !adding && <p className="text-xs text-neutral-500">No measurements logged yet. Tap + Log to add your first.</p>}

      {adding && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.map(({ label, val, set }) => (
              <Input key={label} placeholder={`${label} (inches)`} type="number" value={val} onChange={(e) => set(e.target.value)} />
            ))}
          </div>
          <Button className="w-full" onClick={() => save.mutate()} disabled={save.isPending}>Save measurements</Button>
        </div>
      )}
    </div>
  );
}
