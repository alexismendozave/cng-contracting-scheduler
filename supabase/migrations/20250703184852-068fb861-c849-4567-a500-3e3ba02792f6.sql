
-- Add deposit configuration to services table
ALTER TABLE public.services ADD COLUMN deposit_type TEXT DEFAULT 'none' CHECK (deposit_type IN ('none', 'fixed', 'percentage'));
ALTER TABLE public.services ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0;

-- Update zones table to support both percentage and fixed pricing
ALTER TABLE public.zones ADD COLUMN pricing_type TEXT DEFAULT 'percentage' CHECK (pricing_type IN ('percentage', 'fixed'));
ALTER TABLE public.zones ADD COLUMN fixed_price DECIMAL(10,2);

-- Create service_zone_prices table for custom pricing per service per zone
CREATE TABLE public.service_zone_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, zone_id)
);

-- Enable RLS on service_zone_prices
ALTER TABLE public.service_zone_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_zone_prices
CREATE POLICY "Anyone can view active service zone prices" ON public.service_zone_prices
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service zone prices" ON public.service_zone_prices
  FOR ALL USING (public.is_admin(auth.uid()));

-- Update payment methods to support multiple configuration fields
ALTER TABLE public.payment_methods ADD COLUMN public_key TEXT;
ALTER TABLE public.payment_methods ADD COLUMN secret_key TEXT;
ALTER TABLE public.payment_methods ADD COLUMN webhook_url TEXT;
ALTER TABLE public.payment_methods ADD COLUMN client_id TEXT;
ALTER TABLE public.payment_methods ADD COLUMN client_secret TEXT;

-- Insert sample services from database instead of hardcoded
INSERT INTO public.services (name, description, category, base_price, duration_minutes, deposit_type, deposit_amount) VALUES 
('Reparación de Plomería', 'Solucionamos todo tipo de problemas de plomería, desde fugas hasta instalaciones completas.', 'plomeria', 89.00, 120, 'percentage', 30),
('Instalación Eléctrica', 'Instalamos y reparamos sistemas eléctricos para hogares y negocios.', 'electricidad', 95.00, 180, 'fixed', 25),
('Pintura Interior', 'Transformamos tus espacios con servicios de pintura de alta calidad.', 'pintura', 150.00, 480, 'percentage', 50);

-- Insert sample zones with different pricing types
INSERT INTO public.zones (name, description, multiplier, pricing_type, fixed_price, color) VALUES 
('Zona Centro', 'Área metropolitana central - Sin recargo', 1.0, 'percentage', NULL, '#3B82F6'),
('Zona Norte', 'Área norte de la ciudad - 15% recargo por distancia', 1.15, 'percentage', NULL, '#10B981'),
('Zona Sur', 'Área sur de la ciudad - 10% recargo por distancia', 1.1, 'percentage', NULL, '#F59E0B'),
('Zona Este', 'Área este de la ciudad - $20 recargo fijo', 1.0, 'fixed', 20.00, '#EF4444'),
('Zona Oeste', 'Área oeste de la ciudad - $35 recargo fijo', 1.0, 'fixed', 35.00, '#8B5CF6');
