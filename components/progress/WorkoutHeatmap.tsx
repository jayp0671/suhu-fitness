"use client";

import { cn } from "@/lib/utils";

type DailyLog = { date: string; cardio_done?: boolean | null };
type ExerciseLog = { date: string; is_done?: boolean };

export function WorkoutHeatmap({ logs, exercises }: { logs: DailyLog[]; exercises: ExerciseLog[] }) {
  const today = new Date();
  const days: { date: string; hasWorkout: boolean; hasCardio: boolean }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA");
    const log = logs.find((l) => l.date === dateStr);
    const exs = exercises.filter((e) => e.date === dateStr && e.is_done);
    days.push({ date: dateStr, hasWorkout: exs.length > 0, hasCardio: Boolean(log?.cardio_done) });
  }

  // getDay(): 0=Sun,1=Mon,...,6=Sat. Convert to Mon-based: Mon=0 ... Sun=6
const firstDayOfWeek = (new Date(days[0].date + "T12:00:00").getDay() + 6) % 7;
  const streak = (() => {
    let s = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hasWorkout || days[i].hasCardio) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">28-Day Consistency</p>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#c8f065]/10 px-3 py-1 text-xs font-semibold text-[#c8f065]">
            🔥 {streak} day streak
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] text-neutral-600">{d}</div>
        ))}
        {/* leading empty cells to align first day to correct column */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}${day.hasWorkout ? " · Workout" : ""}${day.hasCardio ? " · Cardio" : ""}`}
            className={cn(
              "aspect-square rounded-md transition",
              day.hasWorkout && day.hasCardio ? "bg-[#c8f065]" :
              day.hasWorkout ? "bg-[#c8f065]/60" :
              day.hasCardio ? "bg-blue-400/50" :
              "bg-white/[0.04]"
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#c8f065] inline-block" /> Workout + Cardio</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#c8f065]/60 inline-block" /> Workout</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-400/50 inline-block" /> Cardio only</span>
      </div>
    </div>
  );
}