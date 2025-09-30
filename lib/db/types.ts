/**
 * Database types matching the schema from PRD.md
 * These types provide type safety for database operations
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace
        Insert: Omit<Workspace, 'id' | 'created_at'>
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      membership_plans: {
        Row: MembershipPlan
        Insert: Omit<MembershipPlan, 'id' | 'created_at'>
        Update: Partial<Omit<MembershipPlan, 'id' | 'created_at'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      workspace_type:
        | 'hot-desk'
        | 'focus-room'
        | 'collaborate-room'
        | 'boardroom'
        | 'communications-pod'
      resource_category: 'desk' | 'meeting-room'
      booking_type: 'hourly-desk' | 'meeting-room' | 'day-pass'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      payment_status: 'pending' | 'paid' | 'refunded'
      payment_method: 'card' | 'credits' | 'membership'
      membership_status: 'active' | 'paused' | 'cancelled'
      billing_period: 'hourly' | 'daily' | 'monthly'
    }
  }
}

export interface Workspace {
  id: string
  name: string
  type: Database['public']['Enums']['workspace_type']
  resource_category: Database['public']['Enums']['resource_category']
  description: string
  capacity: number
  base_price_hourly: number
  requires_credits: boolean
  min_duration: number
  max_duration: number
  amenities: string[]
  images: string[]
  available: boolean
  floor_location: string
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  workspace_id: string
  booking_type: Database['public']['Enums']['booking_type']
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
  status: Database['public']['Enums']['booking_status']
  payment_status: Database['public']['Enums']['payment_status']
  payment_intent_id: string | null
  payment_method: Database['public']['Enums']['payment_method']
  confirmation_code: string
  check_in_time: string | null
  check_out_time: string | null
  actual_duration_hours: number | null
  final_charge: number | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  phone: string | null
  wallet_address: string | null
  nft_holder: boolean
  nft_token_id: string | null
  membership_plan_id: string | null
  membership_status: Database['public']['Enums']['membership_status'] | null
  membership_start_date: string | null
  membership_end_date: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface MembershipPlan {
  id: string
  name: string
  slug: string
  price: number
  nft_holder_price: number
  billing_period: Database['public']['Enums']['billing_period']
  features: string[]
  limitations: string[]
  meeting_room_credits_hours: number
  printing_credits: number
  cafe_discount_percentage: number
  guest_passes_per_month: number
  access_hours: string
  includes_hot_desk: boolean
  stripe_price_id: string | null
  active: boolean
  sort_order: number
  created_at: string
}

// API Response Types
export interface WorkspaceWithAvailability extends Workspace {
  is_available?: boolean
  next_available_time?: string | null
}

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  available: boolean
  workspace_id: string
  workspace_name: string
}

// Query Parameters Types
export interface WorkspaceFilters {
  type?: Database['public']['Enums']['workspace_type']
  resource_category?: Database['public']['Enums']['resource_category']
  min_capacity?: number
  max_capacity?: number
  amenities?: string[]
  min_price?: number
  max_price?: number
  available?: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AvailabilityQuery {
  workspace_id?: string
  date: string
  start_time?: string
  end_time?: string
  duration_hours?: number
  resource_category?: Database['public']['Enums']['resource_category']
}

// Additional types for credits system
export interface MembershipCredit {
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

export interface CreditTransaction {
  id: string
  user_id: string
  membership_credit_id: string
  booking_id: string | null
  transaction_type: 'allocation' | 'usage' | 'refund' | 'expiration'
  amount: number
  balance_after: number
  description: string
  metadata: Record<string, any>
  created_at: string
}

// Menu and Orders Types
export interface MenuItem {
  id: string
  title: string
  description: string | null
  price: number
  category: 'coffee' | 'tea' | 'pastries' | 'meals'
  dietary_tags: string[]
  image: string | null
  orderable: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  subtotal: number
  discount_amount: number
  nft_discount_applied: boolean
  processing_fee: number
  total_price: number
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_intent_id: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

// Blog Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string | null
  author_name: string
  author_avatar: string | null
  author_bio: string | null
  tags: string[]
  published_at: string
  reading_time: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  post_count: number
  created_at: string
}

export interface BlogPostFilters {
  tag?: string
  category?: string
  search?: string
  published?: boolean
}

export interface BlogSearchResult extends BlogPost {
  rank?: number
}
