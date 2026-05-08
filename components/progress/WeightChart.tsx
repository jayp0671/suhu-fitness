"use client";

type WeightEntry = { date: string; weight_lbs: number };

export function WeightChart({ weights }: { weights: WeightEntry[] }) {
  if (weights.length < 2) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white mb-1">Weight Trend</p>
        <p className="text-xs text-neutral-500">Log at least 2 weight entries to see your trend.</p>
      </div>
    );
  }

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((w) => w.weight_lbs);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min;

  const W = 320;
  const H = 120;
  const PAD = { top: 10, right: 10, bottom: 24, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / (sorted.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - min) / range) * chartH;

  const linePath = sorted.map((w, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(w.weight_lbs).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${toX(sorted.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${toX(0).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  const first = sorted[0].weight_lbs;
  const last = sorted[sorted.length - 1].weight_lbs;
  const diff = last - first;

  const yTicks = [min + 1, min + range / 2, max - 1];

  const showEvery = Math.max(1, Math.floor(sorted.length / 4));
  const xLabels = sorted.filter((_, i) => i % showEvery === 0 || i === sorted.length - 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">Weight Trend</p>
        <span className={`text-sm font-semibold ${diff < 0 ? "text-[#c8f065]" : diff > 0 ? "text-red-400" : "text-neutral-400"}`}>
          {diff < 0 ? "▼" : diff > 0 ? "▲" : "="} {Math.abs(diff).toFixed(1)} lbs
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8f065" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c8f065" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PAD.left - 4} y={toY(v) + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8">{v.toFixed(0)}</text>
          </g>
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#wg)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#c8f065" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {sorted.map((w, i) => (
          <circle key={i} cx={toX(i)} cy={toY(w.weight_lbs)} r="3" fill="#c8f065" />
        ))}
        {/* X labels */}
        {xLabels.map((w, i) => {
          const idx = sorted.indexOf(w);
          const label = w.date.slice(5);
          return <text key={i} x={toX(idx)} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">{label}</text>;
        })}
      </svg>
      <p className="text-xs text-neutral-600 mt-2">{sorted[0].date} → {sorted[sorted.length - 1].date} · {sorted.length} entries · Current: {last} lbs</p>
    </div>
  );
}
