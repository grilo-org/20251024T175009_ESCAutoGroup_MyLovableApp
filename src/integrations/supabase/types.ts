export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      aging_wip: {
        Row: {
          aging_bucket: string
          created_date: string
          custom_label: string | null
          customer_name: string
          days_since_created: number
          deposit_amount: number | null
          id: string
          label: string | null
          labor_sales: number
          parts_sales: number
          repair_order_id: string
          repair_order_number: string
          service_writer_id: string | null
          shop_id: string
          shop_name: string
          status: string
          sublet_sales: number
          synced_at: string
          technician_id: string | null
          total_sales: number
          vehicle_info: string
        }
        Insert: {
          aging_bucket: string
          created_date: string
          custom_label?: string | null
          customer_name: string
          days_since_created: number
          deposit_amount?: number | null
          id?: string
          label?: string | null
          labor_sales?: number
          parts_sales?: number
          repair_order_id: string
          repair_order_number: string
          service_writer_id?: string | null
          shop_id: string
          shop_name: string
          status: string
          sublet_sales?: number
          synced_at?: string
          technician_id?: string | null
          total_sales?: number
          vehicle_info: string
        }
        Update: {
          aging_bucket?: string
          created_date?: string
          custom_label?: string | null
          customer_name?: string
          days_since_created?: number
          deposit_amount?: number | null
          id?: string
          label?: string | null
          labor_sales?: number
          parts_sales?: number
          repair_order_id?: string
          repair_order_number?: string
          service_writer_id?: string | null
          shop_id?: string
          shop_name?: string
          status?: string
          sublet_sales?: number
          synced_at?: string
          technician_id?: string | null
          total_sales?: number
          vehicle_info?: string
        }
        Relationships: []
      }
      historical_performance: {
        Row: {
          avg_ro: number
          car_count: number
          created_at: string
          id: string
          labor_avg_hour: number
          labor_gross: number
          labor_hours: number
          labor_margin: number
          labor_profit: number
          month: number
          parts_avg_ticket: number
          parts_gross: number
          parts_margin: number
          parts_pieces_sold: number
          parts_profit: number
          period: string
          shop_id: string
          shop_name: string
          sublet_gross: number
          sublet_margin: number
          sublet_profit: number
          total_gross: number
          total_margin: number
          total_profit: number
          updated_at: string
          year: number
        }
        Insert: {
          avg_ro?: number
          car_count?: number
          created_at?: string
          id?: string
          labor_avg_hour?: number
          labor_gross?: number
          labor_hours?: number
          labor_margin?: number
          labor_profit?: number
          month: number
          parts_avg_ticket?: number
          parts_gross?: number
          parts_margin?: number
          parts_pieces_sold?: number
          parts_profit?: number
          period: string
          shop_id: string
          shop_name: string
          sublet_gross?: number
          sublet_margin?: number
          sublet_profit?: number
          total_gross?: number
          total_margin?: number
          total_profit?: number
          updated_at?: string
          year: number
        }
        Update: {
          avg_ro?: number
          car_count?: number
          created_at?: string
          id?: string
          labor_avg_hour?: number
          labor_gross?: number
          labor_hours?: number
          labor_margin?: number
          labor_profit?: number
          month?: number
          parts_avg_ticket?: number
          parts_gross?: number
          parts_margin?: number
          parts_pieces_sold?: number
          parts_profit?: number
          period?: string
          shop_id?: string
          shop_name?: string
          sublet_gross?: number
          sublet_margin?: number
          sublet_profit?: number
          total_gross?: number
          total_margin?: number
          total_profit?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tekmetric_cache: {
        Row: {
          cached_at: string
          data: Json
          endpoint: string
          expires_at: string
          id: string
        }
        Insert: {
          cached_at?: string
          data: Json
          endpoint: string
          expires_at: string
          id?: string
        }
        Update: {
          cached_at?: string
          data?: Json
          endpoint?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      tekmetric_sync_logs: {
        Row: {
          error_count: number | null
          errors: Json | null
          id: string
          status: string
          success_count: number | null
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          error_count?: number | null
          errors?: Json | null
          id?: string
          status?: string
          success_count?: number | null
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          error_count?: number | null
          errors?: Json | null
          id?: string
          status?: string
          success_count?: number | null
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: []
      }
      tekmetric_tokens: {
        Row: {
          access_count: number | null
          access_token: string
          expires_at: string
          id: number
          last_accessed_at: string | null
          last_accessed_by: string | null
          max_access_count: number | null
          rotation_required: boolean | null
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          access_token: string
          expires_at: string
          id?: number
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          max_access_count?: number | null
          rotation_required?: boolean | null
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          access_token?: string
          expires_at?: string
          id?: number
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          max_access_count?: number | null
          rotation_required?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      token_audit_log: {
        Row: {
          accessed_at: string
          accessed_by: string
          action: string
          error_message: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          token_id: number
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by: string
          action: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token_id: number
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string
          action?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token_id?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      user_shop_access: {
        Row: {
          created_at: string
          id: string
          role: string | null
          shop_id: string
          shop_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          shop_id: string
          shop_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          shop_id?: string
          shop_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_token_access: {
        Args: {
          p_accessed_by: string
          p_action: string
          p_error_message?: string
          p_success?: boolean
          p_token_id: number
        }
        Returns: undefined
      }
      mark_token_for_rotation: {
        Args: { p_token_id: number }
        Returns: undefined
      }
      token_needs_rotation: {
        Args: { p_token_id: number }
        Returns: boolean
      }
      user_has_shop_access: {
        Args: { target_shop_id: string; user_id: string }
        Returns: boolean
      }
      validate_aging_wip_access: {
        Args: { p_shop_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
