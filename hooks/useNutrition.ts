import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

type AddFoodPayload = {
  meal: string;
  food_name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
};

export function useNutrition(date = getLocalDate()) {
  const queryClient = useQueryClient();

  const addFood = useMutation({
    mutationFn: async (payload: AddFoodPayload) => {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to add food");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["today", date], (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const meals = (old.meals as Record<string, unknown>[]) ?? [];
        return { ...old, meals: [...meals, data.meal] };
      });
    },
  });

  const deleteFood = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/nutrition?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete food");
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData(["today", date], (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const meals = (old.meals as Record<string, unknown>[]) ?? [];
        return { ...old, meals: meals.filter((m) => m.id !== id) };
      });
    },
  });

  return { addFood, deleteFood };
}
