import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

type DailyLogRow = {
  date: string;
  water_oz: number | null;
  steps: number | null;
  sleep_hrs: number | null;
  weight_lbs: number | null;
  active_calories: number | null;
  resting_heart_rate: number | null;
  average_heart_rate: number | null;
  cardio_done: boolean | null;
};

type MealEntryRow = {
  date: string;
  calories: number | null;
};

type ExerciseLogRow = {
  date: string;
  exercise_id: string;
  exercise_name: string;
  is_done: boolean | null;
  sets_done: number | null;
  reps_done: string | null;
  weight_lbs: number | null;
};

type AppleWorkoutSessionRow = {
  date: string;
  workout_type: string;
  duration_minutes: number | null;
  active_calories: number | null;
};

type DailyProgressPoint = {
  date: string;
  label: string;
  calories_eaten: number;
  water_oz: number;
  steps: number;
  sleep_hrs: number;
  weight_lbs: number | null;
  active_calories: number;
  resting_heart_rate: number | null;
  average_heart_rate: number | null;
  workouts_done: number;
  cardio_done: boolean;
  apple_workouts: number;
};

type ExerciseProgressPoint = {
  date: string;
  label: string;
  sets_done: number;
  reps_value: number;
  weight_lbs: number;
  volume: number;
};

function toDateString(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function formatLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function getDateRange(days: number) {
  const today = new Date();
  const start = new Date();

  start.setDate(today.getDate() - (days - 1));

  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    dates.push(toDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    startDate: toDateString(start),
    dates,
  };
}

function numberValue(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

function nullableNumberValue(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return value;
}

function parseReps(value: string | null) {
  if (!value) {
    return 0;
  }

  const match = value.match(/\d+(\.\d+)?/);

  if (!match) {
    return 0;
  }

  return Number(match[0]);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const daysParam = Number(searchParams.get("days") ?? "60");
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(Math.round(daysParam), 7), 180)
    : 60;

  const { startDate, dates } = getDateRange(days);
  const supabase = getServiceSupabase();

  const [logsRes, mealsRes, exercisesRes, appleWorkoutsRes] = await Promise.all([
    supabase
      .from("daily_logs")
      .select(
        "date, water_oz, steps, sleep_hrs, weight_lbs, active_calories, resting_heart_rate, average_heart_rate, cardio_done"
      )
      .gte("date", startDate)
      .order("date", { ascending: true }),

    supabase
      .from("meal_entries")
      .select("date, calories")
      .gte("date", startDate)
      .order("date", { ascending: true }),

    supabase
      .from("exercise_logs")
      .select(
        "date, exercise_id, exercise_name, is_done, sets_done, reps_done, weight_lbs"
      )
      .gte("date", startDate)
      .order("date", { ascending: true }),

    supabase
      .from("apple_workout_sessions")
      .select("date, workout_type, duration_minutes, active_calories")
      .gte("date", startDate)
      .order("date", { ascending: true }),
  ]);

  if (logsRes.error) {
    return NextResponse.json({ error: logsRes.error.message }, { status: 500 });
  }

  if (mealsRes.error) {
    return NextResponse.json({ error: mealsRes.error.message }, { status: 500 });
  }

  if (exercisesRes.error) {
    return NextResponse.json(
      { error: exercisesRes.error.message },
      { status: 500 }
    );
  }

  if (appleWorkoutsRes.error) {
    return NextResponse.json(
      { error: appleWorkoutsRes.error.message },
      { status: 500 }
    );
  }

  const logs = (logsRes.data ?? []) as DailyLogRow[];
  const meals = (mealsRes.data ?? []) as MealEntryRow[];
  const exercises = (exercisesRes.data ?? []) as ExerciseLogRow[];
  const appleWorkouts = (appleWorkoutsRes.data ?? []) as AppleWorkoutSessionRow[];

  const logByDate = new Map<string, DailyLogRow>();
  const caloriesByDate = new Map<string, number>();
  const workoutsDoneByDate = new Map<string, number>();
  const appleWorkoutsByDate = new Map<string, number>();

  logs.forEach((log) => {
    logByDate.set(log.date, log);
  });

  meals.forEach((meal) => {
    caloriesByDate.set(
      meal.date,
      (caloriesByDate.get(meal.date) ?? 0) + numberValue(meal.calories)
    );
  });

  exercises.forEach((exercise) => {
    if (!exercise.is_done) {
      return;
    }

    workoutsDoneByDate.set(
      exercise.date,
      (workoutsDoneByDate.get(exercise.date) ?? 0) + 1
    );
  });

  appleWorkouts.forEach((workout) => {
    appleWorkoutsByDate.set(
      workout.date,
      (appleWorkoutsByDate.get(workout.date) ?? 0) + 1
    );
  });

  const daily: DailyProgressPoint[] = dates.map((date) => {
    const log = logByDate.get(date);

    return {
      date,
      label: formatLabel(date),
      calories_eaten: caloriesByDate.get(date) ?? 0,
      water_oz: numberValue(log?.water_oz),
      steps: numberValue(log?.steps),
      sleep_hrs: numberValue(log?.sleep_hrs),
      weight_lbs: nullableNumberValue(log?.weight_lbs),
      active_calories: numberValue(log?.active_calories),
      resting_heart_rate: nullableNumberValue(log?.resting_heart_rate),
      average_heart_rate: nullableNumberValue(log?.average_heart_rate),
      workouts_done: workoutsDoneByDate.get(date) ?? 0,
      cardio_done: Boolean(log?.cardio_done),
      apple_workouts: appleWorkoutsByDate.get(date) ?? 0,
    };
  });

  const exerciseMap = new Map<
    string,
    {
      exercise_id: string;
      exercise_name: string;
      points: ExerciseProgressPoint[];
    }
  >();

  exercises.forEach((exercise) => {
    const sets = numberValue(exercise.sets_done);
    const reps = parseReps(exercise.reps_done);
    const weight = numberValue(exercise.weight_lbs);

    if (!exercise.is_done && sets === 0 && reps === 0 && weight === 0) {
      return;
    }

    const key = exercise.exercise_id || exercise.exercise_name;

    if (!exerciseMap.has(key)) {
      exerciseMap.set(key, {
        exercise_id: key,
        exercise_name: exercise.exercise_name,
        points: [],
      });
    }

    exerciseMap.get(key)?.points.push({
      date: exercise.date,
      label: formatLabel(exercise.date),
      sets_done: sets,
      reps_value: reps,
      weight_lbs: weight,
      volume: Math.round(sets * reps * weight),
    });
  });

  const exerciseProgress = Array.from(exerciseMap.values())
    .map((exercise) => ({
      ...exercise,
      points: exercise.points.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.exercise_name.localeCompare(b.exercise_name));

  const daysWithWorkouts = daily.filter(
    (point) => point.workouts_done > 0 || point.cardio_done
  ).length;

  const latestWeight = [...daily]
    .reverse()
    .find((point) => point.weight_lbs !== null)?.weight_lbs;

  const summary = {
    days,
    total_calories_eaten: daily.reduce(
      (total, point) => total + point.calories_eaten,
      0
    ),
    total_steps: daily.reduce((total, point) => total + point.steps, 0),
    total_workout_days: daysWithWorkouts,
    average_sleep:
      daily.reduce((total, point) => total + point.sleep_hrs, 0) / daily.length,
    average_water:
      daily.reduce((total, point) => total + point.water_oz, 0) / daily.length,
    latest_weight: latestWeight ?? null,
  };

  return NextResponse.json({
    summary,
    daily,
    exerciseProgress,
  });
}