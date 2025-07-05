-- Crear tabla para disponibilidad semanal (días de la semana)
CREATE TABLE public.weekly_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado
  time_slot_1_start TIME,
  time_slot_1_end TIME,
  time_slot_2_start TIME,
  time_slot_2_end TIME,
  time_slot_3_start TIME,
  time_slot_3_end TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para días no laborables (fechas específicas)
CREATE TABLE public.non_working_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para configuraciones de reservas
CREATE TABLE public.booking_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar configuración inicial para umbral de reservas
INSERT INTO public.booking_settings (setting_key, setting_value) VALUES 
('max_bookings_per_time_slot', '{"value": 5}'),
('max_bookings_per_day', '{"value": 20}');

-- Insertar disponibilidad por defecto (Lunes a Viernes, 3 turnos)
INSERT INTO public.weekly_availability (day_of_week, time_slot_1_start, time_slot_1_end, time_slot_2_start, time_slot_2_end, time_slot_3_start, time_slot_3_end) VALUES
(1, '08:00', '12:00', '13:00', '17:00', '18:00', '20:00'), -- Lunes
(2, '08:00', '12:00', '13:00', '17:00', '18:00', '20:00'), -- Martes
(3, '08:00', '12:00', '13:00', '17:00', '18:00', '20:00'), -- Miércoles
(4, '08:00', '12:00', '13:00', '17:00', '18:00', '20:00'), -- Jueves
(5, '08:00', '12:00', '13:00', '17:00', '18:00', '20:00'), -- Viernes
(6, '08:00', '12:00', '13:00', '17:00', NULL, NULL), -- Sábado (solo 2 turnos)
(0, NULL, NULL, NULL, NULL, NULL, NULL); -- Domingo cerrado

-- Habilitar RLS
ALTER TABLE public.weekly_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para weekly_availability
CREATE POLICY "Anyone can view weekly availability" ON public.weekly_availability FOR SELECT USING (true);
CREATE POLICY "Admins can manage weekly availability" ON public.weekly_availability FOR ALL USING (is_admin(auth.uid()));

-- Políticas RLS para non_working_days
CREATE POLICY "Anyone can view non working days" ON public.non_working_days FOR SELECT USING (true);
CREATE POLICY "Admins can manage non working days" ON public.non_working_days FOR ALL USING (is_admin(auth.uid()));

-- Políticas RLS para booking_settings
CREATE POLICY "Anyone can view booking settings" ON public.booking_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage booking settings" ON public.booking_settings FOR ALL USING (is_admin(auth.uid()));

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_weekly_availability_updated_at
  BEFORE UPDATE ON public.weekly_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_settings_updated_at
  BEFORE UPDATE ON public.booking_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();