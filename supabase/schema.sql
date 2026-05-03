CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,

  water_oz NUMERIC DEFAULT 0,
  water_source TEXT DEFAULT 'manual' CHECK (water_source IN ('manual', 'apple_health')),

  steps INTEGER DEFAULT 0,
  steps_source TEXT DEFAULT 'manual' CHECK (steps_source IN ('manual', 'apple_health')),

  sleep_hrs NUMERIC DEFAULT 0,
  sleep_source TEXT DEFAULT 'manual' CHECK (sleep_source IN ('manual', 'apple_health')),

  active_calories INTEGER DEFAULT 0,
  active_calories_source TEXT DEFAULT 'manual' CHECK (active_calories_source IN ('manual', 'apple_health')),

  resting_heart_rate INTEGER,
  resting_heart_rate_source TEXT DEFAULT 'manual' CHECK (resting_heart_rate_source IN ('manual', 'apple_health')),

  average_heart_rate INTEGER,
  average_heart_rate_source TEXT DEFAULT 'manual' CHECK (average_heart_rate_source IN ('manual', 'apple_health')),

  weight_lbs NUMERIC,
  weight_source TEXT DEFAULT 'manual' CHECK (weight_source IN ('manual', 'apple_health')),

  cardio_done BOOLEAN DEFAULT false,

  apple_health_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apple_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_uuid TEXT UNIQUE,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL,
  duration_minutes NUMERIC,
  active_calories INTEGER,
  distance_miles NUMERIC,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  source TEXT DEFAULT 'apple_health',
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);