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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          is_done: boolean
          lead_id: string | null
          subject: string | null
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          lead_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_done?: boolean
          lead_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_coaching_stats: {
        Row: {
          agent_id: string
          avg_call_duration: number | null
          avg_sentiment_score: number | null
          coaching_score: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          keywords_handled: number | null
          period_end: string
          period_start: string
          talk_tracks_used: number | null
          total_calls: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          avg_call_duration?: number | null
          avg_sentiment_score?: number | null
          coaching_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          keywords_handled?: number | null
          period_end: string
          period_start: string
          talk_tracks_used?: number | null
          total_calls?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          avg_call_duration?: number | null
          avg_sentiment_score?: number | null
          coaching_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          keywords_handled?: number | null
          period_end?: string
          period_start?: string
          talk_tracks_used?: number | null
          total_calls?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      call_coaching_events: {
        Row: {
          agent_action: string | null
          call_id: string
          created_at: string
          event_type: string
          id: string
          keyword_detected: string | null
          prompt_shown: string | null
          talk_track_id: string | null
          timestamp: string | null
        }
        Insert: {
          agent_action?: string | null
          call_id: string
          created_at?: string
          event_type: string
          id?: string
          keyword_detected?: string | null
          prompt_shown?: string | null
          talk_track_id?: string | null
          timestamp?: string | null
        }
        Update: {
          agent_action?: string | null
          call_id?: string
          created_at?: string
          event_type?: string
          id?: string
          keyword_detected?: string | null
          prompt_shown?: string | null
          talk_track_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_coaching_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          call_type: string | null
          coaching_prompts_shown: string[] | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          detected_keywords: string[] | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used: string[] | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          call_type?: string | null
          coaching_prompts_shown?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_keywords?: string[] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          call_type?: string | null
          coaching_prompts_shown?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_keywords?: string[] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_memberships: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_memberships_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          portal_access_id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          portal_access_id: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          portal_access_id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_messages_portal_access_id_fkey"
            columns: ["portal_access_id"]
            isOneToOne: false
            referencedRelation: "customer_portal_access"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_access: {
        Row: {
          created_at: string
          customer_email: string
          deal_id: string | null
          id: string
          invited_by: string | null
          lead_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          deal_id?: string | null
          id?: string
          invited_by?: string | null
          lead_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          deal_id?: string | null
          id?: string
          invited_by?: string | null
          lead_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_access_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_portal_access_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          deal_id: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          deal_id: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          deal_id?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          actual_revenue: number | null
          assigned_agent_id: string | null
          carrier_id: string | null
          carrier_name: string | null
          created_at: string
          deal_value: number | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          loss_reason: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          actual_revenue?: number | null
          assigned_agent_id?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          created_at?: string
          deal_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          actual_revenue?: number | null
          assigned_agent_id?: string | null
          carrier_id?: string | null
          carrier_name?: string | null
          created_at?: string
          deal_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      esign_audit_trail: {
        Row: {
          agent_id: string | null
          consent_given: boolean | null
          consent_text: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          document_hash: string | null
          document_type: string
          event_data: Json | null
          event_type: string
          id: string
          ref_number: string
          signer_ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          agent_id?: string | null
          consent_given?: boolean | null
          consent_text?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          document_hash?: string | null
          document_type: string
          event_data?: Json | null
          event_type: string
          id?: string
          ref_number: string
          signer_ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          agent_id?: string | null
          consent_given?: boolean | null
          consent_text?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          document_hash?: string | null
          document_type?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ref_number?: string
          signer_ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esign_audit_trail_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_inventory: {
        Row: {
          created_at: string
          cubic_feet: number
          id: string
          image_url: string | null
          item_name: string
          lead_id: string
          quantity: number
          room: string
          special_handling: boolean
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          cubic_feet?: number
          id?: string
          image_url?: string | null
          item_name: string
          lead_id: string
          quantity?: number
          room?: string
          special_handling?: boolean
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          cubic_feet?: number
          id?: string
          image_url?: string | null
          item_name?: string
          lead_id?: string
          quantity?: number
          room?: string
          special_handling?: boolean
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_inventory_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_vendors: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          cost_per_lead: number | null
          created_at: string
          id: string
          monthly_budget: number | null
          name: string
          notes: string | null
          status: string
          updated_at: string
          vendor_type: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          cost_per_lead?: number | null
          created_at?: string
          id?: string
          monthly_budget?: number | null
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          vendor_type?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          cost_per_lead?: number | null
          created_at?: string
          id?: string
          monthly_budget?: number | null
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          vendor_type?: string
          website?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          destination_address: string | null
          email: string | null
          estimated_value: number | null
          estimated_weight: number | null
          first_name: string
          id: string
          last_name: string
          move_date: string | null
          notes: string | null
          origin_address: string | null
          phone: string | null
          price_per_cuft: number | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          destination_address?: string | null
          email?: string | null
          estimated_value?: number | null
          estimated_weight?: number | null
          first_name: string
          id?: string
          last_name: string
          move_date?: string | null
          notes?: string | null
          origin_address?: string | null
          phone?: string | null
          price_per_cuft?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          destination_address?: string | null
          email?: string | null
          estimated_value?: number | null
          estimated_weight?: number | null
          first_name?: string
          id?: string
          last_name?: string
          move_date?: string | null
          notes?: string | null
          origin_address?: string | null
          phone?: string | null
          price_per_cuft?: number | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "lead_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      move_details: {
        Row: {
          bedrooms: number
          created_at: string
          floors: number
          fragile_items: boolean
          has_elevator: boolean
          has_stairs: boolean
          id: string
          is_apartment: boolean
          lead_id: string
          long_carry_ft: number
          packing_service: boolean
          property_type: string
          special_packaging: boolean
          special_treatment_notes: string | null
          stair_flights: number
          updated_at: string
        }
        Insert: {
          bedrooms?: number
          created_at?: string
          floors?: number
          fragile_items?: boolean
          has_elevator?: boolean
          has_stairs?: boolean
          id?: string
          is_apartment?: boolean
          lead_id: string
          long_carry_ft?: number
          packing_service?: boolean
          property_type?: string
          special_packaging?: boolean
          special_treatment_notes?: string | null
          stair_flights?: number
          updated_at?: string
        }
        Update: {
          bedrooms?: number
          created_at?: string
          floors?: number
          fragile_items?: boolean
          has_elevator?: boolean
          has_stairs?: boolean
          id?: string
          is_apartment?: boolean
          lead_id?: string
          long_carry_ft?: number
          packing_service?: boolean
          property_type?: string
          special_packaging?: boolean
          special_treatment_notes?: string | null
          stair_flights?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_details_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string
          display_order: number
          id: string
          is_default: boolean
          name: string
          stage_key: Database["public"]["Enums"]["deal_stage"]
        }
        Insert: {
          color?: string
          display_order?: number
          id?: string
          is_default?: boolean
          name: string
          stage_key: Database["public"]["Enums"]["deal_stage"]
        }
        Update: {
          color?: string
          display_order?: number
          id?: string
          is_default?: boolean
          name?: string
          stage_key?: Database["public"]["Enums"]["deal_stage"]
        }
        Relationships: []
      }
      pricing_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          automation_mode: string
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
        }
        Insert: {
          automation_mode?: string
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
        }
        Update: {
          automation_mode?: string
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
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
      vendor_agent_assignments: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_active: boolean
          max_cpa: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_cpa?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_cpa?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_agent_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "lead_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_creator: { Args: { conv_id: string }; Returns: boolean }
      is_conversation_member: { Args: { conv_id: string }; Returns: boolean }
    }
    Enums: {
      activity_type:
        | "call"
        | "email"
        | "note"
        | "follow_up"
        | "meeting"
        | "text"
        | "stage_change"
      app_role:
        | "owner"
        | "admin"
        | "manager"
        | "agent"
        | "marketing"
        | "accounting"
      call_outcome:
        | "booked"
        | "follow_up"
        | "lost"
        | "no_answer"
        | "callback_scheduled"
      call_status: "active" | "completed" | "missed" | "transferred"
      deal_stage:
        | "new_lead"
        | "contacted"
        | "qualified"
        | "estimate_sent"
        | "follow_up"
        | "booked"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "closed_won"
        | "closed_lost"
      lead_source:
        | "website"
        | "referral"
        | "ppc"
        | "walk_in"
        | "phone"
        | "other"
      lead_status: "new" | "contacted" | "qualified" | "lost"
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
      activity_type: [
        "call",
        "email",
        "note",
        "follow_up",
        "meeting",
        "text",
        "stage_change",
      ],
      app_role: [
        "owner",
        "admin",
        "manager",
        "agent",
        "marketing",
        "accounting",
      ],
      call_outcome: [
        "booked",
        "follow_up",
        "lost",
        "no_answer",
        "callback_scheduled",
      ],
      call_status: ["active", "completed", "missed", "transferred"],
      deal_stage: [
        "new_lead",
        "contacted",
        "qualified",
        "estimate_sent",
        "follow_up",
        "booked",
        "dispatched",
        "in_transit",
        "delivered",
        "closed_won",
        "closed_lost",
      ],
      lead_source: ["website", "referral", "ppc", "walk_in", "phone", "other"],
      lead_status: ["new", "contacted", "qualified", "lost"],
    },
  },
} as const
