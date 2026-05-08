import { useQuery } from "@tanstack/react-query";
import { getLocalDate } from "@/lib/utils";

export function useToday(date = getLocalDate()) {
  return useQuery({
    queryKey: ["today", date],
    queryFn: async () => {
      const res = await fetch(`/api/today?date=${date}`, {
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) throw new Error("Failed to load today");
      return res.json();
    },
    staleTime: Infinity,        // never auto-stale; mutations own the cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,      // ← was true; this was causing the revert
    refetchOnReconnect: false,
  });
}
