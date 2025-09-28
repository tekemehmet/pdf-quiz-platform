import React, { useState } from 'react';
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

export default App;