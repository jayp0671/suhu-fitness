export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

export const WORKOUT_PLAN: Record<string, { label: string; exercises: Exercise[] }> = {
  Mon: {
    label: "Chest + Triceps",
    exercises: [
      { id: "mon_0", name: "Barbell Bench Press", sets: 4, reps: "8-10" },
      { id: "mon_1", name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
      { id: "mon_2", name: "Cable Chest Fly", sets: 3, reps: "12-15" },
      { id: "mon_3", name: "Tricep Rope Pushdown", sets: 3, reps: "12-15" },
      { id: "mon_4", name: "Overhead Tricep Extension", sets: 3, reps: "10-12" },
      { id: "mon_5", name: "Dumbbell Chest Press (flat)", sets: 3, reps: "10" },
    ],
  },
  Tue: {
    label: "Back + Biceps",
    exercises: [
      { id: "tue_0", name: "Lat Pulldown", sets: 4, reps: "10-12" },
      { id: "tue_1", name: "Seated Cable Row", sets: 3, reps: "10-12" },
      { id: "tue_2", name: "Dumbbell Single-Arm Row", sets: 3, reps: "10 each" },
      { id: "tue_3", name: "Straight-Arm Pulldown", sets: 3, reps: "12-15" },
      { id: "tue_4", name: "Barbell Curl", sets: 3, reps: "10-12" },
      { id: "tue_5", name: "Hammer Curl", sets: 3, reps: "12 each" },
    ],
  },
  Wed: {
    label: "Legs + Glutes",
    exercises: [
      { id: "wed_0", name: "Barbell Squat", sets: 4, reps: "8-10" },
      { id: "wed_1", name: "Romanian Deadlift", sets: 3, reps: "10-12" },
      { id: "wed_2", name: "Leg Press", sets: 3, reps: "12-15" },
      { id: "wed_3", name: "Hip Thrust (barbell)", sets: 4, reps: "10-12" },
      { id: "wed_4", name: "Leg Curl (machine)", sets: 3, reps: "12-15" },
      { id: "wed_5", name: "Cable Kickback", sets: 3, reps: "15 each" },
    ],
  },
  Thu: {
    label: "Shoulders + Abs",
    exercises: [
      { id: "thu_0", name: "Dumbbell Shoulder Press", sets: 4, reps: "10-12" },
      { id: "thu_1", name: "Lateral Raise (cable)", sets: 3, reps: "15" },
      { id: "thu_2", name: "Front Raise", sets: 3, reps: "12" },
      { id: "thu_3", name: "Face Pull (cable)", sets: 3, reps: "15" },
      { id: "thu_4", name: "Plank", sets: 3, reps: "45 sec" },
      { id: "thu_5", name: "Hanging Leg Raise", sets: 3, reps: "12" },
      { id: "thu_6", name: "Cable Crunch", sets: 3, reps: "15" },
    ],
  },
  Fri: {
    label: "Full Body Compound",
    exercises: [
      { id: "fri_0", name: "Deadlift", sets: 4, reps: "6-8" },
      { id: "fri_1", name: "Pull-Up / Assisted Pull-Up", sets: 3, reps: "8-10" },
      { id: "fri_2", name: "Dumbbell Lunges", sets: 3, reps: "12 each" },
      { id: "fri_3", name: "Push-Up", sets: 3, reps: "15" },
      { id: "fri_4", name: "Goblet Squat", sets: 3, reps: "15" },
      { id: "fri_5", name: "Farmer's Carry", sets: 3, reps: "30m" },
    ],
  },
  Sat: { label: "Rest Day", exercises: [] },
  Sun: { label: "Rest Day", exercises: [] },
};

export const CARDIO = {
  duration: 30,
  options: ["Treadmill incline walk", "Stairmaster", "Treadmill intervals"],
  note: "Best results: incline walk (12-3-30) or stairmaster",
};

export const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getTodayKey() {
  const day = new Date().getDay();
  return DAY_KEYS[(day + 6) % 7];
}
