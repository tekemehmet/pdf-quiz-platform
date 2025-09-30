import React, { useState } from 'react';
import { BookOpen, LogOut, Play, Clock, CircleCheck as CheckCircle } from 'lucide-react';
import Quiz from './Quiz';
import Results from './Results';
import { User as UserType } from '../types/user';
import { Answer } from '../types/quiz';
import { useQuiz } from '../lib/QuizContext';
import { apiClient } from '../lib/api';

interface QuizType {
  id: string;
  title: string;
  file_name: string;
  question_type: 'multiple-choice' | 'open-ended';
  questions: any[];
  created_by: string;
  created_at: string;
  is_published: boolean;
}

interface QuizResult {
  id: string;
  quiz_id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  answers: any[];
  score: number;
  total_questions: number;
  completed_at: string;
  time_spent: number;
}

interface StudentDashboardProps {
  user: UserType;
  onLogout: () => void;
}

type StudentView = 'dashboard' | 'quiz' | 'results';

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onLogout
}) => {
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Answer[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizType[]>([]);
  const [studentResults, setStudentResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Load available quizzes and student results
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [quizzesData, resultsData] = await Promise.all([
          apiClient.getQuizzes(),
          apiClient.getMyResults()
        ]);
        setAvailableQuizzes(quizzesData);
        setStudentResults(resultsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStartQuiz = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setQuizStartTime(Date.now());
    setCurrentView('quiz');
  };

  const handleQuizCompleted = (answers: Answer[]) => {
    if (!selectedQuiz || !user.studentNumber) return;

    const timeSpent = Date.now() - quizStartTime;
    const correctAnswers = selectedQuiz.question_type === 'multiple-choice' 
      ? answers.filter(answer => answer.isCorrect).length
      : answers.length;

    const resultData = {
      quiz_id: selectedQuiz.id,
      student_id: user.id,
      student_name: user.name,
      student_number: user.studentNumber,
      answers,
      score: correctAnswers,
      total_questions: selectedQuiz.questions.length,
      time_spent: timeSpent
    };

    setQuizAnswers(answers);
    
    // Submit result to API
    apiClient.submitQuizResult(resultData)
      .then((result) => {
        setStudentResults(prev => [...prev, result]);
        setCurrentView('results');
      })
      .catch((error) => {
        console.error('Failed to submit quiz result:', error);
        alert('Failed to submit quiz result. Please try again.');
      });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedQuiz(null);
    setQuizAnswers([]);
  };

  const isQuizCompleted = (quizId: string) => {
    return studentResults.some(result => result.quiz_id === quizId);
  };

  const getQuizResult = (quizId: string) => {
    return studentResults.find(result => result.quiz_id === quizId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Quizzes</p>
                    <p className="text-2xl font-semibold text-gray-900">{availableQuizzes.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{studentResults.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {studentResults.length > 0 
                        ? Math.round(studentResults.reduce((acc, result) => acc + (result.score / result.total_questions * 100), 0) / studentResults.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Quizzes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Quizzes</h2>
              </div>
              <div className="p-6">
                {availableQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No quizzes available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableQuizzes.map((quiz) => {
                      const completed = isQuizCompleted(quiz.id);
                      const result = getQuizResult(quiz.id);
                      
                      return (
                        <div key={quiz.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>📄 {quiz.file_name}</span>
                                <span>📝 {quiz.question_type === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                                <span>❓ {quiz.questions.length} questions</span>
                                <span>📅 {new Date(quiz.created_at).toLocaleDateString()}</span>
                              </div>
                              {completed && result && (
                                <div className="flex items-center gap-4 text-sm">
                                  <span className={`font-medium ${
                                    (result.score / result.total_questions) >= 0.7 ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    Score: {Math.round((result.score / result.total_questions) * 100)}%
                                    ({result.score}/{result.total_questions})
                                  </span>
                                  <span className="text-gray-500">
                                    Completed: {new Date(result.completed_at).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              {completed ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-5 w-5 mr-1" />
                                  <span className="text-sm font-medium">Completed</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartQuiz(quiz)}
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Quiz
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            {studentResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {studentResults
                      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                      .slice(0, 3)
                      .map((result) => {
                        const quiz = availableQuizzes.find(q => q.id === result.quiz_id);
                        const scorePercentage = Math.round((result.score / result.total_questions) * 100);
                        
                        return (
                          <div key={result.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-gray-800">{quiz?.title}</h3>
                                <p className="text-sm text-gray-600">
                                  Completed {new Date(result.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className={`text-xl font-bold ${
                                scorePercentage >= 70 ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {scorePercentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'quiz' && selectedQuiz && (
          <Quiz
            questions={selectedQuiz.questions}
            onQuizCompleted={handleQuizCompleted}
            fileName={selectedQuiz.file_name}
            questionType={selectedQuiz.question_type}
          />
        )}

        {currentView === 'results' && selectedQuiz && (
          <Results
            questions={selectedQuiz.questions}
            answers={quizAnswers}
            onRestart={handleBackToDashboard}
            fileName={selectedQuiz.file_name}
            questionType={selectedQuiz.question_type}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;