import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

export function useTracking(date = getLocalDate()) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to save tracking");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["today", date], (old: Record<string, unknown> | undefined) => {
        if (!old) return { log: data.log, meals: [], exercises: [] };
        return { ...old, log: data.log };
      });
    },
  });
}
