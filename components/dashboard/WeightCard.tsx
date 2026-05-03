"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkout } from "@/hooks/useWorkout";

export function WeightCard({ weight }: { weight?: number | null }) {
  const [value, setValue] = useState("");
  const { saveWeight } = useWorkout();
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-neutral-400">Today's weight</p>
      <p className="mt-1 text-2xl font-semibold text-white">{weight ? `${weight} lbs` : "Not logged"}</p>
      <div className="mt-4 flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="161" type="number" />
        <Button onClick={() => value && saveWeight.mutate(Number(value))}>Save</Button>
      </div>
    </div>
  );
}
