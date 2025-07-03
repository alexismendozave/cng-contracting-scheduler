
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('root_admin', 'company_admin', 'manager', 'client', 'assistant');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create zones table
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  color TEXT DEFAULT '#3B82F6',
  coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create API configurations table
CREATE TABLE public.api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  config_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stripe', 'paypal', 'bank_transfer', 'custom'
  config_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  zone_id UUID REFERENCES public.zones(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  scheduled_date DATE,
  scheduled_time TIME,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  requires_call BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role AND is_active = true
  )
$$;

-- Create function to check if user is admin (root_admin or company_admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id 
    AND role IN ('root_admin', 'company_admin') 
    AND is_active = true
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for zones
CREATE POLICY "Anyone can view active zones" ON public.zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage zones" ON public.zones
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for API configs
CREATE POLICY "Only admins can manage API configs" ON public.api_configs
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for payment methods
CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'client'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin user (you'll need to create this user through Supabase auth first)
-- This is just a placeholder - you'll need to update with actual user ID after creating the admin account
INSERT INTO public.api_configs (name, api_key, config_data) VALUES 
('mapbox', '', '{"description": "Mapbox API for maps and geocoding"}'),
('stripe', '', '{"description": "Stripe payment processing"}'),
('paypal', '', '{"description": "PayPal payment processing"}');

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, config_data) VALUES 
('Stripe', 'stripe', '{"currencies": ["USD", "EUR"]}'),
('PayPal', 'paypal', '{"currencies": ["USD", "EUR"]}'),
('Transferencia Bancaria', 'bank_transfer', '{"manual": true}'),
('Pago en Efectivo', 'custom', '{"manual": true, "description": "Pago en efectivo al momento del servicio"}');
