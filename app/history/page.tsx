"use client";

import { useQuery } from "@tanstack/react-query";
import { HistoryDayCard } from "@/components/history/HistoryDayCard";
import { PageHeader } from "@/components/layout/PageHeader";

export default function HistoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: async () => { const res = await fetch("/api/history"); if (!res.ok) throw new Error("Failed history"); return res.json(); } });
  const logs = data?.logs ?? [];
  return <main className="suhu-page px-5 pb-32 pt-8"><div className="mx-auto max-w-md space-y-4"><PageHeader title="History" subtitle="Newest days first, with daily summaries." />{isLoading ? <p className="text-neutral-400">Loading...</p> : logs.length ? logs.map((log: any) => <HistoryDayCard key={log.id} log={log} meals={(data?.meals ?? []).filter((item: any) => item.date === log.date)} exercises={(data?.exercises ?? []).filter((item: any) => item.date === log.date)} />) : <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-neutral-400">No history yet. Start logging today.</p>}</div></main>;
}
