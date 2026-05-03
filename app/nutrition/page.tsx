"use client";

import { CalorieBudget } from "@/components/dashboard/CalorieBudget";
import { PageHeader } from "@/components/layout/PageHeader";
import { MealSection } from "@/components/nutrition/MealSection";
import { useToday } from "@/hooks/useToday";

const meals = ["breakfast", "lunch", "dinner", "snacks"];

export default function NutritionPage() {
  const { data } = useToday();
  const items = data?.meals ?? [];
  const calories = items.reduce((sum: number, item: any) => sum + Number(item.calories ?? 0), 0);
  return <main className="suhu-page px-5 pb-32 pt-8"><div className="mx-auto max-w-md space-y-4"><PageHeader title="Nutrition" subtitle="Log meals by category and keep the budget clear." /><CalorieBudget calories={calories} />{meals.map((meal) => <MealSection key={meal} meal={meal} items={items.filter((item: any) => item.meal === meal)} />)}</div></main>;
}
