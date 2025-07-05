export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_configs: {
        Row: {
          api_key: string | null
          config_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          handyman_id: string | null
          id: string
          is_booked: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          handyman_id?: string | null
          id?: string
          is_booked?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          handyman_id?: string | null
          id?: string
          is_booked?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_handyman_id_fkey"
            columns: ["handyman_id"]
            isOneToOne: false
            referencedRelation: "handymen"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_history: {
        Row: {
          booking_id: string | null
          changed_by_user_id: string | null
          id: string
          notes: string | null
          status_change: string
          timestamp: string | null
        }
        Insert: {
          booking_id?: string | null
          changed_by_user_id?: string | null
          id?: string
          notes?: string | null
          status_change: string
          timestamp?: string | null
        }
        Update: {
          booking_id?: string | null
          changed_by_user_id?: string | null
          id?: string
          notes?: string | null
          status_change?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string | null
          booked_date: string | null
          booked_time: string | null
          booking_status: string | null
          created_at: string | null
          customer_email: string
          customer_geolocation: unknown | null
          customer_name: string
          customer_phone: string | null
          final_price: number | null
          handyman_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          requires_call: boolean | null
          reservation_price_paid: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          booked_date?: string | null
          booked_time?: string | null
          booking_status?: string | null
          created_at?: string | null
          customer_email: string
          customer_geolocation?: unknown | null
          customer_name: string
          customer_phone?: string | null
          final_price?: number | null
          handyman_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          requires_call?: boolean | null
          reservation_price_paid?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          booked_date?: string | null
          booked_time?: string | null
          booking_status?: string | null
          created_at?: string | null
          customer_email?: string
          customer_geolocation?: unknown | null
          customer_name?: string
          customer_phone?: string | null
          final_price?: number | null
          handyman_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          requires_call?: boolean | null
          reservation_price_paid?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_handyman_id_fkey"
            columns: ["handyman_id"]
            isOneToOne: false
            referencedRelation: "handymen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          booking_id: string | null
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          booking_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          booking_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string | null
          body_plain: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_plain?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_plain?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      general_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      handymen: {
        Row: {
          availability_calendar_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          client_id: string | null
          client_secret: string | null
          config_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          public_key: string | null
          secret_key: string | null
          type: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          client_id?: string | null
          client_secret?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          public_key?: string | null
          secret_key?: string | null
          type: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          client_id?: string | null
          client_secret?: string | null
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          public_key?: string | null
          secret_key?: string | null
          type?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          gateway: string | null
          id: string
          payment_type: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          id?: string
          payment_type?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          id?: string
          payment_type?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_zone_prices: {
        Row: {
          created_at: string | null
          custom_price: number
          id: string
          is_active: boolean | null
          service_id: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_price: number
          id?: string
          is_active?: boolean | null
          service_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_price?: number
          id?: string
          is_active?: boolean | null
          service_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_zone_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_zone_prices_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          deposit_amount: number | null
          deposit_type: string | null
          description: string | null
          duration_minutes: number | null
          handyman_ids: string[] | null
          id: string
          is_active: boolean | null
          is_reservable: boolean | null
          name: string
          reservation_price: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_type?: string | null
          description?: string | null
          duration_minutes?: number | null
          handyman_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          is_reservable?: boolean | null
          name: string
          reservation_price?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_type?: string | null
          description?: string | null
          duration_minutes?: number | null
          handyman_ids?: string[] | null
          id?: string
          is_active?: boolean | null
          is_reservable?: boolean | null
          name?: string
          reservation_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          color: string | null
          coordinates: Json | null
          created_at: string | null
          description: string | null
          fixed_price: number | null
          id: string
          is_active: boolean | null
          multiplier: number | null
          name: string
          pricing_type: string | null
          radius_meters: number | null
          updated_at: string | null
          zone_type: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          color?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_price?: number | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name: string
          pricing_type?: string | null
          radius_meters?: number | null
          updated_at?: string | null
          zone_type?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          color?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_price?: number | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name?: string
          pricing_type?: string | null
          radius_meters?: number | null
          updated_at?: string | null
          zone_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "root_admin"
        | "company_admin"
        | "manager"
        | "client"
        | "assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "root_admin",
        "company_admin",
        "manager",
        "client",
        "assistant",
      ],
    },
  },
} as const
