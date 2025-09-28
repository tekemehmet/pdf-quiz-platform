import React, { useState } from 'react';
import { User, Upload, Eye, Users, BarChart3, LogOut, Plus, FileText, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import PDFUpload from './PDFUpload';
import { Quiz, QuizResult, User as UserType } from '../types/user';
import { Question } from '../types/quiz';

interface TeacherDashboardProps {
  user: UserType;
  onLogout: () => void;
  publishedQuizzes: Quiz[];
  quizResults: QuizResult[];
  onPublishQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
}

type TeacherView = 'dashboard' | 'create-quiz' | 'view-results' | 'student-answers';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onLogout,
  publishedQuizzes,
  quizResults,
  onPublishQuiz
}) => {
  const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  const handlePDFUploaded = (file: File, questions: Question[], questionType: 'multiple-choice' | 'open-ended') => {
    const quiz: Omit<Quiz, 'id' | 'createdAt'> = {
      title: file.name.replace('.pdf', ''),
      fileName: file.name,
      questionType,
      questions,
      createdBy: user.id,
      isPublished: true
    };
    
    onPublishQuiz(quiz);
    setCurrentView('dashboard');
  };

  const getQuizResults = (quizId: string) => {
    return quizResults.filter(result => result.quizId === quizId);
  };

  const getAverageScore = (quizId: string) => {
    const results = getQuizResults(quizId);
    if (results.length === 0) return 0;
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleViewStudentAnswers = (result: QuizResult) => {
    setSelectedResult(result);
    setCurrentView('student-answers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
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
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{publishedQuizzes.length}</h3>
                    <p className="text-gray-600">Published Quizzes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{quizResults.length}</h3>
                    <p className="text-gray-600">Total Submissions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {publishedQuizzes.length > 0 
                        ? Math.round(publishedQuizzes.reduce((sum, quiz) => sum + getAverageScore(quiz.id), 0) / publishedQuizzes.length)
                        : 0}%
                    </h3>
                    <p className="text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setCurrentView('create-quiz')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Quiz
              </button>
              <button
                onClick={() => setCurrentView('view-results')}
                className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                View All Results
              </button>
            </div>

            {/* Published Quizzes */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Published Quizzes</h2>
              {publishedQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes published yet</h3>
                  <p className="text-gray-500 mb-6">Create your first quiz to get started</p>
                  <button
                    onClick={() => setCurrentView('create-quiz')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Create Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedQuizzes.map((quiz) => {
                    const results = getQuizResults(quiz.id);
                    const averageScore = getAverageScore(quiz.id);
                    
                    return (
                      <div key={quiz.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>📄 {quiz.fileName}</span>
                              <span>📝 {quiz.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                              <span>❓ {quiz.questions.length} questions</span>
                              <span>👥 {results.length} submissions</span>
                              {results.length > 0 && <span>📊 {averageScore}% avg score</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setCurrentView('view-results');
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                          >
                            View Results
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'create-quiz' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <PDFUpload onPDFUploaded={handlePDFUploaded} />
          </div>
        )}

        {currentView === 'view-results' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setSelectedQuiz(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedQuiz ? `Results for "${selectedQuiz.title}"` : 'All Quiz Results'}
              </h2>

              {quizResults.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No results yet</h3>
                  <p className="text-gray-500">Results will appear here when students complete quizzes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(selectedQuiz ? getQuizResults(selectedQuiz.id) : quizResults)
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .map((result) => {
                      const quiz = publishedQuizzes.find(q => q.id === result.quizId);
                      return (
                        <div key={result.id} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {result.studentName} (#{result.studentNumber})
                              </h3>
                              {!selectedQuiz && quiz && (
                                <p className="text-gray-600">Quiz: {quiz.title}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                result.score >= 80 ? 'text-green-500' : 
                                result.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {Math.round((result.score / result.totalQuestions) * 100)}%
                              </div>
                              <p className="text-sm text-gray-500">
                                {result.score}/{result.totalQuestions} correct
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📅 {new Date(result.completedAt).toLocaleDateString()}</span>
                            <span>⏱️ {Math.round(result.timeSpent / 1000 / 60)}m {Math.round((result.timeSpent / 1000) % 60)}s</span>
                            <button
                              onClick={() => handleViewStudentAnswers(result)}
                              className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
                            >
                              View Detailed Answers →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'student-answers' && selectedResult && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setCurrentView('view-results');
                  setSelectedResult(null);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Results
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Student Info Header */}
              <div className="border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedResult.studentName}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>Student #: {selectedResult.studentNumber}</span>
                      <span>Quiz: {publishedQuizzes.find(q => q.id === selectedResult.quizId)?.title}</span>
                      <span>Completed: {new Date(selectedResult.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold mb-2 ${
                      Math.round((selectedResult.score / selectedResult.totalQuestions) * 100) >= 80 ? 'text-green-500' : 
                      Math.round((selectedResult.score / selectedResult.totalQuestions) * 100) >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%
                    </div>
                    <p className="text-gray-600">
                      {selectedResult.score}/{selectedResult.totalQuestions} correct
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Total time: {formatTime(selectedResult.timeSpent)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Answers */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Answers</h2>
                
                {(() => {
                  const quiz = publishedQuizzes.find(q => q.id === selectedResult.quizId);
                  if (!quiz) return <p>Quiz not found</p>;
                  
                  return quiz.questions.map((question, index) => {
                    const answer = selectedResult.answers[index];
                    if (!answer) return null;
                    
                    const isCorrect = quiz.questionType === 'multiple-choice' ? answer.isCorrect : true;
                    
                    return (
                      <div
                        key={question.id}
                        className={`border-2 rounded-xl p-6 ${
                          quiz.questionType === 'open-ended' 
                            ? 'border-blue-200 bg-blue-50'
                            : isCorrect 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            quiz.questionType === 'open-ended'
                              ? 'bg-blue-500'
                              : isCorrect 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              {question.question}
                            </h3>
                            
                            {quiz.questionType === 'multiple-choice' ? (
                              <div className="space-y-4">
                                {/* Student's Answer */}
                                <div className={`p-4 rounded-lg border-2 ${
                                  isCorrect ? 'border-green-300 bg-green-100' : 'border-red-300 bg-red-100'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    {isCorrect ? (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-800">Student's Answer:</p>
                                      <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                        {String.fromCharCode(65 + answer.selectedOption)}. {question.options[answer.selectedOption]}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Correct Answer (if wrong) */}
                                {!isCorrect && (
                                  <div className="p-4 rounded-lg border-2 border-green-300 bg-green-100">
                                    <div className="flex items-center gap-3">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <div>
                                        <p className="font-medium text-gray-800">Correct Answer:</p>
                                        <p className="text-green-700">
                                          {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* All Options */}
                                <div className="space-y-2">
                                  <p className="font-medium text-gray-700">All Options:</p>
                                  {question.options.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className={`p-3 rounded-lg border ${
                                        optionIndex === question.correctAnswer
                                          ? 'border-green-300 bg-green-50 text-green-800'
                                          : optionIndex === answer.selectedOption && !isCorrect
                                            ? 'border-red-300 bg-red-50 text-red-800'
                                            : 'border-gray-200 bg-gray-50 text-gray-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {String.fromCharCode(65 + optionIndex)}.
                                        </span>
                                        <span>{option}</span>
                                        {optionIndex === question.correctAnswer && (
                                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                        )}
                                        {optionIndex === answer.selectedOption && !isCorrect && (
                                          <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* Open-ended answer */
                              <div className="space-y-4">
                                <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-100">
                                  <p className="font-medium text-blue-800 mb-2">Student's Response:</p>
                                  <div className="bg-white p-4 rounded-lg border">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {answer.openEndedAnswer || 'No response provided'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Time and Explanation */}
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Time spent: {formatTime(answer.timeSpent)}</span>
                              </div>
                              
                              {question.explanation && (
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-700 mb-2">
                                    {quiz.questionType === 'multiple-choice' ? 'Explanation:' : 'Sample Answer / Key Points:'}
                                  </h4>
                                  <p className="text-gray-600 text-sm leading-relaxed">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;