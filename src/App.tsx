import React, { useState } from 'react';
import { useEffect } from 'react';
import { testConnection } from './lib/supabase';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { User, Quiz, QuizResult } from './types/user';
import { Question } from './types/quiz';

type AppState = 'login' | 'teacher' | 'student';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publishedQuizzes, setPublishedQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Test Supabase connection on app load
  useEffect(() => {
    const checkConnection = async () => {
      console.log('🔍 Testing Supabase connection...');
      const isConnected = await testConnection();
      if (!isConnected) {
        console.error('❌ Supabase connection failed. Please check your configuration.');
        console.log('📋 To fix this:');
        console.log('1. Update your .env file with correct Supabase credentials');
        console.log('2. Make sure your Supabase project is active');
        console.log('3. Check that your API keys are correct');
      } else {
        console.log('✅ Supabase connection successful!');
      }
    };
    checkConnection();
  }, []);

  const handleLogin = (userData: { name: string; email: string; type: 'teacher' | 'student'; studentNumber?: string }) => {
    const user: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      type: userData.type,
      studentNumber: userData.studentNumber
    };
    
    setCurrentUser(user);
    setAppState(userData.type);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('login');
  };

  const handlePublishQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    const quiz: Quiz = {
      ...quizData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setPublishedQuizzes(prev => [...prev, quiz]);
  };

  const handleSubmitQuizResult = (resultData: Omit<QuizResult, 'id'>) => {
    const result: QuizResult = {
      ...resultData,
      id: Date.now().toString()
    };
    
    setQuizResults(prev => [...prev, result]);
  };

  const getStudentResults = (studentId: string) => {
    return quizResults.filter(result => result.studentId === studentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {appState === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {appState === 'teacher' && currentUser && (
        <TeacherDashboard
          user={currentUser}
          onLogout={handleLogout}
          publishedQuizzes={publishedQuizzes}
          quizResults={quizResults}
          onPublishQuiz={handlePublishQuiz}
        />
      )}
      
      {appState === 'student' && currentUser && (
        <StudentDashboard
          user={currentUser}
          onLogout={handleLogout}
          availableQuizzes={publishedQuizzes}
          onSubmitQuizResult={handleSubmitQuizResult}
          studentResults={getStudentResults(currentUser.id)}
        />
      )}
    </div>
  );
}