import { DAY_KEYS } from "@/lib/workout-plan";
import { cn } from "@/lib/utils";

export function DayTabs({ selected, onSelect }: { selected: string; onSelect: (day: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {DAY_KEYS.map((day) => (
        <button
          key={day}
          onClick={() => onSelect(day)}
          className={cn("min-w-14 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-400 transition", selected === day && "bg-[#c8f065] text-[#0a0a0a]")}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
