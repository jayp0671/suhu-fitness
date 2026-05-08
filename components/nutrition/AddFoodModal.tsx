"use client";

import { useState } from "react";
import { Loader2, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNutrition } from "@/hooks/useNutrition";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type Macros = { food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sodium_mg: number; notes?: string; };
type Favorite = { id: string; name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sodium_mg: number; use_count: number; };

const QUICK_ADDS = [
  { name: "Dal and rice", calories: 380, protein_g: 14, carbs_g: 62, fat_g: 6, fiber_g: 8, sodium_mg: 420 },
  { name: "Paneer tikka (150g)", calories: 290, protein_g: 22, carbs_g: 8, fat_g: 19, fiber_g: 1, sodium_mg: 480 },
  { name: "Greek yogurt (200g)", calories: 130, protein_g: 17, carbs_g: 9, fat_g: 3, fiber_g: 0, sodium_mg: 65 },
  { name: "Protein shake", calories: 150, protein_g: 25, carbs_g: 8, fat_g: 2, fiber_g: 1, sodium_mg: 150 },
  { name: "Chapati (2)", calories: 200, protein_g: 6, carbs_g: 38, fat_g: 3, fiber_g: 4, sodium_mg: 180 },
  { name: "Chickpea salad", calories: 220, protein_g: 12, carbs_g: 28, fat_g: 6, fiber_g: 9, sodium_mg: 320 },
  { name: "Tofu stir fry", calories: 260, protein_g: 18, carbs_g: 14, fat_g: 14, fiber_g: 3, sodium_mg: 580 },
  { name: "Mixed nuts (30g)", calories: 175, protein_g: 5, carbs_g: 6, fat_g: 15, fiber_g: 2, sodium_mg: 5 },
];

function MacroChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
      <p className={cn("text-sm font-semibold", color)}>{value}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}

