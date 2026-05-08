export const GOALS = {
  calories: 1450,
  restDayCalories: 1300,
  water: 80,
  steps: 8000,
  sleep: 8,
  protein: 120,
  activeCalories: 400,
};

export const SUHU_PROFILE = {
  name: "Suhu",
  age: 22,
  weightLbs: 161,
  height: "5'2\"",
  goal: "fat loss",
};

export function getTodayCalorieGoal(): number {
  const day = new Date().getDay();
  // 0 = Sunday, 6 = Saturday
  const isRestDay = day === 0 || day === 6;
  return isRestDay ? GOALS.restDayCalories : GOALS.calories;
}
