"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNutrition } from "@/hooks/useNutrition";

export function AddFoodModal({ meal }: { meal: string }) {
  const [open, setOpen] = useState(false);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const { addFood } = useNutrition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Add food</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add {meal}</DialogTitle><DialogDescription>Log the food and estimated calories.</DialogDescription></DialogHeader>
        <Input placeholder="Food name" value={food} onChange={(e) => setFood(e.target.value)} />
        <Input placeholder="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
        <Button onClick={() => { if (!food || !calories) return; addFood.mutate({ meal, food_name: food, calories: Number(calories) }); setOpen(false); setFood(""); setCalories(""); }}>Save food</Button>
      </DialogContent>
    </Dialog>
  );
}
