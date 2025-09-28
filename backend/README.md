# PDF Quiz Platform Backend

FastAPI backend for the PDF Quiz Platform with Supabase integration.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **Supabase Integration**: Database, authentication, and real-time features
- **AI Question Generation**: OpenAI GPT integration for generating quiz questions
- **PDF Processing**: Extract text from PDF documents
- **JWT Authentication**: Secure user authentication
- **Role-based Access**: Separate permissions for teachers and students
- **RESTful API**: Clean, well-documented API endpoints

## Quick Start

### 1. Environment Setup

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres

# API Configuration
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Setup

Run the database setup script:

```bash
python create_tables.py
```

This will:
- Verify your Supabase configuration
- Show you the SQL migrations to run in Supabase
- Create tables as a fallback using SQLAlchemy

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users/me` - Get current user profile
- `POST /api/v1/users/register` - Self-registration (students)

### Quizzes
- `GET /api/v1/quizzes/` - List published quizzes
- `POST /api/v1/quizzes/` - Create quiz (teachers only)
- `GET /api/v1/quizzes/{id}` - Get specific quiz
- `GET /api/v1/quizzes/my-quizzes` - List teacher's quizzes
- `DELETE /api/v1/quizzes/{id}` - Delete quiz

### Files
- `POST /api/v1/files/upload` - Upload PDF and generate quiz

### Results
- `POST /api/v1/results/` - Submit quiz result
- `GET /api/v1/results/my-results` - Get student's results
- `GET /api/v1/results/quiz/{id}` - Get quiz results (teachers)
- `GET /api/v1/results/all` - Get all results (teachers)

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `name` (String) - User's full name
- `email` (String) - Unique email address
- `hashed_password` (String) - Bcrypt hashed password
- `role` (Enum) - 'teacher' or 'student'
- `student_number` (String) - Optional student ID
- `created_at` (DateTime) - Account creation timestamp

### Quizzes Table
- `id` (UUID) - Primary key
- `title` (String) - Quiz title
- `file_name` (String) - Original PDF filename
- `question_type` (String) - 'multiple-choice' or 'open-ended'
- `questions` (JSON) - Array of question objects
- `created_by` (UUID) - Foreign key to users table
- `created_at` (DateTime) - Quiz creation timestamp
- `is_published` (Boolean) - Publication status

### Quiz Results Table
- `id` (UUID) - Primary key
- `quiz_id` (UUID) - Foreign key to quizzes table
- `student_id` (UUID) - Foreign key to users table
- `student_name` (String) - Student's name
- `student_number` (String) - Student's ID number
- `answers` (JSON) - Array of answer objects
- `score` (Integer) - Number of correct answers
- `total_questions` (Integer) - Total number of questions
- `completed_at` (DateTime) - Completion timestamp
- `time_spent` (Integer) - Time spent in milliseconds

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Students can only see published quizzes and their own results
- Teachers can manage their own quizzes and see all results
- Automatic policy enforcement at the database level

### Authentication
- JWT tokens with configurable expiration
- Bcrypt password hashing
- Role-based access control
- Secure session management

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

## Deployment

### Using Docker
```bash
docker build -t pdf-quiz-backend .
docker run -p 8000:8000 --env-file .env pdf-quiz-backend
```

### Environment Variables for Production
Make sure to set secure values for:
- `SECRET_KEY` - Use a cryptographically secure random string
- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- `OPENAI_API_KEY` - For AI question generation

## Troubleshooting

### Database Connection Issues
1. Verify Supabase project is active
2. Check connection string format
3. Ensure IP is whitelisted (Supabase allows all by default)
4. Test connection with `python create_tables.py`

### OpenAI API Issues
1. Verify API key is correct
2. Check account has sufficient credits
3. Monitor rate limits

### CORS Issues
1. Add your frontend domain to CORS origins
2. Check that credentials are properly configured
3. Verify request headers match allowed headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.