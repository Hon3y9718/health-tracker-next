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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_links: {
        Row: {
          collaborator_id: string
          created_at: string
          id: string
          owner_id: string
        }
        Insert: {
          collaborator_id: string
          created_at?: string
          id?: string
          owner_id: string
        }
        Update: {
          collaborator_id?: string
          created_at?: string
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      drinks: {
        Row: {
          amount_l: number
          created_at: string
          drink_type: string
          drunk_at: string
          entry_label: string | null
          id: string
          log_date: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_l: number
          created_at?: string
          drink_type?: string
          drunk_at?: string
          entry_label?: string | null
          id?: string
          log_date: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_l?: number
          created_at?: string
          drink_type?: string
          drunk_at?: string
          entry_label?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          duration_minutes: number | null
          exercise_type: string
          id: string
          log_date: string
          logged_at: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          exercise_type: string
          id?: string
          log_date: string
          logged_at?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          exercise_type?: string
          id?: string
          log_date?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number
          carbs_g: number | null
          created_at: string
          eaten_at: string
          fat_g: number | null
          fiber_g: number | null
          id: string
          image_path: string | null
          log_date: string
          meal_label: string | null
          notes: string | null
          protein_g: number | null
          title: string | null
          user_id: string
        }
        Insert: {
          calories: number
          carbs_g?: number | null
          created_at?: string
          eaten_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          image_path?: string | null
          log_date: string
          meal_label?: string | null
          notes?: string | null
          protein_g?: number | null
          title?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number | null
          created_at?: string
          eaten_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          id?: string
          image_path?: string | null
          log_date?: string
          meal_label?: string | null
          notes?: string | null
          protein_g?: number | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          calorie_target: number
          created_at: string
          daily_insight_date: string | null
          daily_insight_text: string | null
          fiber_target_g: number
          goal_weight_high_kg: number
          goal_weight_low_kg: number
          height_cm: number | null
          protein_target_g: number
          starting_weight_kg: number
          timezone: string
          updated_at: string
          user_id: string
          water_target_l: number
        }
        Insert: {
          calorie_target?: number
          created_at?: string
          daily_insight_date?: string | null
          daily_insight_text?: string | null
          fiber_target_g?: number
          goal_weight_high_kg?: number
          goal_weight_low_kg?: number
          height_cm?: number | null
          protein_target_g?: number
          starting_weight_kg?: number
          timezone?: string
          updated_at?: string
          user_id: string
          water_target_l?: number
        }
        Update: {
          calorie_target?: number
          created_at?: string
          daily_insight_date?: string | null
          daily_insight_text?: string | null
          fiber_target_g?: number
          goal_weight_high_kg?: number
          goal_weight_low_kg?: number
          height_cm?: number | null
          protein_target_g?: number
          starting_weight_kg?: number
          timezone?: string
          updated_at?: string
          user_id?: string
          water_target_l?: number
        }
        Relationships: []
      }
      weigh_in_images: {
        Row: {
          created_at: string
          id: string
          image_path: string
          label: string | null
          user_id: string
          weigh_in_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          label?: string | null
          user_id: string
          weigh_in_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          label?: string | null
          user_id?: string
          weigh_in_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weigh_in_images_weigh_in_id_fkey"
            columns: ["weigh_in_id"]
            isOneToOne: false
            referencedRelation: "weigh_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      weigh_ins: {
        Row: {
          created_at: string
          entry_label: string | null
          id: string
          log_date: string
          notes: string | null
          user_id: string
          weighed_at: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          entry_label?: string | null
          id?: string
          log_date: string
          notes?: string | null
          user_id: string
          weighed_at?: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          entry_label?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          user_id?: string
          weighed_at?: string
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      daily_totals: {
        Row: {
          calorie_status: string | null
          calorie_target: number | null
          calorie_variance: number | null
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          fiber_status: string | null
          fiber_target_g: number | null
          log_date: string | null
          meals_logged: number | null
          protein_g: number | null
          protein_status: string | null
          protein_target_g: number | null
          user_id: string | null
          water_l: number | null
          water_status: string | null
          water_target_l: number | null
        }
        Relationships: []
      }
      exercise_days: {
        Row: {
          exercise_types: string[] | null
          log_date: string | null
          session_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      monthly_totals: {
        Row: {
          avg_calories: number | null
          avg_fiber_g: number | null
          avg_protein_g: number | null
          avg_water_l: number | null
          calorie_status: string | null
          calorie_target: number | null
          days_logged: number | null
          month_start: string | null
          protein_status: string | null
          protein_target_g: number | null
          total_calories: number | null
          total_protein_g: number | null
          user_id: string | null
          water_status: string | null
          water_target_l: number | null
        }
        Relationships: []
      }
      weekly_totals: {
        Row: {
          avg_calories: number | null
          avg_fiber_g: number | null
          avg_protein_g: number | null
          avg_water_l: number | null
          calorie_status: string | null
          calorie_target: number | null
          days_logged: number | null
          protein_status: string | null
          protein_target_g: number | null
          total_calories: number | null
          total_protein_g: number | null
          user_id: string | null
          water_status: string | null
          water_target_l: number | null
          week_start: string | null
        }
        Relationships: []
      }
      weight_progress: {
        Row: {
          bmi: number | null
          goal_weight_high_kg: number | null
          goal_weight_low_kg: number | null
          goal_weight_mid_kg: number | null
          log_date: string | null
          lost_kg: number | null
          progress_pct: number | null
          rolling_7d_avg: number | null
          starting_weight_kg: number | null
          to_goal_kg: number | null
          user_id: string | null
          weight_kg: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_user_id_by_email: { Args: { lookup_email: string }; Returns: string }
      has_account_access: { Args: { target_user_id: string }; Returns: boolean }
      list_accounts_shared_with_me: {
        Args: never
        Returns: {
          created_at: string
          link_id: string
          owner_email: string
          owner_id: string
        }[]
      }
      list_my_collaborators: {
        Args: never
        Returns: {
          collaborator_email: string
          collaborator_id: string
          created_at: string
          link_id: string
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
