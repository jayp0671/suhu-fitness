"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { SleepTracker } from "@/components/tracking/SleepTracker";
import { StepsTracker } from "@/components/tracking/StepsTracker";
import { WaterTracker } from "@/components/tracking/WaterTracker";
import { useToday } from "@/hooks/useToday";

export default function TrackingPage() {
  const { data } = useToday();
  const log = data?.log ?? {};
  return <main className="suhu-page px-5 pb-32 pt-8"><div className="mx-auto max-w-md space-y-4"><PageHeader title="Tracking" subtitle="Water, steps, and sleep without the clutter." /><WaterTracker water={Number(log.water_oz ?? 0)} /><StepsTracker steps={Number(log.steps ?? 0)} /><SleepTracker sleep={Number(log.sleep_hrs ?? 0)} /></div></main>;
}
