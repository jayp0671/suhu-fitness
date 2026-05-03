import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

export function useWorkout(date = getLocalDate()) {
  const queryClient = useQueryClient();
  const saveExercise = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/workout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, ...payload }) });
      if (!res.ok) throw new Error("Failed to save exercise");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today", date] }),
  });
  const saveWeight = useMutation({
    mutationFn: async (weight_lbs: number) => {
      const res = await fetch("/api/weight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, weight_lbs }) });
      if (!res.ok) throw new Error("Failed to save weight");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today", date] }),
  });
  return { saveExercise, saveWeight };
}
