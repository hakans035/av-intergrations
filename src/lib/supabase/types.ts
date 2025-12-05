export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      form_submissions: {
        Row: {
          id: string
          form_id: string
          name: string | null
          email: string | null
          phone: string | null
          answers: Json
          qualification_result: string
          redirected_to: string | null
          user_agent: string | null
          ip_address: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          session_id: string | null
          started_at: string | null
          completed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          answers: Json
          qualification_result: string
          redirected_to?: string | null
          user_agent?: string | null
          ip_address?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          session_id?: string | null
          started_at?: string | null
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          answers?: Json
          qualification_result?: string
          redirected_to?: string | null
          user_agent?: string | null
          ip_address?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          session_id?: string | null
          started_at?: string | null
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_events: {
        Row: {
          id: string
          session_id: string
          form_id: string
          event_type: string
          field_ref: string | null
          field_index: number | null
          event_data: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          form_id: string
          event_type: string
          field_ref?: string | null
          field_index?: number | null
          event_data?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          form_id?: string
          event_type?: string
          field_ref?: string | null
          field_index?: number | null
          event_data?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type FormSubmission = Database['public']['Tables']['form_submissions']['Row']
export type FormSubmissionInsert = Database['public']['Tables']['form_submissions']['Insert']
export type FormSubmissionUpdate = Database['public']['Tables']['form_submissions']['Update']

export type FormEvent = Database['public']['Tables']['form_events']['Row']
export type FormEventInsert = Database['public']['Tables']['form_events']['Insert']
export type FormEventUpdate = Database['public']['Tables']['form_events']['Update']
