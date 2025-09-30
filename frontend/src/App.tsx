import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import { apiClient } from './lib/api';
import { QuizProvider } from './lib/QuizContext';

type AppState = 'login' | 'teacher' | 'student' | 'loading';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'teacher' | 'student';
  studentNumber?: string;
}

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      apiClient.getCurrentUser()
        .then(userData => {
          setCurrentUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            type: userData.role,
            studentNumber: userData.student_number,
          });
          setAppState(userData.role);
        })
        .catch(() => {
          apiClient.clearToken();
          setAppState('login');
        });
    } else {
      setAppState('login');
    }
  }, []);

  const handleLogin = (userData: { id: string; name: string; email: string; type: 'teacher' | 'student'; studentNumber?: string; token: string }) => {
    apiClient.setToken(userData.token);

    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      type: userData.type,
      studentNumber: userData.studentNumber
    };

    setCurrentUser(user);
    setAppState(userData.type);
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setCurrentUser(null);
    setAppState('login');
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QuizProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {appState === 'login' && (
          <Login onLogin={handleLogin} />
        )}

        {appState === 'teacher' && currentUser && (
          <TeacherDashboard
            user={currentUser}
            onLogout={handleLogout}
          />
        )}

        {appState === 'student' && currentUser && (
          <StudentDashboard
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
      </div>
    </QuizProvider>
  );
}

export default App;
