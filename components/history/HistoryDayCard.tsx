import { formatNiceDate } from "@/lib/utils";

type DailyLog = {
  date: string;
  water_oz?: number | null;
  steps?: number | null;
  sleep_hrs?: number | null;
  weight_lbs?: number | null;
  cardio_done?: boolean | null;
};

type MealEntry = {
  calories?: number | null;
};

type ExerciseLog = {
  is_done?: boolean | null;
};

type HistoryDayCardProps = {
  log: DailyLog;
  meals: MealEntry[];
  exercises: ExerciseLog[];
};

export function HistoryDayCard({
  log,
  meals,
  exercises,
}: HistoryDayCardProps) {
  const calories = meals.reduce((sum, item) => {
    return sum + Number(item.calories ?? 0);
  }, 0);

  const done = exercises.filter((item) => item.is_done).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">{formatNiceDate(log.date)}</h2>
        <span className="text-xs text-[#c8f065]">{calories} cal</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-400">
        <p>Water: {log.water_oz ?? 0} oz</p>
        <p>Steps: {log.steps ?? 0}</p>
        <p>Sleep: {log.sleep_hrs ?? 0} hrs</p>
        <p>
          Workout: {done}/{exercises.length}
        </p>
        <p>Cardio: {log.cardio_done ? "Done" : "No"}</p>
        <p>Weight: {log.weight_lbs ? `${log.weight_lbs} lbs` : "—"}</p>
      </div>
    </div>
  );
}