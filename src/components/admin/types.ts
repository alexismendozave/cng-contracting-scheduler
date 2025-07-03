
export interface Zone {
  id: string;
  name: string;
  multiplier: number | null;
  description: string | null;
  color: string | null;
  coordinates: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pricing_type: string | null;
  fixed_price: number | null;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string;
  duration_minutes: number;
  is_active: boolean;
  deposit_type: string;
  deposit_amount: number;
}

export interface ServiceZonePrice {
  id: string;
  service_id: string;
  zone_id: string;
  custom_price: number;
  is_active: boolean;
}

export interface ApiConfig {
  id: string;
  name: string;
  api_key: string;
  config_data: any;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  config_data: any;
  is_active: boolean;
  public_key: string | null;
  secret_key: string | null;
  webhook_url: string | null;
  client_id: string | null;
  client_secret: string | null;
}
