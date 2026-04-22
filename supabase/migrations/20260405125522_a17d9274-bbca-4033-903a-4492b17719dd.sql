
CREATE TABLE public.medicine_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  meal_slot TEXT NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read medicine_logs" ON public.medicine_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert medicine_logs" ON public.medicine_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update medicine_logs" ON public.medicine_logs FOR UPDATE USING (true);

CREATE INDEX idx_medicine_logs_patient ON public.medicine_logs(patient_id, scheduled_date);
CREATE UNIQUE INDEX idx_medicine_logs_unique ON public.medicine_logs(medicine_id, meal_slot, scheduled_date);
