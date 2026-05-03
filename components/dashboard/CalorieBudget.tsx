import { Progress } from "@/components/ui/progress";
import { GOALS } from "@/lib/goals";

export function CalorieBudget({ calories }: { calories: number }) {
  const remaining = Math.max(GOALS.calories - calories, 0);
  const pct = Math.min((calories / GOALS.calories) * 100, 100);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-400">Calorie budget</p>
          <p className="mt-1 text-2xl font-semibold text-white">{remaining} left</p>
        </div>
        <p className="text-sm text-[#c8f065]">{calories} / {GOALS.calories}</p>
      </div>
      <Progress className="mt-5" value={pct} />
    </div>
  );
}
