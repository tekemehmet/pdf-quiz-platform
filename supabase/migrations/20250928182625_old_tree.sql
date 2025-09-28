/*
  # Initial Schema Setup for PDF Quiz Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique, not null)
      - `hashed_password` (text, not null)
      - `role` (text, not null, default 'student')
      - `student_number` (text, unique, nullable)
      - `created_at` (timestamptz, default now())

    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `file_name` (text, not null)
      - `question_type` (text, not null)
      - `questions` (jsonb, not null)
      - `created_by` (uuid, foreign key to users.id)
      - `created_at` (timestamptz, default now())
      - `is_published` (boolean, default true)

    - `quiz_results`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key to quizzes.id)
      - `student_id` (uuid, foreign key to users.id)
      - `student_name` (text, not null)
      - `student_number` (text, not null)
      - `answers` (jsonb, not null)
      - `score` (integer, not null)
      - `total_questions` (integer, not null)
      - `completed_at` (timestamptz, default now())
      - `time_spent` (integer, not null)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Students can only see their own data
    - Teachers can manage their own quizzes and see all results

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for common query patterns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  hashed_password text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
  student_number text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  file_name text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple-choice', 'open-ended')),
  questions jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_number text NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  time_spent integer NOT NULL,
  UNIQUE(quiz_id, student_id) -- Prevent duplicate submissions
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for quizzes table
CREATE POLICY "Anyone can view published quizzes" ON quizzes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage own quizzes" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'teacher'
      AND users.id = quizzes.created_by
    )
  );

CREATE POLICY "Teachers can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'teacher'
    )
  );

-- RLS Policies for quiz_results table
CREATE POLICY "Students can view own results" ON quiz_results
  FOR SELECT USING (auth.uid()::text = student_id::text);

CREATE POLICY "Students can insert own results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

CREATE POLICY "Teachers can view all results for their quizzes" ON quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      JOIN users ON users.id = quizzes.created_by
      WHERE quizzes.id = quiz_results.quiz_id
      AND users.id::text = auth.uid()::text
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view all results" ON quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'teacher'
    )
  );