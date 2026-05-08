"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Dumbbell, Utensils, AlertTriangle, Trophy, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Tip = { id: string; type: "overload" | "nutrition" | "recovery" | "milestone" | "warning"; title: string; body: string; created_at: string; };

const TIP_STYLES: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  overload:  { color: "text-[#c8f065]", bg: "bg-[#c8f065]/5",  border: "border-[#c8f065]/20",  Icon: Dumbbell },
  nutrition: { color: "text-blue-400",  bg: "bg-blue-400/5",   border: "border-blue-400/20",   Icon: Utensils },
  warning:   { color: "text-amber-400", bg: "bg-amber-400/5",  border: "border-amber-400/20",  Icon: AlertTriangle },
  milestone: { color: "text-pink-400",  bg: "bg-pink-400/5",   border: "border-pink-400/20",   Icon: Trophy },
  recovery:  { color: "text-green-400", bg: "bg-green-400/5",  border: "border-green-400/20",  Icon: Heart },
};

async function fetchTips(): Promise<{ tips: Tip[] }> {
  const res = await fetch("/api/coaching/tips");
  if (!res.ok) throw new Error("Failed to fetch tips");
  return res.json();
}

async function dismissTip(id: string) {
  await fetch("/api/coaching/tips", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
}

export function CoachingTips() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["coaching-tips"], queryFn: fetchTips });
  const dismiss = useMutation({ mutationFn: dismissTip, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coaching-tips"] }) });
  const tips = data?.tips ?? [];
  if (tips.length === 0) return null;

  return (
    <div className="space-y-3">
      {tips.map((tip) => {
        const style = TIP_STYLES[tip.type] ?? TIP_STYLES.nutrition;
        const { Icon } = style;
        return (
          <div key={tip.id} className={cn("rounded-[2rem] border p-5", style.bg, style.border)}>
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 shrink-0", style.color)}><Icon className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className={cn("text-sm font-semibold", style.color)}>{tip.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-300">{tip.body}</p>
              </div>
              <button onClick={() => dismiss.mutate(tip.id)} className="shrink-0 text-neutral-600 transition hover:text-neutral-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
