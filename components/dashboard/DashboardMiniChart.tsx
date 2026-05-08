"use client";

import Link from "next/link";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

type MiniPoint = {
  label: string;
  calories_eaten: number;
  steps: number;
  water_oz: number;
  sleep_hrs: number;
};

type DashboardMiniChartProps = {
  data: MiniPoint[];
};

export function DashboardMiniChart({ data }: DashboardMiniChartProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Progress snapshot</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Last 7 days of calories, steps, water, and sleep.
          </p>
        </div>

        <Button asChild size="sm" variant="secondary">
          <Link href="/progress">View</Link>
        </Button>
      </div>

      {data.length ? (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#737373", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
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
              />
              <Line
                type="monotone"
                dataKey="calories_eaten"
                stroke="#c8f065"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-neutral-500">
          Log a few days to unlock the snapshot.
        </p>
      )}
    </section>
  );
}