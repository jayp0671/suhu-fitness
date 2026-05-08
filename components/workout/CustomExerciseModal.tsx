"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWorkout } from "@/hooks/useWorkout";

export function CustomExerciseModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const { saveExercise } = useWorkout();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Add custom exercise</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>Custom exercises only appear for today.</DialogDescription>
        </DialogHeader>
        <Input placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} />
          <Input placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <Button onClick={() => {
          if (!name) return;
          saveExercise.mutate({ exercise_id: `custom_${Date.now()}`, exercise_name: name, is_done: false, sets_done: sets, reps_done: reps, is_custom: true });
          setOpen(false); setName(""); setSets(""); setReps("");
        }}>
          Save exercise
        </Button>
      </DialogContent>
    </Dialog>
  );
}
