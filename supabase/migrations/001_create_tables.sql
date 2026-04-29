-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create daily logs table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sleep_hours DECIMAL(3,1),
  screen_time_hours DECIMAL(3,1),
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INT CHECK (energy_level >= 1 AND energy_level <= 10),
  activity_minutes INT,
  social_plans TEXT,
  logged_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create patterns table
CREATE TABLE IF NOT EXISTS public.patterns (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pattern_type VARCHAR(100),
  detected_at TIMESTAMP,
  severity INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS public.interventions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pattern_id BIGINT REFERENCES public.patterns(id),
  intervention_text TEXT,
  ai_generated BOOLEAN DEFAULT TRUE,
  accepted BOOLEAN,
  effectiveness_rating INT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  mood_before INT,
  mood_after INT,
  sentiment_score DECIMAL(3,2),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS Policies for daily_logs table
CREATE POLICY "Users can view own logs" ON public.daily_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own logs" ON public.daily_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own logs" ON public.daily_logs
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS Policies for patterns table
CREATE POLICY "Users can view own patterns" ON public.patterns
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patterns" ON public.patterns
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS Policies for interventions table
CREATE POLICY "Users can view own interventions" ON public.interventions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own interventions" ON public.interventions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own interventions" ON public.interventions
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS Policies for journal_entries table
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX idx_daily_logs_created_at ON public.daily_logs(created_at);
CREATE INDEX idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX idx_patterns_detected_at ON public.patterns(detected_at);
CREATE INDEX idx_interventions_user_id ON public.interventions(user_id);
CREATE INDEX idx_interventions_sent_at ON public.interventions(sent_at);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
