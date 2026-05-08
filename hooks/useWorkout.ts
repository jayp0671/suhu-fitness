import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

export function useWorkout(date = getLocalDate()) {
  const queryClient = useQueryClient();

  const saveExercise = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to save exercise");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["today", date], (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const exercises = (old.exercises as Record<string, unknown>[]) ?? [];
        const idx = exercises.findIndex((e) => e.exercise_id === data.exercise?.exercise_id);
        const updated = idx >= 0
          ? exercises.map((e, i) => i === idx ? data.exercise : e)
          : [...exercises, data.exercise];
        return { ...old, exercises: updated };
      });
    },
  });

  const saveWeight = useMutation({
    mutationFn: async (weight_lbs: number) => {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, weight_lbs }),
      });
      if (!res.ok) throw new Error("Failed to save weight");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["today", date], (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        return { ...old, log: { ...(old.log as Record<string, unknown>), weight_lbs: data.weight?.weight_lbs } };
      });
    },
  });

  return { saveExercise, saveWeight };
}
