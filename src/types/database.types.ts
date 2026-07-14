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
      aliases: {
        Row: {
          alias: string
          alias_index: number
          created_at: string
          evento_id: string
          id: string
          universo: string
          usuario_id: string
        }
        Insert: {
          alias: string
          alias_index: number
          created_at?: string
          evento_id: string
          id?: string
          universo: string
          usuario_id: string
        }
        Update: {
          alias?: string
          alias_index?: number
          created_at?: string
          evento_id?: string
          id?: string
          universo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aliases_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aliases_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaciones: {
        Row: {
          comprado_at: string | null
          comprador_id: string
          created_at: string | null
          estado: string
          evento_id: string
          id: string
          nota_comprador: string | null
          receptor_id: string
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
          receptor_id: string
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
          receptor_id?: string
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
          {
            foreignKeyName: "asignaciones_receptor_id_fkey"
            columns: ["receptor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      estado_regalos: {
        Row: {
          comprador_original_id: string
          dueno_actual_id: string
          evento_id: string
          id: string
          regalo_numero: number
          updated_at: string
        }
        Insert: {
          comprador_original_id: string
          dueno_actual_id: string
          evento_id: string
          id?: string
          regalo_numero: number
          updated_at?: string
        }
        Update: {
          comprador_original_id?: string
          dueno_actual_id?: string
          evento_id?: string
          id?: string
          regalo_numero?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estado_regalos_comprador_original_id_fkey"
            columns: ["comprador_original_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estado_regalos_dueno_actual_id_fkey"
            columns: ["dueno_actual_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estado_regalos_evento_id_fkey"
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
          descripcion: string | null
          emoji: string | null
          estado: string
          fecha_compra: string
          fecha_intercambio: string
          id: string
          juego_iniciado_at: string | null
          modo: string
          nombre: string
          presupuesto_moneda: string
          presupuesto_monto: number
          recomendacion: string | null
          requisitos: string | null
          restricciones: string | null
          sorteo_realizado_at: string | null
          status: string
          tematica: string | null
          turno_actual: number
          universo: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          codigo_acceso: string
          created_at?: string | null
          descripcion?: string | null
          emoji?: string | null
          estado?: string
          fecha_compra: string
          fecha_intercambio: string
          id?: string
          juego_iniciado_at?: string | null
          modo?: string
          nombre: string
          presupuesto_moneda: string
          presupuesto_monto: number
          recomendacion?: string | null
          requisitos?: string | null
          restricciones?: string | null
          sorteo_realizado_at?: string | null
          status?: string
          tematica?: string | null
          turno_actual?: number
          universo?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          codigo_acceso?: string
          created_at?: string | null
          descripcion?: string | null
          emoji?: string | null
          estado?: string
          fecha_compra?: string
          fecha_intercambio?: string
          id?: string
          juego_iniciado_at?: string | null
          modo?: string
          nombre?: string
          presupuesto_moneda?: string
          presupuesto_monto?: number
          recomendacion?: string | null
          requisitos?: string | null
          restricciones?: string | null
          sorteo_realizado_at?: string | null
          status?: string
          tematica?: string | null
          turno_actual?: number
          universo?: string | null
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
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          deseos?: string[]
          evento_id: string
          restricciones?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          deseos?: string[]
          evento_id?: string
          restricciones?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferencias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      regalo_robado_compras: {
        Row: {
          comprado_at: string | null
          created_at: string
          estado: string
          evento_id: string
          id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          comprado_at?: string | null
          created_at?: string
          estado?: string
          evento_id: string
          id?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          comprado_at?: string | null
          created_at?: string
          estado?: string
          evento_id?: string
          id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regalo_robado_compras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regalo_robado_compras_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      regalo_robado_turnos: {
        Row: {
          created_at: string
          evento_id: string
          id: string
          orden: number
          usuario_id: string
        }
        Insert: {
          created_at?: string
          evento_id: string
          id?: string
          orden: number
          usuario_id: string
        }
        Update: {
          created_at?: string
          evento_id?: string
          id?: string
          orden?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regalo_robado_turnos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regalo_robado_turnos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos_ruleta: {
        Row: {
          accion: string
          created_at: string
          detalles: Json
          evento_id: string
          id: string
          numero_ruleta: number
          numero_turno: number
          participante_id: string
        }
        Insert: {
          accion: string
          created_at?: string
          detalles?: Json
          evento_id: string
          id?: string
          numero_ruleta: number
          numero_turno: number
          participante_id: string
        }
        Update: {
          accion?: string
          created_at?: string
          detalles?: Json
          evento_id?: string
          id?: string
          numero_ruleta?: number
          numero_turno?: number
          participante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_ruleta_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_ruleta_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          apodo: string | null
          created_at: string | null
          descripcion: string | null
          email: string
          id: string
          nombre: string
          perfil_completo: Json
          updated_at: string | null
        }
        Insert: {
          apodo?: string | null
          created_at?: string | null
          descripcion?: string | null
          email: string
          id: string
          nombre: string
          perfil_completo?: Json
          updated_at?: string | null
        }
        Update: {
          apodo?: string | null
          created_at?: string | null
          descripcion?: string | null
          email?: string
          id?: string
          nombre?: string
          perfil_completo?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activar_intercambio_regalo_robado: {
        Args: { p_evento_id: string }
        Returns: {
          admin_id: string
          codigo_acceso: string
          created_at: string | null
          descripcion: string | null
          emoji: string | null
          estado: string
          fecha_compra: string
          fecha_intercambio: string
          id: string
          juego_iniciado_at: string | null
          modo: string
          nombre: string
          presupuesto_moneda: string
          presupuesto_monto: number
          recomendacion: string | null
          requisitos: string | null
          restricciones: string | null
          sorteo_realizado_at: string | null
          status: string
          tematica: string | null
          turno_actual: number
          universo: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "eventos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      actualizar_mi_estado_compra: {
        Args: { p_estado: string; p_evento_id: string }
        Returns: {
          comprado_at: string | null
          comprador_id: string
          created_at: string | null
          estado: string
          evento_id: string
          id: string
          nota_comprador: string | null
          receptor_id: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "asignaciones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      actualizar_mi_estado_compra_regalo_robado: {
        Args: { p_estado: string; p_evento_id: string }
        Returns: {
          comprado_at: string | null
          created_at: string
          estado: string
          evento_id: string
          id: string
          updated_at: string
          usuario_id: string
        }
        SetofOptions: {
          from: "*"
          to: "regalo_robado_compras"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crear_evento_con_admin: {
        Args: {
          p_codigo_acceso: string
          p_descripcion?: string
          p_emoji?: string
          p_fecha_compra: string
          p_fecha_intercambio: string
          p_modo?: string
          p_nombre: string
          p_presupuesto_moneda: string
          p_presupuesto_monto: number
          p_recomendacion?: string
          p_requisitos?: string
          p_restricciones?: string
          p_tematica?: string
          p_universo?: string
        }
        Returns: {
          admin_id: string
          codigo_acceso: string
          created_at: string | null
          descripcion: string | null
          emoji: string | null
          estado: string
          fecha_compra: string
          fecha_intercambio: string
          id: string
          juego_iniciado_at: string | null
          modo: string
          nombre: string
          presupuesto_moneda: string
          presupuesto_monto: number
          recomendacion: string | null
          requisitos: string | null
          restricciones: string | null
          sorteo_realizado_at: string | null
          status: string
          tematica: string | null
          turno_actual: number
          universo: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "eventos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_event_preview_by_code: {
        Args: { p_codigo: string }
        Returns: {
          estado: string
          fecha_compra: string
          fecha_intercambio: string
          id: string
          modo: string
          nombre: string
          participantes_count: number
          presupuesto_moneda: string
          presupuesto_monto: number
          sorteo_realizado_at: string
          universo: string
        }[]
      }
      girar_ruleta: {
        Args: { p_evento_id: string }
        Returns: {
          numero_ruleta: number
          numero_turno: number
        }[]
      }
      iniciar_juego_regalo_robado: {
        Args: { p_evento_id: string }
        Returns: undefined
      }
      is_event_member: { Args: { p_evento_id: string }; Returns: boolean }
      join_event_by_code: { Args: { p_codigo: string }; Returns: string }
      listar_estado_compras: {
        Args: { p_evento_id: string }
        Returns: {
          comprado_at: string
          comprador_id: string
          comprador_nombre: string
          estado: string
          id: string
        }[]
      }
      listar_estado_compras_regalo_robado: {
        Args: { p_evento_id: string }
        Returns: {
          comprado_at: string
          created_at: string
          estado: string
          evento_id: string
          id: string
          updated_at: string
          usuario_id: string
          usuario_nombre: string
        }[]
      }
      listar_participantes_convencional: {
        Args: { p_evento_id: string }
        Returns: {
          created_at: string
          estado: string
          evento_id: string
          id: string
          rol: string
          usuario_id: string
          usuario_nombre: string
        }[]
      }
      listar_participantes_ultra_secreto: {
        Args: { p_evento_id: string }
        Returns: {
          alias: string
          created_at: string
          estado: string
          evento_id: string
          id: string
          rol: string
          usuario_id: string
        }[]
      }
      obtener_orden_turnos_regalo_robado: {
        Args: { p_evento_id: string }
        Returns: {
          created_at: string
          evento_id: string
          id: string
          orden: number
          usuario_id: string
          usuario_nombre: string
        }[]
      }
      obtener_perfil_destino: {
        Args: { p_evento_id: string; p_usuario_id: string }
        Returns: {
          apodo: string
          descripcion: string
          nombre: string
          perfil_completo: Json
        }[]
      }
      realizar_sorteo: { Args: { p_evento_id: string }; Returns: undefined }
      realizar_sorteo_ultra_secreto: {
        Args: { p_aliases: string[]; p_evento_id: string }
        Returns: undefined
      }
      resolver_turno_ruleta: {
        Args: {
          p_evento_id: string
          p_numero_turno: number
          p_objetivo_ids?: string[]
        }
        Returns: {
          accion: string
          created_at: string
          detalles: Json
          evento_id: string
          id: string
          numero_ruleta: number
          numero_turno: number
          participante_id: string
        }
        SetofOptions: {
          from: "*"
          to: "turnos_ruleta"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
