-- Actualizar estructura de base de datos según la arquitectura recomendada

-- Tabla de handymen (técnicos/profesionales)
CREATE TABLE IF NOT EXISTS public.handymen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialties TEXT[], -- Array de especialidades
  is_active BOOLEAN DEFAULT true,
  availability_calendar_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de slots de disponibilidad
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handyman_id UUID REFERENCES public.handymen(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de clientes (mejorada)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  gateway TEXT, -- stripe, paypal, bank_transfer, cash
  payment_type TEXT DEFAULT 'full', -- reservation, full, balance
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de plantillas de email
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_plain TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de logs de email
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'sent', -- sent, failed, pending
  error_message TEXT
);

-- Tabla de historial de reservas
CREATE TABLE IF NOT EXISTS public.booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  status_change TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Actualizar tabla de servicios para incluir handymen
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS is_reservable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reservation_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS handyman_ids UUID[] DEFAULT '{}';

-- Actualizar tabla de bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS handyman_id UUID REFERENCES public.handymen(id),
ADD COLUMN IF NOT EXISTS customer_geolocation POINT,
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS reservation_price_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'pending_confirmation',
ADD COLUMN IF NOT EXISTS booked_date DATE,
ADD COLUMN IF NOT EXISTS booked_time TIME;

-- Insertar plantillas de email por defecto
INSERT INTO public.email_templates (name, subject, body_html, body_plain) VALUES
('booking_confirmation', 'Confirmación de Reserva', 
 '<h1>Reserva Confirmada</h1><p>Su reserva ha sido confirmada exitosamente.</p>', 
 'Reserva Confirmada - Su reserva ha sido confirmada exitosamente.'),
('payment_received', 'Pago Recibido', 
 '<h1>Pago Confirmado</h1><p>Hemos recibido su pago correctamente.</p>', 
 'Pago Confirmado - Hemos recibido su pago correctamente.'),
('visit_scheduled', 'Visita Programada', 
 '<h1>Visita Programada</h1><p>Su visita ha sido programada.</p>', 
 'Visita Programada - Su visita ha sido programada.'),
('service_completed', 'Servicio Completado', 
 '<h1>Servicio Completado</h1><p>Su servicio ha sido completado exitosamente.</p>', 
 'Servicio Completado - Su servicio ha sido completado exitosamente.')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE public.handymen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;

-- Políticas para handymen
CREATE POLICY "Admins can manage handymen" ON public.handymen FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Handymen can view their own data" ON public.handymen FOR SELECT USING (auth.uid() = user_id);

-- Políticas para availability_slots
CREATE POLICY "Admins can manage availability slots" ON public.availability_slots FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view available slots" ON public.availability_slots FOR SELECT USING (true);

-- Políticas para customers
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their own customer data" ON public.customers FOR SELECT USING (auth.uid() = user_id);

-- Políticas para payments
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their booking payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- Políticas para email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active templates" ON public.email_templates FOR SELECT USING (is_active = true);

-- Políticas para email_logs
CREATE POLICY "Admins can view email logs" ON public.email_logs FOR SELECT USING (is_admin(auth.uid()));

-- Políticas para booking_history
CREATE POLICY "Admins can manage booking history" ON public.booking_history FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their booking history" ON public.booking_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);