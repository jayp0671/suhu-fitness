"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardioCard } from "@/components/workout/CardioCard";
import { CustomExerciseModal } from "@/components/workout/CustomExerciseModal";
import { DayTabs } from "@/components/workout/DayTabs";
import { ExerciseItem } from "@/components/workout/ExerciseItem";
import { useToday } from "@/hooks/useToday";
import { WORKOUT_PLAN, getTodayKey } from "@/lib/workout-plan";

type WorkoutDay = keyof typeof WORKOUT_PLAN;

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

type ExerciseLog = {
  exercise_id: string;
  exercise_name: string;
  is_done?: boolean | null;
  sets_done?: number | null;
  reps_done?: string | null;
  weight_lbs?: number | null;
  is_custom?: boolean | null;
};

type TodayData = {
  log?: {
    cardio_done?: boolean | null;
  } | null;
  exercises?: ExerciseLog[];
};

function isWorkoutDay(day: string): day is WorkoutDay {
  return day in WORKOUT_PLAN;
}

export default function WorkoutPage() {
  const [selected, setSelected] = useState<WorkoutDay>(getTodayKey());
  const today = useToday();
  const data = today.data as TodayData | undefined;

  const logs = useMemo(() => {
    return data?.exercises ?? [];
  }, [data?.exercises]);

  const plan = WORKOUT_PLAN[selected];

  const logMap = useMemo(() => {
    return new Map<string, ExerciseLog>(
      logs.map((item) => [item.exercise_id, item])
    );
  }, [logs]);

  const customExercises: Exercise[] = logs
    .filter((item) => item.is_custom)
    .map((item) => ({
      id: item.exercise_id,
      name: item.exercise_name,
      sets: item.sets_done ?? 0,
      reps: item.reps_done ?? "custom",
    }));

  const exercises: Exercise[] = [...plan.exercises, ...customExercises];

  const done = exercises.filter((exercise) => {
    return Boolean(logMap.get(exercise.id)?.is_done);
  }).length;

  function handleSelect(day: string) {
    if (isWorkoutDay(day)) {
      setSelected(day);
    }
  }

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md space-y-4">
        <PageHeader
          title="Workout"
          subtitle="Log sets, reps, weight, custom lifts, and cardio."
        />

        <DayTabs selected={selected} onSelect={handleSelect} />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-neutral-400">{plan.label}</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {done}/{exercises.length || 1} complete
          </h2>
        </div>

        <CardioCard done={Boolean(data?.log?.cardio_done)} />

        {exercises.length ? (
          exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              log={logMap.get(exercise.id)}
            />
          ))
        ) : (
          <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-neutral-400">
            Rest day. Stretch, walk, hydrate, and recover.
          </p>
        )}

        <CustomExerciseModal />
      </div>
    </main>
  );
}