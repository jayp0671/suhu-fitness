"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeightChart } from "@/components/progress/WeightChart";
import { WorkoutHeatmap } from "@/components/progress/WorkoutHeatmap";
import { PRList } from "@/components/progress/PRList";
import { WeeklySummaryCard } from "@/components/progress/WeeklySummaryCard";
import { MeasurementsCard } from "@/components/progress/MeasurementsCard";
import { AppleShortcutGuide } from "@/components/progress/AppleShortcutGuide";

export default function ProgressPage() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) throw new Error("Failed to load progress");
      return res.json();
    },
  });

  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed history");
      return res.json();
    },
  });

  const weights = progress?.weights ?? [];
  const summaries = progress?.summaries ?? [];
  const prs = progress?.prs ?? [];
  const logs = history?.logs ?? [];
  const exercises = history?.exercises ?? [];

  return (
    <main className="suhu-page px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md space-y-4">
        <PageHeader title="Progress" subtitle="Charts, records, summaries, and Apple Watch setup." />

        {isLoading ? (
          <p className="text-neutral-400">Loading...</p>
        ) : (
          <>
            <WeightChart weights={weights} />
            <WorkoutHeatmap logs={logs} exercises={exercises} />
            <MeasurementsCard />
            <PRList prs={prs} />
            <AppleShortcutGuide />

            {summaries.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 px-1">Weekly Coach Summaries</p>
                {summaries.map((s: any) => (
                  <WeeklySummaryCard key={s.id} summary={s} />
                ))}
              </div>
            )}

            {summaries.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-neutral-500">No weekly summaries yet. They are generated every Sunday automatically, or you can trigger one via <code className="text-[#c8f065]">/api/coaching/weekly</code>.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
