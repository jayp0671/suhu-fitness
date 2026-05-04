"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ExerciseProgressPoint = {
  date: string;
  label: string;
  sets_done: number;
  reps_value: number;
  weight_lbs: number;
  volume: number;
};

export type ExerciseProgress = {
  exercise_id: string;
  exercise_name: string;
  points: ExerciseProgressPoint[];
};

type MetricKey = "weight_lbs" | "sets_done" | "reps_value" | "volume";

const metricOptions: { key: MetricKey; label: string; suffix: string }[] = [
  { key: "weight_lbs", label: "Weight", suffix: " lbs" },
  { key: "sets_done", label: "Sets", suffix: "" },
  { key: "reps_value", label: "Reps", suffix: "" },
  { key: "volume", label: "Volume", suffix: " lbs" },
];

type ExerciseProgressChartProps = {
  exercises: ExerciseProgress[];
};

export function ExerciseProgressChart({
  exercises,
}: ExerciseProgressChartProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    exercises[0]?.exercise_id ?? ""
  );
  const [metric, setMetric] = useState<MetricKey>("weight_lbs");

  const selectedExercise = useMemo(() => {
    return (
      exercises.find((exercise) => exercise.exercise_id === selectedExerciseId) ??
      exercises[0]
    );
  }, [exercises, selectedExerciseId]);

  const selectedMetric = metricOptions.find((option) => option.key === metric);

  if (exercises.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">Exercise progression</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Log sets, reps, and weight on the workout page to unlock exercise
          progression charts.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Exercise progression
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Track strength progress by exercise.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={selectedExercise?.exercise_id ?? ""}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#121212] px-3 py-3 text-sm text-white outline-none focus:border-[#c8f065]"
          >
            {exercises.map((exercise) => (
              <option key={exercise.exercise_id} value={exercise.exercise_id}>
                {exercise.exercise_name}
              </option>
            ))}
          </select>

          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as MetricKey)}
            className="rounded-2xl border border-white/10 bg-[#121212] px-3 py-3 text-sm text-white outline-none focus:border-[#c8f065]"
          >
            {metricOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={selectedExercise?.points ?? []}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(200,240,101,0.25)" }}
              contentStyle={{
                background: "#121212",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#f5f5f5",
              }}
              labelStyle={{ color: "#c8f065" }}
              formatter={(value) => [
                `${value}${selectedMetric?.suffix ?? ""}`,
                selectedMetric?.label ?? "Progress",
              ]}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#c8f065"
              strokeWidth={3}
              dot={{ r: 3, fill: "#c8f065" }}
              activeDot={{ r: 5, fill: "#c8f065" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}