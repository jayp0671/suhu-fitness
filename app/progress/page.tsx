"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Droplets, Flame, Footprints, Moon, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DailyProgressPoint,
  MetricLineChart,
} from "@/components/progress/MetricLineChart";
import {
  ExerciseProgress,
  ExerciseProgressChart,
} from "@/components/progress/ExerciseProgressChart";

type ProgressSummary = {
  days: number;
  total_calories_eaten: number;
  total_steps: number;
  total_workout_days: number;
  average_sleep: number;
  average_water: number;
  latest_weight: number | null;
};

type ProgressResponse = {
  summary: ProgressSummary;
  daily: DailyProgressPoint[];
  exerciseProgress: ExerciseProgress[];
};

async function fetchProgress() {
  const response = await fetch("/api/progress?days=60");

  if (!response.ok) {
    throw new Error("Failed to load progress data.");
  }

  return (await response.json()) as ProgressResponse;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <Icon className="mb-3 h-5 w-5 text-[#c8f065]" />
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-neutral-600">{subtext}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["progress", 60],
    queryFn: fetchProgress,
    staleTime: 1000 * 60,
  });

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md space-y-4">
        <PageHeader
          title="Progress"
          subtitle="Charts for weight, nutrition, steps, sleep, water, and training."
        />

        {isLoading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-neutral-400">
            Loading progress charts...
          </div>
        ) : error || !data ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
            Progress data could not load. Check the terminal for the API error.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3">
              <SummaryCard
                icon={Scale}
                label="Latest weight"
                value={
                  data.summary.latest_weight
                    ? `${data.summary.latest_weight} lbs`
                    : "No logs"
                }
                subtext="Most recent weight entry"
              />
              <SummaryCard
                icon={Footprints}
                label="Total steps"
                value={formatNumber(data.summary.total_steps)}
                subtext={`Last ${data.summary.days} days`}
              />
              <SummaryCard
                icon={Moon}
                label="Avg sleep"
                value={`${data.summary.average_sleep.toFixed(1)} hrs`}
                subtext="Daily average"
              />
              <SummaryCard
                icon={Droplets}
                label="Avg water"
                value={`${data.summary.average_water.toFixed(0)} oz`}
                subtext="Daily average"
              />
              <SummaryCard
                icon={Flame}
                label="Calories logged"
                value={formatNumber(data.summary.total_calories_eaten)}
                subtext={`Last ${data.summary.days} days`}
              />
              <SummaryCard
                icon={Activity}
                label="Workout days"
                value={`${data.summary.total_workout_days}`}
                subtext={`Last ${data.summary.days} days`}
              />
            </section>

            <MetricLineChart
              title="Weight trend"
              subtitle="Most recent logged weight over time."
              data={data.daily}
              dataKey="weight_lbs"
              suffix=" lbs"
            />

            <MetricLineChart
              title="Calories eaten"
              subtitle="Daily meal calories logged manually."
              data={data.daily}
              dataKey="calories_eaten"
              suffix=" cal"
            />

            <MetricLineChart
              title="Steps"
              subtitle="Manual now, Apple Watch later."
              data={data.daily}
              dataKey="steps"
            />

            <MetricLineChart
              title="Sleep"
              subtitle="Hours logged per day."
              data={data.daily}
              dataKey="sleep_hrs"
              suffix=" hrs"
            />

            <MetricLineChart
              title="Water"
              subtitle="Daily water intake in ounces."
              data={data.daily}
              dataKey="water_oz"
              suffix=" oz"
            />

            <MetricLineChart
              title="Workout completion"
              subtitle="Number of completed exercises per day."
              data={data.daily}
              dataKey="workouts_done"
            />

            <ExerciseProgressChart exercises={data.exerciseProgress} />
          </>
        )}
      </div>
    </main>
  );
}