-- Pregnancy Metrics Tables

-- Weight tracking
CREATE TABLE IF NOT EXISTS public.pregnancy_weight (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  weight_lbs DECIMAL(5,2),
  weight_gain_kg DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blood pressure tracking
CREATE TABLE IF NOT EXISTS public.pregnancy_blood_pressure (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  systolic INT NOT NULL,
  diastolic INT NOT NULL,
  pulse INT,
  notes TEXT,
  risk_level VARCHAR(20), -- normal, elevated, high
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Glucose levels (gestational diabetes screening)
CREATE TABLE IF NOT EXISTS public.pregnancy_glucose (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  glucose_mg_dl INT NOT NULL,
  glucose_mmol_l DECIMAL(4,1),
  test_type VARCHAR(50), -- fasting, random, 2hr_after_meal
  notes TEXT,
  risk_level VARCHAR(20), -- normal, elevated, high
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fetal movement tracking
CREATE TABLE IF NOT EXISTS public.pregnancy_fetal_movement (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kicks_count INT NOT NULL,
  duration_minutes INT,
  movement_quality VARCHAR(50), -- normal, decreased, increased
  notes TEXT,
  risk_level VARCHAR(20), -- normal, concerning
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prenatal appointments
CREATE TABLE IF NOT EXISTS public.pregnancy_appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100), -- ultrasound, checkup, lab_work, etc
  provider_name VARCHAR(255),
  provider_type VARCHAR(50), -- obgyn, midwife, nurse
  appointment_date TIMESTAMP NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  results TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lab results and tests
CREATE TABLE IF NOT EXISTS public.pregnancy_lab_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(50), -- blood_work, ultrasound, genetic_screening, etc
  result_value VARCHAR(255),
  result_unit VARCHAR(50),
  reference_range VARCHAR(255),
  status VARCHAR(20), -- normal, abnormal, pending
  test_date TIMESTAMP NOT NULL,
  result_date TIMESTAMP,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pregnancy symptoms
CREATE TABLE IF NOT EXISTS public.pregnancy_symptoms (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  symptom_name VARCHAR(100) NOT NULL,
  severity INT CHECK (severity >= 1 AND severity <= 10),
  duration_hours INT,
  notes TEXT,
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Medications and supplements
CREATE TABLE IF NOT EXISTS public.pregnancy_medications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  medication_type VARCHAR(50), -- prenatal_vitamin, prescription, supplement, etc
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  reason VARCHAR(255),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  prescribed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pregnancy risk assessments
CREATE TABLE IF NOT EXISTS public.pregnancy_risk_assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  risk_type VARCHAR(100), -- preeclampsia, gestational_diabetes, etc
  risk_level VARCHAR(20), -- low, moderate, high
  risk_score DECIMAL(3,1),
  contributing_factors JSONB,
  recommendations TEXT,
  assessed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pregnancy_weight_user_id ON public.pregnancy_weight(user_id);
CREATE INDEX idx_pregnancy_weight_recorded_at ON public.pregnancy_weight(recorded_at);
CREATE INDEX idx_pregnancy_blood_pressure_user_id ON public.pregnancy_blood_pressure(user_id);
CREATE INDEX idx_pregnancy_blood_pressure_recorded_at ON public.pregnancy_blood_pressure(recorded_at);
CREATE INDEX idx_pregnancy_glucose_user_id ON public.pregnancy_glucose(user_id);
CREATE INDEX idx_pregnancy_glucose_recorded_at ON public.pregnancy_glucose(recorded_at);
CREATE INDEX idx_pregnancy_fetal_movement_user_id ON public.pregnancy_fetal_movement(user_id);
CREATE INDEX idx_pregnancy_fetal_movement_recorded_at ON public.pregnancy_fetal_movement(recorded_at);
CREATE INDEX idx_pregnancy_appointments_user_id ON public.pregnancy_appointments(user_id);
CREATE INDEX idx_pregnancy_appointments_date ON public.pregnancy_appointments(appointment_date);
CREATE INDEX idx_pregnancy_lab_results_user_id ON public.pregnancy_lab_results(user_id);
CREATE INDEX idx_pregnancy_lab_results_test_date ON public.pregnancy_lab_results(test_date);
CREATE INDEX idx_pregnancy_symptoms_user_id ON public.pregnancy_symptoms(user_id);
CREATE INDEX idx_pregnancy_symptoms_recorded_at ON public.pregnancy_symptoms(recorded_at);
CREATE INDEX idx_pregnancy_medications_user_id ON public.pregnancy_medications(user_id);
CREATE INDEX idx_pregnancy_risk_assessments_user_id ON public.pregnancy_risk_assessments(user_id);

-- Row-level security
ALTER TABLE public.pregnancy_weight ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_blood_pressure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_glucose ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_fetal_movement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pregnancy data" ON public.pregnancy_weight
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pregnancy data" ON public.pregnancy_weight
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pregnancy data" ON public.pregnancy_weight
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own blood pressure" ON public.pregnancy_blood_pressure
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own blood pressure" ON public.pregnancy_blood_pressure
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own blood pressure" ON public.pregnancy_blood_pressure
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own glucose" ON public.pregnancy_glucose
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own glucose" ON public.pregnancy_glucose
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own glucose" ON public.pregnancy_glucose
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own fetal movement" ON public.pregnancy_fetal_movement
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own fetal movement" ON public.pregnancy_fetal_movement
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own fetal movement" ON public.pregnancy_fetal_movement
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own appointments" ON public.pregnancy_appointments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own appointments" ON public.pregnancy_appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own appointments" ON public.pregnancy_appointments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own lab results" ON public.pregnancy_lab_results
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own lab results" ON public.pregnancy_lab_results
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own lab results" ON public.pregnancy_lab_results
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own symptoms" ON public.pregnancy_symptoms
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own symptoms" ON public.pregnancy_symptoms
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own symptoms" ON public.pregnancy_symptoms
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own medications" ON public.pregnancy_medications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own medications" ON public.pregnancy_medications
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own medications" ON public.pregnancy_medications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own risk assessments" ON public.pregnancy_risk_assessments
  FOR SELECT USING (user_id = auth.uid());
