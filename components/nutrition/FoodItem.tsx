"use client";

import { Trash2 } from "lucide-react";
import { useNutrition } from "@/hooks/useNutrition";

export function FoodItem({ item }: { item: any }) {
  const { deleteFood } = useNutrition();
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
      <div><p className="text-sm font-medium text-white">{item.food_name}</p><p className="text-xs text-neutral-500">{item.calories} cal</p></div>
      <button onClick={() => deleteFood.mutate(item.id)} className="rounded-full p-2 text-neutral-500 hover:bg-white/10 hover:text-white"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
