
-- Agregar tabla para configuraciones generales
CREATE TABLE IF NOT EXISTS public.general_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar RLS para configuraciones generales
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan gestionar configuraciones generales
CREATE POLICY "Admins can manage general settings" 
  ON public.general_settings 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Política para que cualquiera pueda ver configuraciones generales activas
CREATE POLICY "Anyone can view general settings" 
  ON public.general_settings 
  FOR SELECT 
  USING (true);

-- Insertar configuración por defecto para dirección central
INSERT INTO public.general_settings (setting_key, setting_value) 
VALUES ('central_address', '{
  "address": "Ciudad de México, CDMX, México",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "zoom": 10
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Actualizar tabla zones para mejor manejo de coordenadas
ALTER TABLE public.zones 
ADD COLUMN IF NOT EXISTS zone_type TEXT DEFAULT 'polygon',
ADD COLUMN IF NOT EXISTS radius_meters INTEGER,
ADD COLUMN IF NOT EXISTS center_lat NUMERIC,
ADD COLUMN IF NOT EXISTS center_lng NUMERIC;
