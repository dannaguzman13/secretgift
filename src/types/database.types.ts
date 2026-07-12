export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asignaciones: {
        Row: {
          comprado_at: string | null
          comprador_id: string
          created_at: string | null
          estado: string
          evento_id: string
          id: string
          nota_comprador: string | null
          updated_at: string | null
        }
        Insert: {
          comprado_at?: string | null
          comprador_id: string
          created_at?: string | null
          estado?: string
          evento_id: string
          id?: string
          nota_comprador?: string | null
          updated_at?: string | null
        }
        Update: {
          comprado_at?: string | null
          comprador_id?: string
          created_at?: string | null
          estado?: string
          evento_id?: string
          id?: string
          nota_comprador?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignaciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          admin_id: string
          codigo_acceso: string
          created_at: string | null
          estado: string
          fecha_compra: string
          fecha_revelacion: string
          id: string
          nombre: string
          presupuesto: number
          receptor_email: string
          receptor_id: string | null
          receptor_nombre: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          codigo_acceso: string
          created_at?: string | null
          estado?: string
          fecha_compra: string
          fecha_revelacion: string
          id?: string
          nombre: string
          presupuesto: number
          receptor_email: string
          receptor_id?: string | null
          receptor_nombre: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          codigo_acceso?: string
          created_at?: string | null
          estado?: string
          fecha_compra?: string
          fecha_revelacion?: string
          id?: string
          nombre?: string
          presupuesto?: number
          receptor_email?: string
          receptor_id?: string | null
          receptor_nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_receptor_id_fkey"
            columns: ["receptor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_receptor_tokens: {
        Row: {
          created_at: string | null
          evento_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          evento_id: string
          token?: string
        }
        Update: {
          created_at?: string | null
          evento_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_receptor_tokens_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: true
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes: {
        Row: {
          created_at: string | null
          estado: string
          evento_id: string
          id: string
          rol: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: string
          evento_id: string
          id?: string
          rol: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          estado?: string
          evento_id?: string
          id?: string
          rol?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias: {
        Row: {
          created_at: string | null
          deseos: string[]
          evento_id: string
          restricciones: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deseos?: string[]
          evento_id: string
          restricciones?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deseos?: string[]
          evento_id?: string
          restricciones?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: true
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_receptor: { Args: { p_token: string }; Returns: string }
      get_event_preview_by_code: {
        Args: { p_codigo: string }
        Returns: {
          estado: string
          fecha_compra: string
          id: string
          nombre: string
          presupuesto: number
        }[]
      }
      get_event_preview_by_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          nombre: string
          presupuesto: number
          receptor_nombre: string
        }[]
      }
      is_event_member: { Args: { p_evento_id: string }; Returns: boolean }
      join_event_by_code: { Args: { p_codigo: string }; Returns: string }
      shares_event_with: { Args: { p_usuario_id: string }; Returns: boolean }
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
