# Supabase Setup Guide

This guide will help you set up Supabase for the PDF Quiz Platform.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `pdf-quiz-platform` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

### Project URL
1. Go to **Settings** > **API**
2. Copy the **Project URL** (looks like: `https://your-project-id.supabase.co`)

### API Keys
1. In the same **Settings** > **API** page
2. Copy the **anon public** key (starts with `eyJ...`)

### Database Connection String
1. Go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Select **URI** format
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres`)

## 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# API Configuration
SECRET_KEY=your-super-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

## 4. Create Database Tables

After setting up your environment variables, run:

```bash
cd backend
python create_tables.py
```

This will create all the necessary tables in your Supabase database.

## 5. Verify Setup

1. Start your application:
   ```bash
   docker-compose up --build
   ```

2. Check the Supabase dashboard:
   - Go to **Table Editor** in your Supabase project
   - You should see the following tables:
     - `users`
     - `quizzes`
     - `quiz_results`

## 6. Optional: Set up Row Level Security (RLS)

For production, you should enable Row Level Security:

1. Go to **Authentication** > **Policies** in Supabase
2. Create policies for each table to control access

### Example RLS Policies

**Users table:**
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);
```

**Quizzes table:**
```sql
-- Anyone can view published quizzes
CREATE POLICY "Anyone can view published quizzes" ON quizzes
FOR SELECT USING (is_published = true);

-- Teachers can manage their own quizzes
CREATE POLICY "Teachers can manage own quizzes" ON quizzes
FOR ALL USING (auth.uid() = created_by);
```

## 7. Database Schema

The application creates these tables:

### Users
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `hashed_password`
- `role` (teacher/student)
- `student_number` (Optional, for students)
- `created_at`

### Quizzes
- `id` (Primary Key)
- `title`
- `file_name`
- `question_type` (multiple-choice/open-ended)
- `questions` (JSON)
- `created_by` (Foreign Key to users)
- `created_at`
- `is_published`

### Quiz Results
- `id` (Primary Key)
- `quiz_id` (Foreign Key to quizzes)
- `student_id` (Foreign Key to users)
- `student_name`
- `student_number`
- `answers` (JSON)
- `score`
- `total_questions`
- `completed_at`
- `time_spent`

## Troubleshooting

### Connection Issues
- Verify your database password is correct
- Check that your IP is not blocked (Supabase allows all IPs by default)
- Ensure the connection string format is correct

### Table Creation Issues
- Make sure you have the correct permissions
- Check that the database exists and is accessible
- Verify your environment variables are set correctly

### Performance
- Supabase free tier has limits on database size and requests
- Consider upgrading for production use
- Monitor usage in the Supabase dashboard

## Next Steps

1. Test the application with sample data
2. Set up proper authentication policies
3. Configure backups and monitoring
4. Deploy to production when ready
