"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkout } from "@/hooks/useWorkout";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

type ExerciseLog = {
  is_done?: boolean | null;
  sets_done?: number | null;
  reps_done?: string | null;
  weight_lbs?: number | null;
  is_custom?: boolean | null;
};

type ExerciseItemProps = {
  exercise: Exercise;
  log?: ExerciseLog;
};

export function ExerciseItem({ exercise, log }: ExerciseItemProps) {
  const { saveExercise } = useWorkout();

  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState(String(log?.sets_done ?? ""));
  const [reps, setReps] = useState(String(log?.reps_done ?? ""));
  const [weight, setWeight] = useState(String(log?.weight_lbs ?? ""));

  const done = Boolean(log?.is_done);

  const payload = {
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    is_custom: Boolean(log?.is_custom),
    sets_done: sets,
    reps_done: reps,
    weight_lbs: weight,
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => saveExercise.mutate({ ...payload, is_done: !done })}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border border-white/10",
            done && "bg-[#c8f065] text-[#0a0a0a]"
          )}
          type="button"
        >
          {done ? <Check className="h-4 w-4" /> : null}
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left"
          type="button"
        >
          <p className="font-semibold text-white">{exercise.name}</p>
          <p className="text-xs text-neutral-500">
            {exercise.sets} sets × {exercise.reps}
          </p>
        </button>
      </div>

      {open ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Input
            placeholder="sets"
            value={sets}
            onChange={(event) => setSets(event.target.value)}
          />
          <Input
            placeholder="reps"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
          />
          <Input
            placeholder="lbs"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <Button
            className="col-span-3"
            onClick={() => saveExercise.mutate({ ...payload, is_done: done })}
          >
            Save log
          </Button>
        </div>
      ) : null}
    </div>
  );
}