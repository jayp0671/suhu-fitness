"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, Timer, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkout } from "@/hooks/useWorkout";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type ExerciseHistoryItem = { date: string; sets_done: number | null; reps_done: string | null; weight_lbs: number | null };

function RestTimer({ onDone }: { onDone: () => void }) {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { onDone(); setRunning(false); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds, onDone]);

  const pct = ((90 - seconds) / 90) * 100;
  const circumference = 2 * Math.PI * 20;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="relative h-12 w-12 shrink-0">
        <svg viewBox="0 0 50 50" className="h-12 w-12 -rotate-90">
          <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,.1)" strokeWidth="4" fill="none" />
          <circle cx="25" cy="25" r="20" stroke="#c8f065" strokeWidth="4" fill="none" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{seconds}s</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-white">Rest timer</p>
        <p className="text-[10px] text-neutral-500">{running ? "Resting..." : "Tap to start"}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { setSeconds(90); setRunning(!running); }}>
          <Timer className="h-3 w-3 mr-1" />{running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setSeconds(90); setRunning(false); }}>Reset</Button>
      </div>
    </div>
  );
}

export function ExerciseItem({ exercise, log }: { exercise: { id: string; name: string; sets: number; reps: string }; log?: any }) {
  const { saveExercise } = useWorkout();
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState(log?.sets_done ?? "");
  const [reps, setReps] = useState(log?.reps_done ?? "");
  const [weight, setWeight] = useState(log?.weight_lbs ?? "");
  const [showTimer, setShowTimer] = useState(false);
  const [notes, setNotes] = useState(log?.notes ?? "");
  const done = Boolean(log?.is_done);

  const { data: historyData } = useQuery({
    queryKey: ["exercise-history", exercise.id],
    queryFn: async () => {
      const res = await fetch(`/api/workout/history?exercise_id=${exercise.id}`);
      return res.json();
    },
    enabled: open,
  });

  const history: ExerciseHistoryItem[] = historyData?.history ?? [];
  const lastSession = history[0];
  const isPR = lastSession && Number(weight) > (lastSession.weight_lbs ?? 0);

  const payload = {
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    is_custom: Boolean(log?.is_custom),
    sets_done: sets,
    reps_done: reps,
    weight_lbs: weight,
    notes,
  };

  function handleDoneToggle() {
    saveExercise.mutate({ ...payload, is_done: !done });
    if (!done) setShowTimer(true);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleDoneToggle}
          className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 transition", done && "bg-[#c8f065] text-[#0a0a0a]")}
        >
          {done ? <Check className="h-4 w-4" /> : null}
        </button>
        <button onClick={() => setOpen(!open)} className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white">{exercise.name}</p>
            {isPR && <span title="Potential PR!"><Trophy className="h-3.5 w-3.5 text-amber-400" /></span>}
          </div>
          <p className="text-xs text-neutral-500">{exercise.sets} sets × {exercise.reps}</p>
          {lastSession && (
            <p className="text-[10px] text-neutral-600 mt-0.5">
              Last: {lastSession.weight_lbs}lbs × {lastSession.reps_done}
            </p>
          )}
        </button>
        <button onClick={() => setOpen(!open)} className="text-neutral-600">
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="sets" value={sets} onChange={(e) => setSets(e.target.value)} />
            <Input placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} />
            <Input placeholder="lbs" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" />
          </div>
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button className="w-full" onClick={() => saveExercise.mutate({ ...payload, is_done: done })}>Save log</Button>

          {history.length > 1 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">Recent sessions</p>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-500">
                  <span>{h.date}</span>
                  <span>{h.weight_lbs}lbs × {h.reps_done} ({h.sets_done} sets)</span>
                </div>
              ))}
            </div>
          )}

          {showTimer && <RestTimer onDone={() => setShowTimer(false)} />}
          {!showTimer && (
            <button onClick={() => setShowTimer(true)} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition">
              <Timer className="h-3.5 w-3.5" /> Start rest timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
