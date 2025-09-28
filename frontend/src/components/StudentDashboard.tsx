import React, { useState } from 'react';
import { BookOpen, LogOut, Play, Clock, CheckCircle } from 'lucide-react';
import Quiz from './Quiz';
import Results from './Results';
import { Quiz as QuizType, QuizResult, User as UserType } from '../types/user';
import { Answer } from '../types/quiz';

interface StudentDashboardProps {
  user: UserType;
  onLogout: () => void;
  availableQuizzes: QuizType[];
  onSubmitQuizResult: (result: Omit<QuizResult, 'id'>) => void;
  studentResults: QuizResult[];
}

type StudentView = 'dashboard' | 'quiz' | 'results';

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onLogout,
  availableQuizzes,
  onSubmitQuizResult,
  studentResults
}) => {
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Answer[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);

  const handleStartQuiz = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setQuizStartTime(Date.now());
    setCurrentView('quiz');
  };

  const handleQuizCompleted = (answers: Answer[]) => {
    if (!selectedQuiz || !user.studentNumber) return;

    const timeSpent = Date.now() - quizStartTime;
    const correctAnswers = selectedQuiz.questionType === 'multiple-choice' 
      ? answers.filter(answer => answer.isCorrect).length
      : answers.length;

    const result: Omit<QuizResult, 'id'> = {
      quizId: selectedQuiz.id,
      studentId: user.id,
      studentName: user.name,
      studentNumber: user.studentNumber,
      answers,
      score: correctAnswers,
      totalQuestions: selectedQuiz.questions.length,
      completedAt: new Date(),
      timeSpent
    };

    setQuizAnswers(answers);
    onSubmitQuizResult(result);
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedQuiz(null);
    setQuizAnswers([]);
  };

  const isQuizCompleted = (quizId: string) => {
    return studentResults.some(result => result.quizId === quizId);
  };

  const getQuizResult = (quizId: string) => {
    return studentResults.find(result => result.quizId === quizId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Student Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user.name} (#{user.studentNumber})
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <div>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{availableQuizzes.length}</h3>
                    <p className="text-gray-600">Available Quizzes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{studentResults.length}</h3>
                    <p className="text-gray-600">Completed Quizzes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-500 font-bold text-lg">%</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {studentResults.length > 0 
                        ? Math.round(studentResults.reduce((sum, result) => 
                            sum + (result.score / result.totalQuestions * 100), 0) / studentResults.length)
                        : 0}%
                    </h3>
                    <p className="text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Quizzes */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Quizzes</h2>
              
              {availableQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes available</h3>
                  <p className="text-gray-500">Check back later for new quizzes from your teachers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableQuizzes.map((quiz) => {
                    const completed = isQuizCompleted(quiz.id);
                    const result = getQuizResult(quiz.id);
                    
                    return (
                      <div key={quiz.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
                              {completed && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Completed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>📄 {quiz.fileName}</span>
                              <span>📝 {quiz.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                              <span>❓ {quiz.questions.length} questions</span>
                              <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
                            </div>
                            {completed && result && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className={`font-medium ${
                                  (result.score / result.totalQuestions * 100) >= 80 ? 'text-green-600' : 
                                  (result.score / result.totalQuestions * 100) >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  Score: {Math.round((result.score / result.totalQuestions) * 100)}% 
                                  ({result.score}/{result.totalQuestions})
                                </span>
                                <span className="text-gray-500">
                                  Completed: {new Date(result.completedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {completed ? (
                              <button
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  setQuizAnswers(result?.answers || []);
                                  setCurrentView('results');
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                              >
                                View Results
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartQuiz(quiz)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                              >
                                <Play className="w-4 h-4" />
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

            {/* Recent Results */}
            {studentResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Results</h2>
                <div className="space-y-4">
                  {studentResults
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .slice(0, 3)
                    .map((result) => {
                      const quiz = availableQuizzes.find(q => q.id === result.quizId);
                      const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
                      
                      return (
                        <div key={result.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">{quiz?.title}</h3>
                              <p className="text-sm text-gray-600">
                                Completed {new Date(result.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${
                              scorePercentage >= 80 ? 'text-green-500' : 
                              scorePercentage >= 60 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {scorePercentage}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'quiz' && selectedQuiz && (
          <Quiz
            questions={selectedQuiz.questions}
            onQuizCompleted={handleQuizCompleted}
            fileName={selectedQuiz.fileName}
            questionType={selectedQuiz.questionType}
          />
        )}

        {currentView === 'results' && selectedQuiz && (
          <Results
            questions={selectedQuiz.questions}
            answers={quizAnswers}
            onRestart={handleBackToDashboard}
            fileName={selectedQuiz.fileName}
            questionType={selectedQuiz.questionType}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;