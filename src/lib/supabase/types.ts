export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      availability_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          event_type_id: string | null
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_schedules_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          created_at: string | null
          end_time: string
          event_type_id: string | null
          id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          event_type_id?: string | null
          id?: string
          reason?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          event_type_id?: string | null
          id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_attendees: {
        Row: {
          booking_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_attendees_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          deposit_cents: number | null
          end_time: string
          event_slot_id: string | null
          event_type_id: string | null
          id: string
          location_address: string | null
          meeting_id: string | null
          meeting_url: string | null
          payment_status: string | null
          start_time: string
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          timezone: string | null
          total_price_cents: number | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          deposit_cents?: number | null
          end_time: string
          event_slot_id?: string | null
          event_type_id?: string | null
          id?: string
          location_address?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          payment_status?: string | null
          start_time: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          timezone?: string | null
          total_price_cents?: number | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          deposit_cents?: number | null
          end_time?: string
          event_slot_id?: string | null
          event_type_id?: string | null
          id?: string
          location_address?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          payment_status?: string | null
          start_time?: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          timezone?: string | null
          total_price_cents?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_slot_id_fkey"
            columns: ["event_slot_id"]
            isOneToOne: false
            referencedRelation: "event_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          id: string
          booking_id: string | null
          workflow_id: string | null
          recipient_email: string
          email_subject: string
          status: string
          resend_message_id: string | null
          error_message: string | null
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          booking_id?: string | null
          workflow_id?: string | null
          recipient_email: string
          email_subject: string
          status: string
          resend_message_id?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string | null
          workflow_id?: string | null
          recipient_email?: string
          email_subject?: string
          status?: string
          resend_message_id?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string | null
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
            foreignKeyName: "email_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "email_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      email_workflows: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          event_type_id: string | null
          trigger_type: string
          trigger_offset_minutes: number | null
          email_subject: string
          email_template: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          event_type_id?: string | null
          trigger_type: string
          trigger_offset_minutes?: number | null
          email_subject: string
          email_template: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          event_type_id?: string | null
          trigger_type?: string
          trigger_offset_minutes?: number | null
          email_subject?: string
          email_template?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_workflows_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_slots: {
        Row: {
          created_at: string | null
          end_time: string
          event_type_id: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          max_attendees: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          max_attendees?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          max_attendees?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_slots_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          buffer_after_minutes: number | null
          buffer_before_minutes: number | null
          created_at: string | null
          deposit_percent: number | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          location_address: string | null
          location_type: string
          max_attendees: number | null
          price_cents: number | null
          requires_approval: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          buffer_after_minutes?: number | null
          buffer_before_minutes?: number | null
          created_at?: string | null
          deposit_percent?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_type: string
          max_attendees?: number | null
          price_cents?: number | null
          requires_approval?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          buffer_after_minutes?: number | null
          buffer_before_minutes?: number | null
          created_at?: string | null
          deposit_percent?: number | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_type?: string
          max_attendees?: number | null
          price_cents?: number | null
          requires_approval?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      form_events: {
        Row: {
          event_data: Json | null
          event_type: string
          field_index: number | null
          field_ref: string | null
          form_id: string
          id: string
          session_id: string
          timestamp: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          field_index?: number | null
          field_ref?: string | null
          form_id: string
          id?: string
          session_id: string
          timestamp?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          field_index?: number | null
          field_ref?: string | null
          form_id?: string
          id?: string
          session_id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          booking_id: string | null
          stripe_invoice_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          description: string
          currency: string
          line_items: Json
          subtotal_cents: number
          btw_percent: number
          btw_amount_cents: number
          total_cents: number
          invoice_type: string
          status: string
          pdf_url: string | null
          pdf_path: string | null
          stripe_pdf_url: string | null
          invoice_date: string
          paid_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          booking_id?: string | null
          stripe_invoice_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          description: string
          currency?: string
          line_items: Json
          subtotal_cents: number
          btw_percent?: number
          btw_amount_cents: number
          total_cents: number
          invoice_type: string
          status?: string
          pdf_url?: string | null
          pdf_path?: string | null
          stripe_pdf_url?: string | null
          invoice_date?: string
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          booking_id?: string | null
          stripe_invoice_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          description?: string
          currency?: string
          line_items?: Json
          subtotal_cents?: number
          btw_percent?: number
          btw_amount_cents?: number
          total_cents?: number
          invoice_type?: string
          status?: string
          pdf_url?: string | null
          pdf_path?: string | null
          stripe_pdf_url?: string | null
          invoice_date?: string
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          email: string | null
          form_id: string
          id: string
          ip_address: string | null
          name: string | null
          phone: string | null
          qualification_result: string
          redirected_to: string | null
          session_id: string | null
          started_at: string | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string | null
          email?: string | null
          form_id: string
          id?: string
          ip_address?: string | null
          name?: string | null
          phone?: string | null
          qualification_result: string
          redirected_to?: string | null
          session_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string | null
          email?: string | null
          form_id?: string
          id?: string
          ip_address?: string | null
          name?: string | null
          phone?: string | null
          qualification_result?: string
          redirected_to?: string | null
          session_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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

// Type aliases for form submissions
export type FormSubmission = Tables<'form_submissions'>
export type FormSubmissionInsert = TablesInsert<'form_submissions'>
export type FormSubmissionUpdate = TablesUpdate<'form_submissions'>

// Type aliases for form events
export type FormEvent = Tables<'form_events'>
export type FormEventInsert = TablesInsert<'form_events'>
export type FormEventUpdate = TablesUpdate<'form_events'>

// Type aliases for invoices
export type Invoice = Tables<'invoices'>
export type InvoiceInsert = TablesInsert<'invoices'>
export type InvoiceUpdate = TablesUpdate<'invoices'>

