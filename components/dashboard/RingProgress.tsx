import { clamp } from "@/lib/utils";

export function RingProgress({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  const pct = clamp(Math.round((value / goal) * 100), 0, 100);
  const circumference = 2 * Math.PI * 38;
  const dash = (pct / 100) * circumference;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <div className="relative mx-auto h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" />
          <circle cx="50" cy="50" r="38" stroke="#c8f065" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-white">{pct}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-neutral-500">{value}{unit} / {goal}{unit}</p>
    </div>
  );
}
