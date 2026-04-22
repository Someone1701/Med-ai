
-- Drop all auth-based policies and replace with public access

-- patients
DROP POLICY IF EXISTS "Users can insert own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can read own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON public.patients;

CREATE POLICY "Allow public insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public update patients" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete patients" ON public.patients FOR DELETE USING (true);

-- caretakers
DROP POLICY IF EXISTS "Users can insert own caretaker" ON public.caretakers;
DROP POLICY IF EXISTS "Users can read own caretaker" ON public.caretakers;
DROP POLICY IF EXISTS "Users can update own caretaker" ON public.caretakers;
DROP POLICY IF EXISTS "Users can delete own caretaker" ON public.caretakers;

CREATE POLICY "Allow public insert caretakers" ON public.caretakers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read caretakers" ON public.caretakers FOR SELECT USING (true);
CREATE POLICY "Allow public update caretakers" ON public.caretakers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete caretakers" ON public.caretakers FOR DELETE USING (true);

-- medicines
DROP POLICY IF EXISTS "Users can insert own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Users can read own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Users can update own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Users can delete own medicines" ON public.medicines;

CREATE POLICY "Allow public insert medicines" ON public.medicines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Allow public update medicines" ON public.medicines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete medicines" ON public.medicines FOR DELETE USING (true);

-- medicine_logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.medicine_logs;
DROP POLICY IF EXISTS "Users can read own logs" ON public.medicine_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.medicine_logs;

CREATE POLICY "Allow public insert medicine_logs" ON public.medicine_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read medicine_logs" ON public.medicine_logs FOR SELECT USING (true);
CREATE POLICY "Allow public update medicine_logs" ON public.medicine_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete medicine_logs" ON public.medicine_logs FOR DELETE USING (true);