export function AddFoodModal({ meal, onClose }: { meal: string; onClose: () => void }) {
  const [mode, setMode] = useState<"ai" | "manual" | "favorites">("ai");
  const [description, setDescription] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [macros, setMacros] = useState<Macros | null>(null);
  const [error, setError] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const { addFood } = useNutrition();
  const queryClient = useQueryClient();

  const { data: favData } = useQuery({
    queryKey: ["meal-favorites"],
    queryFn: async () => { const r = await fetch("/api/nutrition/favorites"); return r.json(); },
    enabled: mode === "favorites",
  });
  const favorites: Favorite[] = favData?.favorites ?? [];

  const saveFav = useMutation({
    mutationFn: async (m: Macros) => {
      await fetch("/api/nutrition/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(m) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-favorites"] }),
  });

  async function estimateMacros() {
    if (!description.trim()) return;
    setEstimating(true); setError(""); setMacros(null);
    try {
      const res = await fetch("/api/nutrition/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Estimation failed");
      setMacros(data.macros);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not estimate. Try again.");
    } finally {
      setEstimating(false);
    }
  }

  async function addEstimated() {
    if (!macros) return;
    await addFood.mutateAsync({ meal, food_name: macros.food_name, calories: Math.round(macros.calories), protein_g: macros.protein_g, carbs_g: macros.carbs_g, fat_g: macros.fat_g, fiber_g: macros.fiber_g ?? 0, sodium_mg: macros.sodium_mg ?? 0 });
    onClose();
  }

  async function addQuickItem(item: typeof QUICK_ADDS[0]) {
await addFood.mutateAsync({ meal, food_name: item.name, ...item });    onClose();
  }

  async function addFavorite(fav: Favorite) {
    await addFood.mutateAsync({ meal, food_name: fav.name, calories: fav.calories, protein_g: fav.protein_g, carbs_g: fav.carbs_g, fat_g: fav.fat_g, fiber_g: fav.fiber_g, sodium_mg: fav.sodium_mg });
    await fetch("/api/nutrition/favorites", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: fav.id }) });
    onClose();
  }

  const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#101010] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Add to {mealLabel}</h2>
            <p className="text-xs text-neutral-500">AI estimates macros from your description</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-neutral-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {(["ai", "favorites", "manual"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-2xl border px-3 py-2 text-sm font-medium transition capitalize", mode === m ? "border-[#c8f065] bg-[#c8f065]/10 text-[#c8f065]" : "border-white/10 text-neutral-400")}>
              {m === "ai" ? <><Sparkles className="mr-1.5 inline h-3.5 w-3.5" />AI</> : m === "favorites" ? <><Star className="mr-1.5 inline h-3.5 w-3.5" />Saved</> : "Manual"}
            </button>
          ))}
        </div>

        {mode === "ai" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => e.key === "Enter" && estimateMacros()} placeholder="e.g. bowl of dal and rice or paneer tikka 150g" className="flex-1" />
              <Button onClick={estimateMacros} disabled={estimating || !description.trim()} size="icon" className="shrink-0">
                {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {macros && (
              <div className="rounded-2xl border border-[#c8f065]/20 bg-[#c8f065]/5 p-4">
                <p className="mb-3 font-semibold text-white">{macros.food_name}</p>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <MacroChip label="Calories" value={`${Math.round(macros.calories)}`} color="text-[#c8f065]" />
                  <MacroChip label="Protein" value={`${macros.protein_g}g`} color="text-blue-400" />
                  <MacroChip label="Carbs" value={`${macros.carbs_g}g`} color="text-orange-400" />
                  <MacroChip label="Fat" value={`${macros.fat_g}g`} color="text-pink-400" />
                  <MacroChip label="Fiber" value={`${macros.fiber_g ?? 0}g`} color="text-green-400" />
                  <MacroChip label="Sodium" value={`${macros.sodium_mg ?? 0}mg`} color="text-neutral-400" />
                </div>
                {macros.notes && <p className="mb-3 text-xs text-neutral-500">{macros.notes}</p>}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" className="flex-1" onClick={() => setMacros(null)}>Re-estimate</Button>
                  <Button variant="outline" size="sm" onClick={() => saveFav.mutate(macros)} title="Save to favourites"><Star className="h-4 w-4" /></Button>
                  <Button className="flex-1" onClick={addEstimated} disabled={addFood.isPending}>Add to {mealLabel}</Button>
                </div>
              </div>
            )}
            {!macros && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">Quick add</p>
                <div className="space-y-2">
                  {QUICK_ADDS.map((item) => (
                    <button key={item.name} onClick={() => addQuickItem(item)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/20">
                      <span className="text-sm text-white">{item.name}</span>
                      <span className="text-xs text-neutral-500">{item.calories} cal · {item.protein_g}g protein</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "favorites" && (
          <div className="space-y-2">
            {favorites.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No saved meals yet. Use AI mode and tap ★ to save.</p>
            ) : favorites.map((fav) => (
              <button key={fav.id} onClick={() => addFavorite(fav)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/20">
                <div>
                  <span className="text-sm text-white">{fav.name}</span>
                  <p className="text-xs text-neutral-500 mt-0.5">{fav.calories} cal · {fav.protein_g}g protein</p>
                </div>
                <span className="text-xs text-neutral-600">{fav.use_count}× used</span>
              </button>
            ))}
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-3">
            <Input placeholder="Food name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
            <Input placeholder="Calories" type="number" value={manualCal} onChange={(e) => setManualCal(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Protein (g)" type="number" value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} />
              <Input placeholder="Carbs (g)" type="number" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} />
              <Input placeholder="Fat (g)" type="number" value={manualFat} onChange={(e) => setManualFat(e.target.value)} />
            </div>
            <Button className="w-full" onClick={async () => {
              if (!manualName || !manualCal) return;
              await addFood.mutateAsync({ meal, food_name: manualName, calories: Number(manualCal), protein_g: Number(manualProtein) || 0, carbs_g: Number(manualCarbs) || 0, fat_g: Number(manualFat) || 0, fiber_g: 0, sodium_mg: 0 });
              onClose();
            }} disabled={!manualName || !manualCal || addFood.isPending}>
              Add to {mealLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
