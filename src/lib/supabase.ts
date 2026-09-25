import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable retrieval (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Live Supabase Client (if configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface TithiDateRecord {
  id: string;
  year: number;
  date: string; // e.g. "14 October"
  tithi_name: string; // "Ashwayuja Shukla Tritiya"
  status: 'published' | 'draft' | 'unpublished';
  notes?: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface EmailLogRecord {
  id: string;
  year: number;
  event_type: 'birthday' | 'tithi' | 'test';
  scheduled_date: string;
  recipient: string;
  sent_at: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED' | 'SKIPPED_DUPLICATE' | 'SCHEDULED';
  subject: string;
  error?: string;
}

export interface AppSettingsRecord {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
