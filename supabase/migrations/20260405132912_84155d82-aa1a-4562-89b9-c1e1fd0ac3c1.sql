
-- Add user_id to patients
ALTER TABLE public.patients ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to caretakers
ALTER TABLE public.caretakers ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'patient',
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS on patients: only owner can see/manage their patients
DROP POLICY IF EXISTS "Allow public insert patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public read patients" ON public.patients;

CREATE POLICY "Users can read own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- Update RLS on caretakers
DROP POLICY IF EXISTS "Allow public insert caretakers" ON public.caretakers;
DROP POLICY IF EXISTS "Allow public read caretakers" ON public.caretakers;

CREATE POLICY "Users can read own caretaker" ON public.caretakers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own caretaker" ON public.caretakers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own caretaker" ON public.caretakers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own caretaker" ON public.caretakers FOR DELETE USING (auth.uid() = user_id);

-- Update RLS on medicines: owner of the patient
DROP POLICY IF EXISTS "Allow public insert medicines" ON public.medicines;
DROP POLICY IF EXISTS "Allow public read medicines" ON public.medicines;
DROP POLICY IF EXISTS "Allow public update medicines" ON public.medicines;
DROP POLICY IF EXISTS "Allow public delete medicines" ON public.medicines;

CREATE POLICY "Users can read own medicines" ON public.medicines FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicines.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Users can insert own medicines" ON public.medicines FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicines.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Users can update own medicines" ON public.medicines FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicines.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Users can delete own medicines" ON public.medicines FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicines.patient_id AND patients.user_id = auth.uid()));

-- Update RLS on medicine_logs
DROP POLICY IF EXISTS "Allow public insert medicine_logs" ON public.medicine_logs;
DROP POLICY IF EXISTS "Allow public read medicine_logs" ON public.medicine_logs;
DROP POLICY IF EXISTS "Allow public update medicine_logs" ON public.medicine_logs;

CREATE POLICY "Users can read own logs" ON public.medicine_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicine_logs.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Users can insert own logs" ON public.medicine_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicine_logs.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Users can update own logs" ON public.medicine_logs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.patients WHERE patients.id = medicine_logs.patient_id AND patients.user_id = auth.uid()));
