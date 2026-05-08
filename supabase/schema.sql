-- ============================================================
-- Suhu Fitness -- Full Supabase Schema (Updated)
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_logs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                      DATE UNIQUE NOT NULL,
  water_oz                  NUMERIC DEFAULT 0,
  water_source              TEXT DEFAULT 'manual' CHECK (water_source IN ('manual', 'apple_health')),
  steps                     INTEGER DEFAULT 0,
  steps_source              TEXT DEFAULT 'manual' CHECK (steps_source IN ('manual', 'apple_health')),
  sleep_hrs                 NUMERIC DEFAULT 0,
  sleep_source              TEXT DEFAULT 'manual' CHECK (sleep_source IN ('manual', 'apple_health')),
  active_calories           INTEGER DEFAULT 0,
  active_calories_source    TEXT DEFAULT 'manual' CHECK (active_calories_source IN ('manual', 'apple_health')),
  resting_heart_rate        NUMERIC,
  resting_heart_rate_source TEXT DEFAULT 'manual' CHECK (resting_heart_rate_source IN ('manual', 'apple_health')),
  average_heart_rate        NUMERIC,
  average_heart_rate_source TEXT DEFAULT 'manual' CHECK (average_heart_rate_source IN ('manual', 'apple_health')),
  weight_lbs                NUMERIC,
  weight_source             TEXT DEFAULT 'manual' CHECK (weight_source IN ('manual', 'apple_health')),
  cardio_done               BOOLEAN DEFAULT false,
  mood                      INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy                    INTEGER CHECK (energy >= 1 AND energy <= 5),
  notes                     TEXT,
  apple_health_synced_at    TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  meal       TEXT NOT NULL CHECK (meal IN ('breakfast','lunch','dinner','snacks')),
  food_name  TEXT NOT NULL,
  calories   INTEGER NOT NULL DEFAULT 0,
  protein_g  NUMERIC DEFAULT 0,
  carbs_g    NUMERIC DEFAULT 0,
  fat_g      NUMERIC DEFAULT 0,
  fiber_g    NUMERIC DEFAULT 0,
  sodium_mg  NUMERIC DEFAULT 0,
  logged_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  calories   INTEGER NOT NULL DEFAULT 0,
  protein_g  NUMERIC DEFAULT 0,
  carbs_g    NUMERIC DEFAULT 0,
  fat_g      NUMERIC DEFAULT 0,
  fiber_g    NUMERIC DEFAULT 0,
  sodium_mg  NUMERIC DEFAULT 0,
  use_count  INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  exercise_id   TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  is_done       BOOLEAN DEFAULT false,
  sets_done     INTEGER,
  reps_done     TEXT,
  weight_lbs    NUMERIC,
  is_custom     BOOLEAN DEFAULT false,
  notes         TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, exercise_id)
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  weight_lbs NUMERIC NOT NULL,
  logged_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS measurements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL,
  waist_in   NUMERIC,
  hips_in    NUMERIC,
  chest_in   NUMERIC,
  arms_in    NUMERIC,
  thighs_in  NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id   TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight_lbs    NUMERIC NOT NULL,
  reps_done     TEXT,
  previous_best NUMERIC,
  achieved_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint   TEXT UNIQUE NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apple_workout_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_uuid        TEXT UNIQUE NOT NULL,
  date              DATE NOT NULL,
  workout_type      TEXT NOT NULL,
  duration_minutes  NUMERIC,
  active_calories   NUMERIC,
  distance_miles    NUMERIC,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  source            TEXT DEFAULT 'apple_health',
  synced_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_memory (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  category   TEXT NOT NULL CHECK (category IN ('diet','workout','preference','goal','note')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coaching_tips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('overload','nutrition','recovery','milestone','warning')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  exercise_id TEXT,
  dismissed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_summaries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   DATE UNIQUE NOT NULL,
  week_end     DATE NOT NULL,
  summary      TEXT NOT NULL,
  stats        JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON meal_entries(date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_date ON exercise_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_coaching_tips_dismissed ON coaching_tips(dismissed);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(date);

-- Helper function for incrementing favorite use count
CREATE OR REPLACE FUNCTION increment_favorite_use(fav_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE meal_favorites SET use_count = use_count + 1 WHERE id = fav_id;
END;
$$ LANGUAGE plpgsql;

-- Seed AI memory
INSERT INTO ai_memory (key, value, category) VALUES
  ('diet_vegetarian', 'Suhu is strictly vegetarian and does not eat eggs or meat of any kind', 'diet'),
  ('diet_no_eggs', 'Suhu does not eat eggs under any circumstances', 'diet'),
  ('goal_primary', 'Primary goal is fat loss / cutting weight while maintaining muscle', 'goal'),
  ('profile_age', '22 years old', 'preference'),
  ('profile_height', '5 feet 2 inches', 'preference'),
  ('profile_start_weight', 'Starting weight approximately 161 lbs', 'preference'),
  ('calorie_goal', 'Daily calorie goal is 1450 calories on training days, 1300 on rest days', 'goal'),
  ('protein_goal', 'Daily protein goal is 120g', 'goal'),
  ('macro_focus', 'High protein vegetarian diet to preserve muscle during cut', 'goal'),
  ('workout_schedule', '5 days per week Mon-Fri. Mon=Chest+Triceps, Tue=Back+Biceps, Wed=Legs+Glutes, Thu=Shoulders+Abs, Fri=Full Body Compound', 'workout'),
  ('cardio_preference', '30 minutes daily cardio -- treadmill incline walk or stairmaster preferred', 'workout'),
  ('experience_level', 'Intermediate gym experience, 6 months to 2 years', 'workout')
ON CONFLICT (key) DO NOTHING;
