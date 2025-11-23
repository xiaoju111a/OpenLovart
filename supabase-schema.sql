-- Lovart UI Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
  title TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canvas_elements table
CREATE TABLE IF NOT EXISTS canvas_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  element_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for projects - users can only see their own projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.jwt()->>'sub' = user_id);

-- Create RLS policy for projects - users can insert their own projects
CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Create RLS policy for projects - users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Create RLS policy for projects - users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.jwt()->>'sub' = user_id);

-- Enable Row Level Security (RLS) on canvas_elements table
ALTER TABLE canvas_elements ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for canvas_elements - users can only see elements from their projects
CREATE POLICY "Users can view their own canvas elements"
  ON canvas_elements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_elements.project_id
      AND projects.user_id = auth.jwt()->>'sub'
    )
  );

-- Create RLS policy for canvas_elements - users can insert elements to their projects
CREATE POLICY "Users can insert canvas elements to their projects"
  ON canvas_elements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_elements.project_id
      AND projects.user_id = auth.jwt()->>'sub'
    )
  );

-- Create RLS policy for canvas_elements - users can update their canvas elements
CREATE POLICY "Users can update their own canvas elements"
  ON canvas_elements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_elements.project_id
      AND projects.user_id = auth.jwt()->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_elements.project_id
      AND projects.user_id = auth.jwt()->>'sub'
    )
  );

-- Create RLS policy for canvas_elements - users can delete their canvas elements
CREATE POLICY "Users can delete their own canvas elements"
  ON canvas_elements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_elements.project_id
      AND projects.user_id = auth.jwt()->>'sub'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_project_id ON canvas_elements(project_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_elements_updated_at
  BEFORE UPDATE ON canvas_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
