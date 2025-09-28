export interface User {
  id: string;
  name: string;
  email: string;
  type: 'teacher' | 'student';
  studentNumber?: string;
}

export interface Quiz {
  id: string;
  title: string;
  fileName: string;
  questionType: 'multiple-choice' | 'open-ended';
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  isPublished: boolean;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeSpent: number;
}

import { Question, Answer } from './quiz';