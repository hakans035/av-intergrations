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
    PostgrestVersion: "13.0.5"
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
          booking_id: string | null
          created_at: string | null
          email_subject: string
          error_message: string | null
          id: string
          recipient_email: string
          resend_message_id: string | null
          sent_at: string | null
          status: string
          workflow_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          email_subject: string
          error_message?: string | null
          id?: string
          recipient_email: string
          resend_message_id?: string | null
          sent_at?: string | null
          status: string
          workflow_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          email_subject?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          workflow_id?: string | null
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
          created_at: string | null
          description: string | null
          email_subject: string
          email_template: string
          event_type_id: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          trigger_offset_minutes: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email_subject: string
          email_template: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          trigger_offset_minutes?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email_subject?: string
          email_template?: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          trigger_offset_minutes?: number | null
          trigger_type?: string
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
      form_submissions: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          email: string | null
          followup_email_sent_at: string | null
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
          followup_email_sent_at?: string | null
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
          followup_email_sent_at?: string | null
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
      invoices: {
        Row: {
          booking_id: string | null
          btw_amount_cents: number
          btw_percent: number | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          description: string
          id: string
          invoice_date: string | null
          invoice_number: string
          invoice_type: string
          line_items: Json
          paid_at: string | null
          pdf_path: string | null
          pdf_url: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_pdf_url: string | null
          subtotal_cents: number
          total_cents: number
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          btw_amount_cents: number
          btw_percent?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          description: string
          id?: string
          invoice_date?: string | null
          invoice_number: string
          invoice_type: string
          line_items: Json
          paid_at?: string | null
          pdf_path?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_pdf_url?: string | null
          subtotal_cents: number
          total_cents: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          btw_amount_cents?: number
          btw_percent?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          description?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          invoice_type?: string
          line_items?: Json
          paid_at?: string | null
          pdf_path?: string | null
          pdf_url?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_pdf_url?: string | null
          subtotal_cents?: number
          total_cents?: number
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
      seo_approval_logs: {
        Row: {
          action: string
          created_at: string | null
          draft_id: string | null
          gate: string
          id: string
          new_status: string
          notes: string | null
          previous_status: string
          reviewer_id: string
          reviewer_name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          draft_id?: string | null
          gate: string
          id?: string
          new_status: string
          notes?: string | null
          previous_status: string
          reviewer_id: string
          reviewer_name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          draft_id?: string | null
          gate?: string
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string
          reviewer_id?: string
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_approval_logs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "seo_content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_content_drafts: {
        Row: {
          body: string
          content_type: string
          created_at: string | null
          current_gate: string | null
          generated_at: string | null
          id: string
          keyword: string
          keyword_id: string | null
          language: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          revision_count: number | null
          schema_type: string | null
          slug: string
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
          webflow_item_id: string | null
        }
        Insert: {
          body: string
          content_type: string
          created_at?: string | null
          current_gate?: string | null
          generated_at?: string | null
          id?: string
          keyword: string
          keyword_id?: string | null
          language: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          revision_count?: number | null
          schema_type?: string | null
          slug: string
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          webflow_item_id?: string | null
        }
        Update: {
          body?: string
          content_type?: string
          created_at?: string | null
          current_gate?: string | null
          generated_at?: string | null
          id?: string
          keyword?: string
          keyword_id?: string | null
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          revision_count?: number | null
          schema_type?: string | null
          slug?: string
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          webflow_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_content_drafts_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_content_revisions: {
        Row: {
          changed_at: string | null
          changed_by: string
          changes: string
          draft_id: string | null
          id: string
          previous_body: string | null
          version: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          changes: string
          draft_id?: string | null
          id?: string
          previous_body?: string | null
          version: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          changes?: string
          draft_id?: string | null
          id?: string
          previous_body?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_content_revisions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "seo_content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_discovery_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          keywords_added: number
          keywords_found: number
          keywords_skipped: number
          news_sources_checked: Json | null
          raw_response: Json | null
          search_queries_used: Json | null
          summary: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          keywords_added?: number
          keywords_found?: number
          keywords_skipped?: number
          news_sources_checked?: Json | null
          raw_response?: Json | null
          search_queries_used?: Json | null
          summary?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          keywords_added?: number
          keywords_found?: number
          keywords_skipped?: number
          news_sources_checked?: Json | null
          raw_response?: Json | null
          search_queries_used?: Json | null
          summary?: string | null
        }
        Relationships: []
      }
      seo_generated_images: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string | null
          draft_id: string | null
          file_size_bytes: number | null
          generated_at: string | null
          height: number | null
          id: string
          url: string
          webflow_asset_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string | null
          draft_id?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          height?: number | null
          id?: string
          url: string
          webflow_asset_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string | null
          draft_id?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          height?: number | null
          id?: string
          url?: string
          webflow_asset_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_generated_images_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "seo_content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_generation_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          keyword_queue_id: string | null
          metadata: Json | null
          slug: string | null
          status: string
          title: string | null
          webflow_item_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          keyword_queue_id?: string | null
          metadata?: Json | null
          slug?: string | null
          status: string
          title?: string | null
          webflow_item_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          keyword_queue_id?: string | null
          metadata?: Json | null
          slug?: string | null
          status?: string
          title?: string | null
          webflow_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_generation_log_keyword_queue_id_fkey"
            columns: ["keyword_queue_id"]
            isOneToOne: false
            referencedRelation: "seo_keyword_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keyword_queue: {
        Row: {
          content_type: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          keyword: string
          language: string
          metadata: Json | null
          priority: number
          processed_at: string | null
          retry_count: number | null
          scheduled_date: string | null
          status: string
          webflow_item_id: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          keyword: string
          language?: string
          metadata?: Json | null
          priority?: number
          processed_at?: string | null
          retry_count?: number | null
          scheduled_date?: string | null
          status?: string
          webflow_item_id?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          keyword?: string
          language?: string
          metadata?: Json | null
          priority?: number
          processed_at?: string | null
          retry_count?: number | null
          scheduled_date?: string | null
          status?: string
          webflow_item_id?: string | null
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          created_at: string | null
          difficulty: number | null
          discovered_at: string | null
          id: string
          intent: string
          keyword: string
          language: string
          last_used: string | null
          source: string | null
          source_data: Json | null
          status: string | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          discovered_at?: string | null
          id?: string
          intent: string
          keyword: string
          language: string
          last_used?: string | null
          source?: string | null
          source_data?: Json | null
          status?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          discovered_at?: string | null
          id?: string
          intent?: string
          keyword?: string
          language?: string
          last_used?: string | null
          source?: string | null
          source_data?: Json | null
          status?: string | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      seo_notification_settings: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          notify_on_error: boolean | null
          notify_on_generation: boolean | null
          notify_on_publish: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          notify_on_error?: boolean | null
          notify_on_generation?: boolean | null
          notify_on_publish?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          notify_on_error?: boolean | null
          notify_on_generation?: boolean | null
          notify_on_publish?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      seo_performance_metrics: {
        Row: {
          bounce_rate: number | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          ctr: number | null
          date: string
          draft_id: string | null
          id: string
          impressions: number | null
          page_views: number | null
          position: number | null
          scroll_depth: number | null
          time_on_page_seconds: number | null
          webflow_item_id: string | null
        }
        Insert: {
          bounce_rate?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          draft_id?: string | null
          id?: string
          impressions?: number | null
          page_views?: number | null
          position?: number | null
          scroll_depth?: number | null
          time_on_page_seconds?: number | null
          webflow_item_id?: string | null
        }
        Update: {
          bounce_rate?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          draft_id?: string | null
          id?: string
          impressions?: number | null
          page_views?: number | null
          position?: number | null
          scroll_depth?: number | null
          time_on_page_seconds?: number | null
          webflow_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_performance_metrics_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "seo_content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
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
