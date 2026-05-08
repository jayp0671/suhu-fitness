"use client";

import { useState } from "react";
import { ShoppingCart, Sparkles, Loader2 } from "lucide-react";
import { CalorieBudget } from "@/components/dashboard/CalorieBudget";
import { PageHeader } from "@/components/layout/PageHeader";
import { MealSection } from "@/components/nutrition/MealSection";
import { useToday } from "@/hooks/useToday";
import { GOALS, getTodayCalorieGoal } from "@/lib/goals";
import { Button } from "@/components/ui/button";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snacks"];

type MealEntry = { id: string; meal: string; food_name: string; calories: number; protein_g?: number | null; carbs_g?: number | null; fat_g?: number | null; fiber_g?: number | null; sodium_mg?: number | null; };

function MacroStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] text-neutral-600">{label}</p>
    </div>
  );
}

type Suggestion = { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; reason: string };
type GroceryItem = { category: string; item: string; quantity: string; note?: string };

export default function NutritionPage() {
  const today = useToday();
  const data = today.data as { meals?: MealEntry[] } | undefined;
  const items = data?.meals ?? [];
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [grocery, setGrocery] = useState<GroceryItem[]>([]);
  const [loadingGrocery, setLoadingGrocery] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);

  const calories = items.reduce((s, i) => s + Number(i.calories ?? 0), 0);
  const protein = items.reduce((s, i) => s + Number(i.protein_g ?? 0), 0);
  const carbs = items.reduce((s, i) => s + Number(i.carbs_g ?? 0), 0);
  const fat = items.reduce((s, i) => s + Number(i.fat_g ?? 0), 0);
  const fiber = items.reduce((s, i) => s + Number(i.fiber_g ?? 0), 0);
  const sodium = items.reduce((s, i) => s + Number(i.sodium_mg ?? 0), 0);
  const goal = getTodayCalorieGoal();

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    const res = await fetch("/api/nutrition/suggest");
    const data = await res.json();
    setSuggestions(data.suggestions ?? []);
    setLoadingSuggestions(false);
  }

  async function loadGrocery() {
    setLoadingGrocery(true);
    setShowGrocery(true);
    const res = await fetch("/api/nutrition/grocery");
    const data = await res.json();
    setGrocery(data.grocery ?? []);
    setLoadingGrocery(false);
  }

  const groceryByCategory = grocery.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md space-y-4">
        <PageHeader title="Nutrition" subtitle="Log meals — AI estimates macros instantly." />
        <CalorieBudget calories={calories} />
        {calories > 0 && (
          <div className="grid grid-cols-3 gap-2 rounded-[2rem] border border-white/10 bg-white/[0.02] p-4">
            <MacroStat label="Protein" value={`${protein.toFixed(0)}g`} color="text-blue-400" />
            <MacroStat label="Carbs" value={`${carbs.toFixed(0)}g`} color="text-orange-400" />
            <MacroStat label="Fat" value={`${fat.toFixed(0)}g`} color="text-pink-400" />
            <MacroStat label="Fiber" value={`${fiber.toFixed(0)}g`} color="text-green-400" />
            <MacroStat label="Sodium" value={`${sodium.toFixed(0)}mg`} color="text-neutral-400" />
            <MacroStat label="Items" value={`${items.length}`} color="text-neutral-400" />
          </div>
        )}

        {/* Protein goal bar */}
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-400">Protein goal</p>
            <p className="text-xs text-blue-400">{protein.toFixed(0)}g / {GOALS.protein}g</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min((protein / GOALS.protein) * 100, 100)}%` }} />
          </div>
        </div>

        {calories > goal && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-300">
            You have logged {calories} cal — {calories - goal} over today's goal. Consider a lighter dinner.
          </div>
        )}
        {calories > 0 && calories < 800 && new Date().getHours() >= 20 && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            Only {calories} cal logged by 8pm — eating too little slows fat loss. Have a balanced meal.
          </div>
        )}

        {/* AI Suggestions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={loadSuggestions} disabled={loadingSuggestions}>
            {loadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Suggest a meal
          </Button>
          <Button variant="outline" className="flex-1" onClick={loadGrocery} disabled={loadingGrocery}>
            {loadingGrocery ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
            Grocery list
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="rounded-[2rem] border border-[#c8f065]/20 bg-[#c8f065]/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-[#c8f065] uppercase tracking-wider">AI Suggestions for you</p>
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{s.calories} cal · {s.protein_g}g protein</p>
                <p className="text-xs text-neutral-600 mt-1 italic">{s.reason}</p>
              </div>
            ))}
          </div>
        )}

        {showGrocery && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Weekly Grocery List</p>
              <button onClick={() => setShowGrocery(false)} className="text-xs text-neutral-500 hover:text-white">Close</button>
            </div>
            {loadingGrocery ? (
              <div className="flex items-center gap-2 text-neutral-400 text-sm py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating list...
              </div>
            ) : (
              Object.entries(groceryByCategory).map(([cat, catItems]) => (
                <div key={cat}>
                  <p className="text-xs font-medium text-[#c8f065] mb-2">{cat}</p>
                  <div className="space-y-1">
                    {catItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2">
                        <span className="text-sm text-white">{item.item}</span>
                        <span className="text-xs text-neutral-500">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {MEAL_TYPES.map((meal) => (
          <MealSection key={meal} meal={meal} items={items.filter((i) => i.meal === meal)} />
        ))}
      </div>
    </main>
  );
}
