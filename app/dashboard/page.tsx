"use client";

import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { CalorieBudget } from "@/components/dashboard/CalorieBudget";
import { CoachingTips } from "@/components/dashboard/CoachingTips";
import { RingProgress } from "@/components/dashboard/RingProgress";
import { WeightCard } from "@/components/dashboard/WeightCard";
import { MoodTracker } from "@/components/dashboard/MoodTracker";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/useToday";
import { GOALS } from "@/lib/goals";
import { WORKOUT_PLAN, getTodayKey } from "@/lib/workout-plan";
import { isRestDay } from "@/lib/utils";

type MealEntry = { calories?: number | null; protein_g?: number | null; carbs_g?: number | null; fat_g?: number | null; };
type DailyLog = { water_oz?: number | null; steps?: number | null; sleep_hrs?: number | null; weight_lbs?: number | null; mood?: number | null; energy?: number | null; };
type ExerciseLog = { is_done?: boolean | null; };
type TodayData = { meals?: MealEntry[]; log?: DailyLog | null; exercises?: ExerciseLog[]; };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MacroBar({ label, value, color, suffix }: { label: string; value: number; color: string; suffix: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center">
      <p className="text-base font-semibold" style={{ color }}>{value.toFixed(0)}{suffix}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const today = useToday();
  const data = today.data as TodayData | undefined;
  const meals = data?.meals ?? [];
  const log = data?.log ?? {};
  const exercises = data?.exercises ?? [];

  const calories = meals.reduce((s, m) => s + Number(m.calories ?? 0), 0);
  const protein = meals.reduce((s, m) => s + Number(m.protein_g ?? 0), 0);
  const carbs = meals.reduce((s, m) => s + Number(m.carbs_g ?? 0), 0);
  const fat = meals.reduce((s, m) => s + Number(m.fat_g ?? 0), 0);

  const todayKey = getTodayKey();
  const todayPlan = WORKOUT_PLAN[todayKey];
  const planDone = exercises.filter((e) => e.is_done).length;
  const restDay = isRestDay();

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md">
        <PageHeader title={getGreeting()} subtitle={`Suhu 🌿${restDay ? " · Rest day" : ""}`} />
        {today.isLoading ? (
          <p className="text-neutral-400">Loading...</p>
        ) : (
          <div className="space-y-4">
            <CoachingTips />
            <CalorieBudget calories={calories} />
            {calories > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <MacroBar label="Protein" value={protein} color="#60a5fa" suffix="g" />
                <MacroBar label="Carbs" value={carbs} color="#fb923c" suffix="g" />
                <MacroBar label="Fat" value={fat} color="#f472b6" suffix="g" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <RingProgress label="Water" value={Number(log.water_oz ?? 0)} goal={GOALS.water} unit="oz" />
              <RingProgress label="Steps" value={Number(log.steps ?? 0)} goal={GOALS.steps} unit="" />
              <RingProgress label="Sleep" value={Number(log.sleep_hrs ?? 0)} goal={GOALS.sleep} unit="h" />
              <RingProgress label="Protein" value={protein} goal={GOALS.protein} unit="g" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dumbbell className="mb-3 h-5 w-5 text-[#c8f065]" />
                  <p className="font-semibold text-white">{todayPlan.label}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {todayPlan.exercises.length ? `${planDone}/${todayPlan.exercises.length} exercises done` : "Rest day. Recovery counts."}
                  </p>
                </div>
                <Button asChild><Link href="/workout">Open</Link></Button>
              </div>
            </div>
            <WeightCard weight={log.weight_lbs} />
            <MoodTracker mood={log.mood} energy={log.energy} />
          </div>
        )}
      </div>
    </main>
  );
}
