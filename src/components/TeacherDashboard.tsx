import React, { useState } from 'react';
import { User, Upload, Eye, Users, ChartBar as BarChart3, LogOut, Plus, FileText, ArrowLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import PDFUpload from './PDFUpload';
import { User as UserType } from '../types/user';
import { Question } from '../types/quiz';
import { useQuiz } from '../lib/QuizContext';
import { apiClient } from '../lib/api';

interface Quiz {
  id: string;
  title: string;
  file_name: string;
  question_type: 'multiple-choice' | 'open-ended';
  questions: Question[];
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

interface TeacherDashboardProps {
  user: UserType;
  onLogout: () => void;
}

type TeacherView = 'dashboard' | 'upload' | 'results' | 'student-answers';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onLogout
}) => {
  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [publishedQuizzes, setPublishedQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Load teacher's quizzes and results
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [quizzesData, resultsData] = await Promise.all([
          apiClient.getMyQuizzes(),
          apiClient.getAllResults()
        ]);
        setPublishedQuizzes(quizzesData);
        setQuizResults(resultsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePDFUploaded = (file: File, questions: Question[], questionType: 'multiple-choice' | 'open-ended') => {
    // Quiz is already created by the API, just refresh the list
    const loadQuizzes = async () => {
      try {
        const quizzesData = await apiClient.getMyQuizzes();
        setPublishedQuizzes(quizzesData);
      } catch (error) {
        console.error('Failed to refresh quizzes:', error);
      }
    };
    loadQuizzes();
    setCurrentView('dashboard');
  };

  const handleViewResults = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('results');
  };

  const handleViewStudentAnswers = (result: QuizResult) => {
    setSelectedResult(result);
    setCurrentView('student-answers');
  };

  const getQuizResults = (quizId: string) => {
    return quizResults.filter(result => result.quiz_id === quizId);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <button
          onClick={() => setCurrentView('upload')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{publishedQuizzes.length}</p>
              <p className="text-gray-600">Published Quizzes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{quizResults.length}</p>
              <p className="text-gray-600">Total Submissions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {quizResults.length > 0 
                  ? Math.round(quizResults.reduce((sum, result) => sum + (result.score / result.total_questions * 100), 0) / quizResults.length)
                  : 0}%
              </p>
              <p className="text-gray-600">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Published Quizzes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Published Quizzes</h2>
        </div>
        <div className="p-6">
          {publishedQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No quizzes yet</h3>
              <p className="text-gray-500 mb-6">Upload a PDF to create your first quiz</p>
              <button
                onClick={() => setCurrentView('upload')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedQuizzes.map((quiz) => {
                const results = getQuizResults(quiz.id);
                const averageScore = results.length > 0 
                  ? Math.round(results.reduce((sum, result) => sum + (result.score / result.total_questions * 100), 0) / results.length)
                  : 0;

                return (
                  <div key={quiz.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📄 {quiz.file_name}</span>
                          <span>📝 {quiz.question_type === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                          <span>❓ {quiz.questions.length} questions</span>
                          <span>👥 {results.length} submissions</span>
                          {results.length > 0 && <span>📊 {averageScore}% avg score</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewResults(quiz)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Results
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setSelectedQuiz(null);
            setCurrentView('dashboard');
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedQuiz ? `${selectedQuiz.title} - Results` : 'All Quiz Results'}
          </h1>
          <p className="text-gray-600">
            {selectedQuiz 
              ? `${getQuizResults(selectedQuiz.id).length} submissions`
              : `${quizResults.length} total submissions`
            }
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Student Submissions</h2>
        </div>
        <div className="p-6">
          {(selectedQuiz ? getQuizResults(selectedQuiz.id) : quizResults).length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No submissions yet</h3>
              <p className="text-gray-500">Students haven't taken this quiz yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedQuiz ? getQuizResults(selectedQuiz.id) : quizResults)
                .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                .map((result) => {
                  const quiz = publishedQuizzes.find(q => q.id === result.quiz_id);
                  return (
                    <div key={result.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {result.student_name} (#{result.student_number})
                          </h3>
                          {!selectedQuiz && quiz && (
                            <p className="text-gray-600">Quiz: {quiz.title}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">
                            {Math.round((result.score / result.total_questions) * 100)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            {result.score}/{result.total_questions} correct
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(result.completed_at).toLocaleDateString()}</span>
                        <span>⏱️ {Math.round(result.time_spent / 1000 / 60)}m {Math.round((result.time_spent / 1000) % 60)}s</span>
                        <button
                          onClick={() => handleViewStudentAnswers(result)}
                          className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
                        >
                          View Detailed Answers
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStudentAnswers = () => {
    if (!selectedResult) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('results')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedResult.student_name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>Student #: {selectedResult.student_number}</span>
                    <span>Quiz: {publishedQuizzes.find(q => q.id === selectedResult.quiz_id)?.title}</span>
                    <span>Completed: {new Date(selectedResult.completed_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">
                    {Math.round((selectedResult.score / selectedResult.total_questions) * 100)}%
                  </p>
                  <p className="text-gray-600">
                    {selectedResult.score}/{selectedResult.total_questions} correct
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total time: {formatTime(selectedResult.time_spent)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="space-y-6">
          {(() => {
            const quiz = publishedQuizzes.find(q => q.id === selectedResult.quiz_id);
            if (!quiz) return <p>Quiz not found</p>;
            
            return quiz.questions.map((question, index) => {
              const answer = selectedResult.answers[index];
              if (!answer) return null;
              
              const isCorrect = quiz.question_type === 'multiple-choice' ? answer.isCorrect : true;
              
              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-xl p-6 ${
                    quiz.question_type === 'open-ended' 
                      ? 'border-blue-200 bg-blue-50'
                      : isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      quiz.question_type === 'open-ended'
                        ? 'bg-blue-500'
                        : isCorrect 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                    }`}>
                      {quiz.question_type === 'open-ended' ? (
                        <FileText className="w-5 h-5" />
                      ) : isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Question {index + 1}: {question.question}
                      </h3>
                      
                      {quiz.question_type === 'multiple-choice' ? (
                        <div className="space-y-4">
                          {/* Student's Answer */}
                          <div className={`p-4 rounded-lg border-2 ${
                            isCorrect 
                              ? 'border-green-300 bg-green-100' 
                              : 'border-red-300 bg-red-100'
                          }`}>
                            <h4 className="font-medium text-gray-700 mb-2">Student's Answer:</h4>
                            <p className="text-gray-800">{answer.selectedOption}</p>
                          </div>
                          
                          {/* Correct Answer (if student was wrong) */}
                          {!isCorrect && (
                            <div className="p-4 rounded-lg border-2 border-green-300 bg-green-100">
                              <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
                              <p className="text-gray-800">{question.correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-100">
                          <h4 className="font-medium text-gray-700 mb-2">Student's Answer:</h4>
                          <p className="text-gray-800 whitespace-pre-wrap">{answer.openEndedAnswer}</p>
                        </div>
                      )}
                      
                      {/* Explanation */}
                      {question.explanation && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">
                            {quiz.question_type === 'multiple-choice' ? 'Explanation:' : 'Sample Answer / Key Points:'}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-800">QuizMaster</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('results')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'results'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                All Results
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'upload' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Create New Quiz</h1>
              </div>
              <PDFUpload onPDFUploaded={handlePDFUploaded} />
            </div>
          )}
          {currentView === 'results' && renderResults()}
          {currentView === 'student-answers' && renderStudentAnswers()}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;