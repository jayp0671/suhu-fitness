import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

export function useNutrition(date = getLocalDate()) {
  const queryClient = useQueryClient();
  const addFood = useMutation({
    mutationFn: async (payload: { meal: string; food_name: string; calories: number }) => {
      const res = await fetch("/api/nutrition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, ...payload }) });
      if (!res.ok) throw new Error("Failed to add food");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today", date] }),
  });
  const deleteFood = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/nutrition?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete food");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today", date] }),
  });
  return { addFood, deleteFood };
}
