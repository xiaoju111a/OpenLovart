-- Add User Credits Table
-- Run this in your Supabase SQL Editor

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on user_credits table
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_credits - users can view their own credits
CREATE POLICY "Users can view their own credits"
  ON user_credits
  FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

-- Create RLS policy for user_credits - users can insert their own credits
CREATE POLICY "Users can insert their own credits"
  ON user_credits
  FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Create RLS policy for user_credits - users can update their own credits
CREATE POLICY "Users can update their own credits"
  ON user_credits
  FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
