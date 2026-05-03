"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { CalorieBudget } from "@/components/dashboard/CalorieBudget";
import { RingProgress } from "@/components/dashboard/RingProgress";
import { WeightCard } from "@/components/dashboard/WeightCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/useToday";
import { GOALS } from "@/lib/goals";
import { WORKOUT_PLAN, getTodayKey } from "@/lib/workout-plan";

export default function DashboardPage() {
  const { data, isLoading } = useToday();
  const meals = data?.meals ?? [];
  const log = data?.log ?? {};
  const exercises = data?.exercises ?? [];
  const calories = meals.reduce((sum: number, meal: any) => sum + Number(meal.calories ?? 0), 0);
  const todayPlan = WORKOUT_PLAN[getTodayKey()];
  const planDone = exercises.filter((item: any) => item.is_done).length;

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md">
        <PageHeader title="Today" subtitle="Tiny wins, clean logs, and no guessing." />
        {isLoading ? <p className="text-neutral-400">Loading...</p> : <div className="space-y-4">
          <CalorieBudget calories={calories} />
          <div className="grid grid-cols-2 gap-3"><RingProgress label="Water" value={Number(log.water_oz ?? 0)} goal={GOALS.water} unit="oz" /><RingProgress label="Steps" value={Number(log.steps ?? 0)} goal={GOALS.steps} unit="" /><RingProgress label="Sleep" value={Number(log.sleep_hrs ?? 0)} goal={GOALS.sleep} unit="h" /><RingProgress label="Calories" value={calories} goal={GOALS.calories} unit="" /></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-start justify-between gap-3"><div><Dumbbell className="mb-3 h-5 w-5 text-[#c8f065]" /><p className="font-semibold text-white">{todayPlan.label}</p><p className="mt-1 text-sm text-neutral-400">{todayPlan.exercises.length ? `${planDone}/${todayPlan.exercises.length} exercises done` : "Rest day. Recovery counts."}</p></div><Button asChild><Link href="/workout">Open</Link></Button></div></div>
          <WeightCard weight={log.weight_lbs} />
        </div>}
      </div>
    </main>
  );
}
