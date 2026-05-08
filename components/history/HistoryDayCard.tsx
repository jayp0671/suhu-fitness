import { formatNiceDate } from "@/lib/utils";

export function HistoryDayCard({ log, meals, exercises }: { log: any; meals: any[]; exercises: any[] }) {
  const calories = meals.reduce((sum, item) => sum + Number(item.calories ?? 0), 0);
  const protein = meals.reduce((sum, item) => sum + Number(item.protein_g ?? 0), 0);
  const done = exercises.filter((item) => item.is_done).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">{formatNiceDate(log.date)}</h2>
        <span className="text-xs text-[#c8f065]">{calories} cal</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-neutral-400">
        <p>💧 {log.water_oz ?? 0} oz</p>
        <p>👟 {(log.steps ?? 0).toLocaleString()} steps</p>
        <p>🌙 {log.sleep_hrs ?? 0} hrs sleep</p>
        <p>💪 {done}/{exercises.length} exercises</p>
        <p>🏃 Cardio: {log.cardio_done ? "Done" : "No"}</p>
        <p>⚖️ {log.weight_lbs ? `${log.weight_lbs} lbs` : "—"}</p>
        {protein > 0 && <p>🥩 {protein.toFixed(0)}g protein</p>}
        {log.mood && <p>😊 Mood: {log.mood}/5</p>}
        {log.energy && <p>⚡ Energy: {log.energy}/5</p>}
      </div>
    </div>
  );
}
