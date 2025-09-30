@@ .. @@
 import React, { useState } from 'react';
 import { BookOpen, LogOut, Play, Clock, CheckCircle } from 'lucide-react';
 import Quiz from './Quiz';
 import Results from './Results';
-import { Quiz as QuizType, QuizResult, User as UserType } from '../types/user';
+import { User as UserType } from '../types/user';
 import { Answer } from '../types/quiz';
+import { useQuiz } from '../lib/QuizContext';
+import { apiClient } from '../lib/api';

+interface QuizType {
+  id: string;
+  title: string;
+  file_name: string;
+  question_type: 'multiple-choice' | 'open-ended';
+  questions: any[];
+  created_by: string;
+  created_at: string;
+  is_published: boolean;
+}
+
+interface QuizResult {
+  id: string;
+  quiz_id: string;
+  student_id: string;
+  student_name: string;
+  student_number: string;
+  answers: any[];
+  score: number;
+  total_questions: number;
+  completed_at: string;
+  time_spent: number;
+}
+
 interface StudentDashboardProps {
   user: UserType;
   onLogout: () => void;
-  availableQuizzes: QuizType[];
-  onSubmitQuizResult: (result: Omit<QuizResult, 'id'>) => void;
-  studentResults: QuizResult[];
 }

@@ .. @@
 const StudentDashboard: React.FC<StudentDashboardProps> = ({
   user,
-  onLogout,
-  availableQuizzes,
-  onSubmitQuizResult,
-  studentResults
+  onLogout
 }) => {
   const [currentView, setCurrentView] = useState<StudentView>('dashboard');
   const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
   const [quizAnswers, setQuizAnswers] = useState<Answer[]>([]);
   const [quizStartTime, setQuizStartTime] = useState<number>(0);
+  const [availableQuizzes, setAvailableQuizzes] = useState<QuizType[]>([]);
+  const [studentResults, setStudentResults] = useState<QuizResult[]>([]);
+  const [loading, setLoading] = useState(false);
+
+  // Load available quizzes and student results
+  React.useEffect(() => {
+    const loadData = async () => {
+      try {
+        setLoading(true);
+        const [quizzesData, resultsData] = await Promise.all([
+          apiClient.getQuizzes(),
+          apiClient.getMyResults()
+        ]);
+        setAvailableQuizzes(quizzesData);
+        setStudentResults(resultsData);
+      } catch (error) {
+        console.error('Failed to load data:', error);
+      } finally {
+        setLoading(false);
+      }
+    };
+    loadData();
+  }, []);

   const handleStartQuiz = (quiz: QuizType) => {
@@ .. @@
   const handleQuizCompleted = (answers: Answer[]) => {
     if (!selectedQuiz || !user.studentNumber) return;

     const timeSpent = Date.now() - quizStartTime;
-    const correctAnswers = selectedQuiz.questionType === 'multiple-choice' 
+    const correctAnswers = selectedQuiz.question_type === 'multiple-choice' 
       ? answers.filter(answer => answer.isCorrect).length
       : answers.length;

-    const result: Omit<QuizResult, 'id'> = {
-      quizId: selectedQuiz.id,
-      studentId: user.id,
-      studentName: user.name,
-      studentNumber: user.studentNumber,
+    const resultData = {
+      quiz_id: selectedQuiz.id,
+      student_id: user.id,
+      student_name: user.name,
+      student_number: user.studentNumber,
       answers,
       score: correctAnswers,
-      totalQuestions: selectedQuiz.questions.length,
-      completedAt: new Date(),
-      timeSpent
+      total_questions: selectedQuiz.questions.length,
+      time_spent: timeSpent
     };

     setQuizAnswers(answers);
-    onSubmitQuizResult(result);
-    setCurrentView('results');
+    
+    // Submit result to API
+    apiClient.submitQuizResult(resultData)
+      .then((result) => {
+        setStudentResults(prev => [...prev, result]);
+        setCurrentView('results');
+      })
+      .catch((error) => {
+        console.error('Failed to submit quiz result:', error);
+        alert('Failed to submit quiz result. Please try again.');
+      });
   };

@@ .. @@
   const isQuizCompleted = (quizId: string) => {
-    return studentResults.some(result => result.quizId === quizId);
+    return studentResults.some(result => result.quiz_id === quizId);
   };

   const getQuizResult = (quizId: string) => {
-    return studentResults.find(result => result.quizId === quizId);
+    return studentResults.find(result => result.quiz_id === quizId);
   };

@@ .. @@
                             <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
-                              <span>📄 {quiz.fileName}</span>
-                              <span>📝 {quiz.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
+                              <span>📄 {quiz.file_name}</span>
+                              <span>📝 {quiz.question_type === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                               <span>❓ {quiz.questions.length} questions</span>
-                              <span>📅 {new Date(quiz.createdAt).toLocaleDateString()}</span>
+                              <span>📅 {new Date(quiz.created_at).toLocaleDateString()}</span>
                             </div>
                             {completed && result && (
                               <div className="flex items-center gap-4 text-sm">
@@ .. @@
                                   ({result.score}/{result.totalQuestions})
                                 </span>
                                 <span className="text-gray-500">
-                                  Completed: {new Date(result.completedAt).toLocaleDateString()}
+                                  Completed: {new Date(result.completed_at).toLocaleDateString()}
                                 </span>
                               </div>
                             )}
@@ .. @@
                 <div className="space-y-4">
                   {studentResults
-                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
+                    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                     .slice(0, 3)
                     .map((result) => {
-                      const quiz = availableQuizzes.find(q => q.id === result.quizId);
-                      const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
+                      const quiz = availableQuizzes.find(q => q.id === result.quiz_id);
+                      const scorePercentage = Math.round((result.score / result.total_questions) * 100);
                       
                       return (
                         <div key={result.id} className="border border-gray-200 rounded-xl p-4">
@@ -1,7 +1,7 @@
                             <div>
                               <h3 className="font-semibold text-gray-800">{quiz?.title}</h3>
                               <p className="text-sm text-gray-600">
-                                Completed {new Date(result.completedAt).toLocaleDateString()}
+                                Completed {new Date(result.completed_at).toLocaleDateString()}
                               </p>
                             </div>
                             <div className={`text-xl font-bold ${
@@ .. @@
         {currentView === 'quiz' && selectedQuiz && (
           <Quiz
             questions={selectedQuiz.questions}
             onQuizCompleted={handleQuizCompleted}
-            fileName={selectedQuiz.fileName}
-            questionType={selectedQuiz.questionType}
+            fileName={selectedQuiz.file_name}
+            questionType={selectedQuiz.question_type}
           />
         )}

         {currentView === 'results' && selectedQuiz && (
           <Results
             questions={selectedQuiz.questions}
             answers={quizAnswers}
             onRestart={handleBackToDashboard}
-            fileName={selectedQuiz.fileName}
-            questionType={selectedQuiz.questionType}
+            fileName={selectedQuiz.file_name}
+            questionType={selectedQuiz.question_type}
           />
         )}
       </div>