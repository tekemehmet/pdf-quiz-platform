# PDF Quiz Platform

A full-stack application for creating and taking quizzes from PDF documents using AI-generated questions.

## Features

- **PDF Upload**: Teachers can upload PDF documents
- **AI Question Generation**: Automatically generates multiple-choice or open-ended questions
- **Quiz Taking**: Students can take quizzes with real-time feedback
- **Results Tracking**: Teachers can view student results and analytics
- **User Management**: Separate dashboards for teachers and students

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- OpenAI GPT-3.5-turbo for question generation
- JWT authentication

## Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Supabase account and project
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Quiz
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > Database to get your connection string
   - Go to Settings > API to get your project URL and anon key

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your Supabase credentials and OpenAI API key
   ```

4. **Start the application**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Local Development

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   export SECRET_KEY=your-secret-key-here
   export SUPABASE_URL=your-supabase-url
   export SUPABASE_KEY=your-supabase-key
   export SUPABASE_DB_URL=your-supabase-db-url
   ```

5. **Start Redis (optional)**
   ```bash
   docker-compose up redis -d
   ```

6. **Run database migrations**
   ```bash
   # Create tables in Supabase
   python create_tables.py
   ```

7. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/users/register` - Self-registration

### Quizzes
- `GET /api/v1/quizzes/` - List published quizzes
- `GET /api/v1/quizzes/my-quizzes` - List teacher's quizzes
- `POST /api/v1/quizzes/` - Create quiz (teachers only)
- `GET /api/v1/quizzes/{id}` - Get specific quiz
- `DELETE /api/v1/quizzes/{id}` - Delete quiz

### Files
- `POST /api/v1/files/upload` - Upload PDF and generate quiz

### Results
- `POST /api/v1/results/` - Submit quiz result
- `GET /api/v1/results/my-results` - Get student's results
- `GET /api/v1/results/quiz/{id}` - Get quiz results (teachers)
- `GET /api/v1/results/all` - Get all results (teachers)

## Usage

### For Teachers
1. Register/Login as a teacher
2. Upload a PDF document
3. Choose question type (multiple-choice or open-ended)
4. Review generated questions
5. Publish the quiz
6. View student results and analytics

### For Students
1. Register/Login as a student
2. Browse available quizzes
3. Take quizzes with real-time feedback
4. View your results and progress

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for question generation | Yes |
| `SECRET_KEY` | JWT secret key | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_DB_URL` | Your Supabase database connection string | Yes |
| `REDIS_URL` | Redis connection URL (optional) | No |

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure Supabase project is active
   - Check Supabase credentials in environment variables
   - Verify database connection string format

2. **OpenAI API errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits

3. **CORS errors**
   - Ensure frontend and backend are running on correct ports
   - Check CORS configuration in `backend/app/main.py`

4. **File upload issues**
   - Ensure uploads directory exists
   - Check file permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
