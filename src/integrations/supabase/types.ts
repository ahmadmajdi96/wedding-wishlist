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
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          event_date: string
          id: string
          notes: string | null
          package_id: string | null
          payment_status: string
          status: string
          total: number
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_status?: string
          status?: string
          total: number
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_status?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vendor_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name_ar: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name_ar: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name_ar?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      home_features: {
        Row: {
          icon: string
          id: string
          is_visible: boolean
          label: string
          sort_order: number
        }
        Insert: {
          icon?: string
          id?: string
          is_visible?: boolean
          label: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          is_visible?: boolean
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          body: string
          cta_label: string
          cta_slug: string
          id: string
          image_url: string
          is_visible: boolean
          key: string
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          body?: string
          cta_label?: string
          cta_slug?: string
          id?: string
          image_url?: string
          is_visible?: boolean
          key: string
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Update: {
          body?: string
          cta_label?: string
          cta_slug?: string
          id?: string
          image_url?: string
          is_visible?: boolean
          key?: string
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      home_slides: {
        Row: {
          created_at: string
          cta_label: string
          cta_slug: string
          id: string
          image_url: string
          is_visible: boolean
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          created_at?: string
          cta_label?: string
          cta_slug?: string
          id?: string
          image_url: string
          is_visible?: boolean
          sort_order?: number
          subtitle?: string
          title: string
        }
        Update: {
          created_at?: string
          cta_label?: string
          cta_slug?: string
          id?: string
          image_url?: string
          is_visible?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          style_preferences: string[]
          updated_at: string
          wedding_date: string | null
        }
        Insert: {
          avatar_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          style_preferences?: string[]
          updated_at?: string
          wedding_date?: string | null
        }
        Update: {
          avatar_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          style_preferences?: string[]
          updated_at?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          rating: number
          user_id: string
          vendor_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          user_id: string
          vendor_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string
          created_at: string
          id: string
          is_visible: boolean
          name: string
          quote: string
          rating: number
          sort_order: number
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          name: string
          quote?: string
          rating?: number
          sort_order?: number
        }
        Update: {
          avatar_url?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          name?: string
          quote?: string
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_images: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          url: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          url: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          url?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_packages: {
        Row: {
          id: string
          includes: string
          name: string
          price: number
          sort_order: number
          vendor_id: string
        }
        Insert: {
          id?: string
          includes?: string
          name: string
          price: number
          sort_order?: number
          vendor_id: string
        }
        Update: {
          id?: string
          includes?: string
          name?: string
          price?: number
          sort_order?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          area_m2: number | null
          capacity: number | null
          category_id: string
          city: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          is_featured: boolean
          is_verified: boolean
          name: string
          parking: number | null
          phone: string | null
          price_from: number
          rating: number
          reviews_count: number
          updated_at: string
          views_count: number
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          capacity?: number | null
          category_id: string
          city: string
          created_at?: string
          description?: string
          id?: string
          image_url: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          name: string
          parking?: number | null
          phone?: string | null
          price_from: number
          rating?: number
          reviews_count?: number
          updated_at?: string
          views_count?: number
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          capacity?: number | null
          category_id?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          name?: string
          parking?: number | null
          phone?: string | null
          price_from?: number
          rating?: number
          reviews_count?: number
          updated_at?: string
          views_count?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_tasks: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          status?: string
          title?: string
          user_id?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
