import { Progress } from "@/components/ui/progress";
import { GOALS } from "@/lib/goals";
import { isRestDay as checkRestDay } from "@/lib/utils";

function getTodayGoal() {
  return checkRestDay() ? GOALS.restDayCalories : GOALS.calories;
}

export function CalorieBudget({ calories }: { calories: number }) {
  const goal = getTodayGoal();
  const remaining = Math.max(goal - calories, 0);
  const pct = Math.min((calories / goal) * 100, 100);
  const over = calories > goal;
  const restDay = checkRestDay();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-neutral-400">Calorie budget</p>
            {restDay && <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">Rest day</span>}
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">
            {over ? <span className="text-amber-400">+{calories - goal} over</span> : `${remaining} left`}
          </p>
        </div>
        <p className={`text-sm ${over ? "text-amber-400" : "text-[#c8f065]"}`}>{calories} / {goal}</p>
      </div>
      <Progress className="mt-5" value={pct} />
    </div>
  );
}
