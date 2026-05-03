"use client";

import { useMemo, useState } from "react";
import { CardioCard } from "@/components/workout/CardioCard";
import { CustomExerciseModal } from "@/components/workout/CustomExerciseModal";
import { DayTabs } from "@/components/workout/DayTabs";
import { ExerciseItem } from "@/components/workout/ExerciseItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToday } from "@/hooks/useToday";
import { WORKOUT_PLAN, getTodayKey } from "@/lib/workout-plan";

export default function WorkoutPage() {
  const [selected, setSelected] = useState(getTodayKey());
  const { data } = useToday();
  const logs = data?.exercises ?? [];
  const logMap = useMemo(() => new Map(logs.map((item: any) => [item.exercise_id, item])), [logs]);
  const plan = WORKOUT_PLAN[selected];
  const custom = logs.filter((item: any) => item.is_custom).map((item: any) => ({ id: item.exercise_id, name: item.exercise_name, sets: item.sets_done ?? 0, reps: item.reps_done ?? "custom" }));
  const exercises = [...plan.exercises, ...custom];
  const done = exercises.filter((exercise) => logMap.get(exercise.id)?.is_done).length;

  return (
    <main className="suhu-page px-5 pb-32 pt-8"><div className="mx-auto max-w-md space-y-4"><PageHeader title="Workout" subtitle="Log sets, reps, weight, custom lifts, and cardio." /><DayTabs selected={selected} onSelect={setSelected} /><div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><p className="text-sm text-neutral-400">{plan.label}</p><h2 className="mt-1 text-2xl font-semibold text-white">{done}/{exercises.length || 1} complete</h2></div><CardioCard done={Boolean(data?.log?.cardio_done)} />{exercises.length ? exercises.map((exercise) => <ExerciseItem key={exercise.id} exercise={exercise} log={logMap.get(exercise.id)} />) : <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-neutral-400">Rest day. Stretch, walk, hydrate, and recover.</p>}<CustomExerciseModal /></div></main>
  );
}
