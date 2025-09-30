// CitizenSpace Database TypeScript Types
// Generated from Supabase schema
// Last Updated: 2025-09-29

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
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          phone: string | null
          wallet_address: string | null
          nft_holder: boolean
          nft_token_id: string | null
          membership_plan_id: string | null
          membership_status: 'active' | 'paused' | 'cancelled' | null
          membership_start_date: string | null
          membership_end_date: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          phone?: string | null
          wallet_address?: string | null
          nft_holder?: boolean
          nft_token_id?: string | null
          membership_plan_id?: string | null
          membership_status?: 'active' | 'paused' | 'cancelled' | null
          membership_start_date?: string | null
          membership_end_date?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          phone?: string | null
          wallet_address?: string | null
          nft_holder?: boolean
          nft_token_id?: string | null
          membership_plan_id?: string | null
          membership_status?: 'active' | 'paused' | 'cancelled' | null
          membership_start_date?: string | null
          membership_end_date?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price: number
          nft_holder_price: number
          billing_period: 'hourly' | 'daily' | 'monthly'
          features: Json
          limitations: Json
          meeting_room_credits_hours: number
          printing_credits: number
          cafe_discount_percentage: number
          guest_passes_per_month: number
          access_hours: string | null
          includes_hot_desk: boolean
          stripe_price_id: string | null
          active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price: number
          nft_holder_price: number
          billing_period: 'hourly' | 'daily' | 'monthly'
          features?: Json
          limitations?: Json
          meeting_room_credits_hours?: number
          printing_credits?: number
          cafe_discount_percentage?: number
          guest_passes_per_month?: number
          access_hours?: string | null
          includes_hot_desk?: boolean
          stripe_price_id?: string | null
          active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price?: number
          nft_holder_price?: number
          billing_period?: 'hourly' | 'daily' | 'monthly'
          features?: Json
          limitations?: Json
          meeting_room_credits_hours?: number
          printing_credits?: number
          cafe_discount_percentage?: number
          guest_passes_per_month?: number
          access_hours?: string | null
          includes_hot_desk?: boolean
          stripe_price_id?: string | null
          active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          type: 'hot-desk' | 'focus-room' | 'collaborate-room' | 'boardroom' | 'communications-pod'
          resource_category: 'desk' | 'meeting-room'
          description: string | null
          capacity: number
          base_price_hourly: number
          requires_credits: boolean
          min_duration: number
          max_duration: number
          amenities: Json
          images: Json
          available: boolean
          floor_location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'hot-desk' | 'focus-room' | 'collaborate-room' | 'boardroom' | 'communications-pod'
          resource_category: 'desk' | 'meeting-room'
          description?: string | null
          capacity: number
          base_price_hourly: number
          requires_credits?: boolean
          min_duration: number
          max_duration: number
          amenities?: Json
          images?: Json
          available?: boolean
          floor_location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'hot-desk' | 'focus-room' | 'collaborate-room' | 'boardroom' | 'communications-pod'
          resource_category?: 'desk' | 'meeting-room'
          description?: string | null
          capacity?: number
          base_price_hourly?: number
          requires_credits?: boolean
          min_duration?: number
          max_duration?: number
          amenities?: Json
          images?: Json
          available?: boolean
          floor_location?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          booking_type: 'hourly-desk' | 'meeting-room' | 'day-pass'
          booking_date: string
          start_time: string
          end_time: string
          duration_hours: number
          attendees: number
          subtotal: number
          discount_amount: number
          nft_discount_applied: boolean
          credits_used: number | null
          credits_overage_hours: number | null
          overage_charge: number | null
          processing_fee: number
          total_price: number
          special_requests: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          payment_method: 'card' | 'credits' | 'membership'
          confirmation_code: string
          check_in_time: string | null
          check_out_time: string | null
          actual_duration_hours: number | null
          final_charge: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          booking_type: 'hourly-desk' | 'meeting-room' | 'day-pass'
          booking_date: string
          start_time: string
          end_time: string
          duration_hours: number
          attendees?: number
          subtotal: number
          discount_amount?: number
          nft_discount_applied?: boolean
          credits_used?: number | null
          credits_overage_hours?: number | null
          overage_charge?: number | null
          processing_fee?: number
          total_price: number
          special_requests?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          payment_method: 'card' | 'credits' | 'membership'
          confirmation_code: string
          check_in_time?: string | null
          check_out_time?: string | null
          actual_duration_hours?: number | null
          final_charge?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          booking_type?: 'hourly-desk' | 'meeting-room' | 'day-pass'
          booking_date?: string
          start_time?: string
          end_time?: string
          duration_hours?: number
          attendees?: number
          subtotal?: number
          discount_amount?: number
          nft_discount_applied?: boolean
          credits_used?: number | null
          credits_overage_hours?: number | null
          overage_charge?: number | null
          processing_fee?: number
          total_price?: number
          special_requests?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          payment_method?: 'card' | 'credits' | 'membership'
          confirmation_code?: string
          check_in_time?: string | null
          check_out_time?: string | null
          actual_duration_hours?: number | null
          final_charge?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      membership_credits: {
        Row: {
          id: string
          user_id: string
          credit_type: 'meeting-room' | 'printing' | 'guest-pass'
          allocated_amount: number
          used_amount: number
          remaining_amount: number
          billing_cycle_start: string
          billing_cycle_end: string
          status: 'active' | 'expired' | 'rolled-over'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_type: 'meeting-room' | 'printing' | 'guest-pass'
          allocated_amount: number
          used_amount?: number
          remaining_amount: number
          billing_cycle_start: string
          billing_cycle_end: string
          status?: 'active' | 'expired' | 'rolled-over'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credit_type?: 'meeting-room' | 'printing' | 'guest-pass'
          allocated_amount?: number
          used_amount?: number
          remaining_amount?: number
          billing_cycle_start?: string
          billing_cycle_end?: string
          status?: 'active' | 'expired' | 'rolled-over'
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          membership_credit_id: string
          booking_id: string | null
          transaction_type: 'allocation' | 'usage' | 'refund' | 'expiration'
          amount: number
          balance_after: number
          description: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          membership_credit_id: string
          booking_id?: string | null
          transaction_type: 'allocation' | 'usage' | 'refund' | 'expiration'
          amount: number
          balance_after: number
          description: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          membership_credit_id?: string
          booking_id?: string | null
          transaction_type?: 'allocation' | 'usage' | 'refund' | 'expiration'
          amount?: number
          balance_after?: number
          description?: string
          metadata?: Json
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          nft_holder_price: number
          category: 'coffee' | 'tea' | 'pastries' | 'meals'
          dietary_tags: Json
          image_url: string | null
          available: boolean
          featured: boolean
          orderable: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          nft_holder_price: number
          category: 'coffee' | 'tea' | 'pastries' | 'meals'
          dietary_tags?: Json
          image_url?: string | null
          available?: boolean
          featured?: boolean
          orderable?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          nft_holder_price?: number
          category?: 'coffee' | 'tea' | 'pastries' | 'meals'
          dietary_tags?: Json
          image_url?: string | null
          available?: boolean
          featured?: boolean
          orderable?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      cafe_orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          items: Json
          subtotal: number
          nft_discount_applied: boolean
          discount_amount: number
          tax: number
          total: number
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          order_type: 'dine-in' | 'takeout'
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          items: Json
          subtotal: number
          nft_discount_applied?: boolean
          discount_amount?: number
          tax: number
          total: number
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          order_type: 'dine-in' | 'takeout'
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          items?: Json
          subtotal?: number
          nft_discount_applied?: boolean
          discount_amount?: number
          tax?: number
          total?: number
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          order_type?: 'dine-in' | 'takeout'
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          event_date: string
          start_time: string
          end_time: string
          location: string
          host_name: string
          host_organization: string | null
          capacity: number
          price: number
          image_url: string | null
          tags: Json
          external_rsvp_url: string | null
          event_type: 'workshop' | 'networking' | 'tech-talk' | 'experience'
          status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          event_date: string
          start_time: string
          end_time: string
          location: string
          host_name: string
          host_organization?: string | null
          capacity: number
          price?: number
          image_url?: string | null
          tags?: Json
          external_rsvp_url?: string | null
          event_type: 'workshop' | 'networking' | 'tech-talk' | 'experience'
          status?: 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          event_date?: string
          start_time?: string
          end_time?: string
          location?: string
          host_name?: string
          host_organization?: string | null
          capacity?: number
          price?: number
          image_url?: string | null
          tags?: Json
          external_rsvp_url?: string | null
          event_type?: 'workshop' | 'networking' | 'tech-talk' | 'experience'
          status?: 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          attendees_count: number
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          confirmation_code: string
          status: 'confirmed' | 'cancelled' | 'waitlist'
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          attendees_count?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          confirmation_code: string
          status?: 'confirmed' | 'cancelled' | 'waitlist'
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          attendees_count?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          confirmation_code?: string
          status?: 'confirmed' | 'cancelled' | 'waitlist'
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          author_id: string
          featured_image_url: string | null
          tags: Json
          reading_time_minutes: number
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          author_id: string
          featured_image_url?: string | null
          tags?: Json
          reading_time_minutes?: number
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          author_id?: string
          featured_image_url?: string | null
          tags?: Json
          reading_time_minutes?: number
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          topic: 'general' | 'tour' | 'membership' | 'events' | 'partnership' | 'press'
          message: string
          status: 'new' | 'in-progress' | 'resolved' | 'spam'
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          topic: 'general' | 'tour' | 'membership' | 'events' | 'partnership' | 'press'
          message: string
          status?: 'new' | 'in-progress' | 'resolved' | 'spam'
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          topic?: 'general' | 'tour' | 'membership' | 'events' | 'partnership' | 'press'
          message?: string
          status?: 'new' | 'in-progress' | 'resolved' | 'spam'
          assigned_to?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          status: 'active' | 'unsubscribed' | 'bounced'
          subscribed_at: string
          unsubscribed_at: string | null
          source: string
        }
        Insert: {
          id?: string
          email: string
          status?: 'active' | 'unsubscribed' | 'bounced'
          subscribed_at?: string
          unsubscribed_at?: string | null
          source: string
        }
        Update: {
          id?: string
          email?: string
          status?: 'active' | 'unsubscribed' | 'bounced'
          subscribed_at?: string
          unsubscribed_at?: string | null
          source?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_confirmation_code: {
        Args: Record<string, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      has_active_membership: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_staff_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      get_available_credits: {
        Args: { user_uuid: string; credit_type_param: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}