import { createClient } from '@supabase/supabase-js'

// Your Supabase project credentials
const SUPABASE_URL = 'https://hhfenfbfallnzeeksnir.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZmVuZmJmYWxsbnplZWtzbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTAzMDksImV4cCI6MjA2Njc4NjMwOX0.IeR-F2SyyvLB_PVdvaA3iPynnwiFIMf288_KFadWl2U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Also export as default for backward compatibility
export default supabase

console.log('✅ Supabase connected successfully!')

// Complete database schema - now fully synchronized
export const DATABASE_SCHEMA = `
-- Complete tasks table with all required columns
CREATE TABLE IF NOT EXISTS tasks_dt2024 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories_dt2024(id) ON DELETE SET NULL,
  repeat_type TEXT DEFAULT 'none',
  repeat_config JSONB,
  due_date DATE NOT NULL,
  due_time TIME DEFAULT '09:00',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  streak_count INTEGER DEFAULT 0,
  last_completed_date DATE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories_dt2024 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tasks_dt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_dt2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks_dt2024 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks_dt2024 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks_dt2024 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks_dt2024 FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Users can view own categories" ON categories_dt2024 FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories_dt2024 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories_dt2024 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories_dt2024 FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks_dt2024(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks_dt2024(due_date);
CREATE INDEX IF NOT EXISTS tasks_category_id_idx ON tasks_dt2024(category_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories_dt2024(user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON tasks_dt2024
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_categories_updated_at
  BEFORE UPDATE ON categories_dt2024
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
`;