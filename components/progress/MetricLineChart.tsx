"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyProgressPoint = {
  date: string;
  label: string;
  calories_eaten: number;
  water_oz: number;
  steps: number;
  sleep_hrs: number;
  weight_lbs: number | null;
  active_calories: number;
  resting_heart_rate: number | null;
  average_heart_rate: number | null;
  workouts_done: number;
  cardio_done: boolean;
  apple_workouts: number;
};

type MetricLineChartProps = {
  title: string;
  subtitle: string;
  data: DailyProgressPoint[];
  dataKey: keyof DailyProgressPoint;
  suffix?: string;
};

export function MetricLineChart({
  title,
  subtitle,
  data,
  dataKey,
  suffix = "",
}: MetricLineChartProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
              formatter={(value) => [`${value}${suffix}`, title]}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#c8f065"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#c8f065" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}