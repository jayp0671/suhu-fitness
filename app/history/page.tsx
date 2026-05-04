"use client";

import { useQuery } from "@tanstack/react-query";
import { HistoryDayCard } from "@/components/history/HistoryDayCard";
import { PageHeader } from "@/components/layout/PageHeader";

type DailyLog = {
  id: string;
  date: string;
  water_oz?: number | null;
  steps?: number | null;
  sleep_hrs?: number | null;
  weight_lbs?: number | null;
  cardio_done?: boolean | null;
};

type MealEntry = {
  id: string;
  date: string;
  calories?: number | null;
};

type ExerciseLog = {
  id: string;
  date: string;
  is_done?: boolean | null;
};

type HistoryResponse = {
  logs: DailyLog[];
  meals: MealEntry[];
  exercises: ExerciseLog[];
};

async function fetchHistory() {
  const response = await fetch("/api/history");

  if (!response.ok) {
    throw new Error("Failed history");
  }

  return (await response.json()) as HistoryResponse;
}

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  const logs = data?.logs ?? [];
  const meals = data?.meals ?? [];
  const exercises = data?.exercises ?? [];

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md space-y-4">
        <PageHeader
          title="History"
          subtitle="Newest days first, with daily summaries."
        />

        {isLoading ? (
          <p className="text-neutral-400">Loading...</p>
        ) : logs.length ? (
          logs.map((log) => (
            <HistoryDayCard
              key={log.id}
              log={log}
              meals={meals.filter((item) => item.date === log.date)}
              exercises={exercises.filter((item) => item.date === log.date)}
            />
          ))
        ) : (
          <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-neutral-400">
            No history yet. Start logging today.
          </p>
        )}
      </div>
    </main>
  );
}