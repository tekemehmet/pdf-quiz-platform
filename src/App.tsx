import React, { useState } from 'react';
import { useEffect } from 'react';
import { testConnection } from './lib/supabase';
import Login from './components/Login';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [publishedQuizzes, setPublishedQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Test Supabase connection on app load
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      if (!isConnected) {
        console.warn('⚠️ Supabase connection failed. Please check your configuration.');
      }
    };
    checkConnection();
  }, []);
}