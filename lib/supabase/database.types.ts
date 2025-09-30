/**
 * Supabase Database Types
 * Auto-generated types for type-safe database access
 */

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
          full_name: string | null
          phone: string | null
          wallet_address: string | null
          nft_holder: boolean
          role: 'user' | 'staff' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          phone?: string | null
          wallet_address?: string | null
          nft_holder?: boolean
          role?: 'user' | 'staff' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          wallet_address?: string | null
          nft_holder?: boolean
          role?: 'user' | 'staff' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Additional tables will be defined here
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'staff' | 'admin'
    }
  }
}