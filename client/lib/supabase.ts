import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_chefs: {
        Row: {
          id: string;
          cin: string;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          can: string;
          phone: string;
          role: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cin: string;
          first_name: string;
          last_name: string;
          date_of_birth?: string | null;
          can: string;
          phone: string;
          role: string;
          password_hash: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          branch: string | null;
          patrol: string | null;
          role: string | null;
          tutor_name: string | null;
          tutor_phone: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth?: string | null;
          branch?: string | null;
          patrol?: string | null;
          role?: string | null;
          tutor_name?: string | null;
          tutor_phone?: string | null;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          patrol: string | null;
          activity: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          patrol?: string | null;
          activity?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          location: string | null;
          responsible: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          location?: string | null;
          responsible?: string | null;
        };
      };
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          status: 'new' | 'in_review' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          status?: 'new' | 'in_review' | 'approved' | 'rejected';
        };
      };
      daily_camp_reports: {
        Row: {
          id: string;
          user_id: string;
          patrol: string;
          date: string;
          morning_rating: number | null;
          afternoon_rating: number | null;
          evening_rating: number | null;
          food_rating: number | null;
          relations_rating: number | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          patrol: string;
          date: string;
          morning_rating?: number | null;
          afternoon_rating?: number | null;
          evening_rating?: number | null;
          food_rating?: number | null;
          relations_rating?: number | null;
          remarks?: string | null;
        };
      };
    };
  };
};
