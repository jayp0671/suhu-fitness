"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AddFoodModal } from "@/components/nutrition/AddFoodModal";
import { useNutrition } from "@/hooks/useNutrition";
import { cn } from "@/lib/utils";

type MealEntry = { id: string; meal: string; food_name: string; calories: number; protein_g?: number | null; carbs_g?: number | null; fat_g?: number | null; fiber_g?: number | null; sodium_mg?: number | null; };

const MEAL_COLORS: Record<string, string> = { breakfast: "text-amber-400", lunch: "text-[#c8f065]", dinner: "text-blue-400", snacks: "text-pink-400" };
const MEAL_BORDER: Record<string, string> = { breakfast: "border-amber-400/20", lunch: "border-[#c8f065]/20", dinner: "border-blue-400/20", snacks: "border-pink-400/20" };

function MiniMacro({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-white">{value}</p>
      <p className="text-[9px] text-neutral-600">{label}</p>
    </div>
  );
}

export function MealSection({ meal, items }: { meal: string; items: MealEntry[] }) {
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { deleteFood } = useNutrition();

  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
  const totalCal = items.reduce((s, i) => s + (i.calories ?? 0), 0);
  const totalProtein = items.reduce((s, i) => s + (i.protein_g ?? 0), 0);
  const totalCarbs = items.reduce((s, i) => s + (i.carbs_g ?? 0), 0);
  const totalFat = items.reduce((s, i) => s + (i.fat_g ?? 0), 0);
  const color = MEAL_COLORS[meal] ?? "text-neutral-400";
  const border = MEAL_BORDER[meal] ?? "border-white/10";

  return (
    <>
      <div className={cn("rounded-[2rem] border bg-white/[0.02] p-5", border)}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-widest", color)}>{label}</p>
            <p className="mt-0.5 text-xl font-semibold text-white">{totalCal} cal</p>
          </div>
          {items.length > 0 && (
            <div className="text-right text-xs text-neutral-500">
              <p>{totalProtein.toFixed(0)}g protein</p>
              <p>{totalCarbs.toFixed(0)}g carbs · {totalFat.toFixed(0)}g fat</p>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="mb-3 space-y-1">
            {items.map((item) => (
              <div key={item.id}>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.04]">
                  <span className="flex-1 truncate text-sm text-white">{item.food_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{item.calories} cal</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteFood.mutate(item.id); }} className="text-neutral-600 transition hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
                {expanded === item.id && (
                  <div className="mb-1 ml-2 grid grid-cols-4 gap-1 rounded-xl bg-white/[0.03] p-2">
                    <MiniMacro label="Protein" value={`${item.protein_g ?? 0}g`} />
                    <MiniMacro label="Carbs" value={`${item.carbs_g ?? 0}g`} />
                    <MiniMacro label="Fat" value={`${item.fat_g ?? 0}g`} />
                    <MiniMacro label="Fiber" value={`${item.fiber_g ?? 0}g`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowModal(true)} className={cn("w-full rounded-2xl border py-2.5 text-sm font-medium transition", color, border, "hover:bg-white/[0.04]")}>
          + Add food
        </button>
      </div>
      {showModal && <AddFoodModal meal={meal} onClose={() => setShowModal(false)} />}
    </>
  );
}
