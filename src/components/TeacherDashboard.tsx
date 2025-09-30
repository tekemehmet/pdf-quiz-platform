@@ .. @@
 import React, { useState } from 'react';
 import { User, Upload, Eye, Users, BarChart3, LogOut, Plus, FileText, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
 import PDFUpload from './PDFUpload';
-import { Quiz, QuizResult, User as UserType } from '../types/user';
+import { User as UserType } from '../types/user';
 import { Question } from '../types/quiz';
+import { useQuiz } from '../lib/QuizContext';
+import { apiClient } from '../lib/api';

+interface Quiz {
+  id: string;
+  title: string;
+  file_name: string;
+  question_type: 'multiple-choice' | 'open-ended';
+  questions: Question[];
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
 interface TeacherDashboardProps {
   user: UserType;
   onLogout: () => void;
-  publishedQuizzes: Quiz[];
-  quizResults: QuizResult[];
-  onPublishQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
 }

@@ .. @@
 const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
   user,
-  onLogout,
-  publishedQuizzes,
-  quizResults,
-  onPublishQuiz
+  onLogout
 }) => {
   const [currentView, setCurrentView] = useState<TeacherView>('dashboard');
   const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
   const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
+  const [publishedQuizzes, setPublishedQuizzes] = useState<Quiz[]>([]);
+  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
+  const [loading, setLoading] = useState(false);
+
+  // Load teacher's quizzes and results
+  React.useEffect(() => {
+    const loadData = async () => {
+      try {
+        setLoading(true);
+        const [quizzesData, resultsData] = await Promise.all([
+          apiClient.getMyQuizzes(),
+          apiClient.getAllResults()
+        ]);
+        setPublishedQuizzes(quizzesData);
+        setQuizResults(resultsData);
+      } catch (error) {
+        console.error('Failed to load data:', error);
+      } finally {
+        setLoading(false);
+      }
+    };
+    loadData();
+  }, []);

   const handlePDFUploaded = (file: File, questions: Question[], questionType: 'multiple-choice' | 'open-ended') => {
-    const quiz: Omit<Quiz, 'id' | 'createdAt'> = {
-      title: file.name.replace('.pdf', ''),
-      fileName: file.name,
-      questionType,
-      questions,
-      createdBy: user.id,
-      isPublished: true
-    };
-    
-    onPublishQuiz(quiz);
+    // Quiz is already created by the API, just refresh the list
+    const loadQuizzes = async () => {
+      try {
+        const quizzesData = await apiClient.getMyQuizzes();
+        setPublishedQuizzes(quizzesData);
+      } catch (error) {
+        console.error('Failed to refresh quizzes:', error);
+      }
+    };
+    loadQuizzes();
     setCurrentView('dashboard');
   };

@@ .. @@
   const getQuizResults = (quizId: string) => {
-    return quizResults.filter(result => result.quizId === quizId);
+    return quizResults.filter(result => result.quiz_id === quizId);
   };

@@ .. @@
                             <div className="flex items-center gap-4 text-sm text-gray-600">
-                              <span>📄 {quiz.fileName}</span>
-                              <span>📝 {quiz.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
+                              <span>📄 {quiz.file_name}</span>
+                              <span>📝 {quiz.question_type === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'}</span>
                               <span>❓ {quiz.questions.length} questions</span>
                               <span>👥 {results.length} submissions</span>
                               {results.length > 0 && <span>📊 {averageScore}% avg score</span>}
@@ .. @@
                 <div className="space-y-4">
                   {(selectedQuiz ? getQuizResults(selectedQuiz.id) : quizResults)
-                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
+                    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                     .map((result) => {
-                      const quiz = publishedQuizzes.find(q => q.id === result.quizId);
+                      const quiz = publishedQuizzes.find(q => q.id === result.quiz_id);
                       return (
                         <div key={result.id} className="border border-gray-200 rounded-xl p-6">
                           <div className="flex items-center justify-between mb-4">
                             <div>
                               <h3 className="text-lg font-semibold text-gray-800">
-                                {result.studentName} (#{result.studentNumber})
+                                {result.student_name} (#{result.student_number})
                               </h3>
                               {!selectedQuiz && quiz && (
                                 <p className="text-gray-600">Quiz: {quiz.title}</p>
@@ .. @@
                             </div>
                           </div>
                           <div className="flex items-center gap-4 text-sm text-gray-600">
-                            <span>📅 {new Date(result.completedAt).toLocaleDateString()}</span>
-                            <span>⏱️ {Math.round(result.timeSpent / 1000 / 60)}m {Math.round((result.timeSpent / 1000) % 60)}s</span>
+                            <span>📅 {new Date(result.completed_at).toLocaleDateString()}</span>
+                            <span>⏱️ {Math.round(result.time_spent / 1000 / 60)}m {Math.round((result.time_spent / 1000) % 60)}s</span>
                             <button
                               onClick={() => handleViewStudentAnswers(result)}
                               className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
@@ .. @@
                 <div className="flex items-center justify-between">
                   <div>
                     <h1 className="text-3xl font-bold text-gray-800 mb-2">
-                      {selectedResult.studentName}
+                      {selectedResult.student_name}
                     </h1>
                     <div className="flex items-center gap-4 text-gray-600">
-                      <span>Student #: {selectedResult.studentNumber}</span>
-                      <span>Quiz: {publishedQuizzes.find(q => q.id === selectedResult.quizId)?.title}</span>
-                      <span>Completed: {new Date(selectedResult.completedAt).toLocaleDateString()}</span>
+                      <span>Student #: {selectedResult.student_number}</span>
+                      <span>Quiz: {publishedQuizzes.find(q => q.id === selectedResult.quiz_id)?.title}</span>
+                      <span>Completed: {new Date(selectedResult.completed_at).toLocaleDateString()}</span>
                     </div>
                   </div>
                   <div className="text-right">
@@ .. @@
                       {selectedResult.score}/{selectedResult.totalQuestions} correct
                     </p>
                     <p className="text-sm text-gray-500 mt-1">
-                      Total time: {formatTime(selectedResult.timeSpent)}
+                      Total time: {formatTime(selectedResult.time_spent)}
                     </p>
                   </div>
                 </div>
@@ .. @@
                 
                 {(() => {
-                  const quiz = publishedQuizzes.find(q => q.id === selectedResult.quizId);
+                  const quiz = publishedQuizzes.find(q => q.id === selectedResult.quiz_id);
                   if (!quiz) return <p>Quiz not found</p>;
                   
                   return quiz.questions.map((question, index) => {
@@ -1,7 +1,7 @@
                     if (!answer) return null;
                     
-                    const isCorrect = quiz.questionType === 'multiple-choice' ? answer.isCorrect : true;
+                    const isCorrect = quiz.question_type === 'multiple-choice' ? answer.isCorrect : true;
                     
                     return (
                       <div
                         key={question.id}
                         className={`border-2 rounded-xl p-6 ${
-                          quiz.questionType === 'open-ended' 
+                          quiz.question_type === 'open-ended' 
                             ? 'border-blue-200 bg-blue-50'
                             : isCorrect 
                               ? 'border-green-200 bg-green-50' 
@@ .. @@
                       <div className="flex items-start gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
-                            quiz.questionType === 'open-ended'
+                            quiz.question_type === 'open-ended'
                               ? 'bg-blue-500'
                               : isCorrect 
                                 ? 'bg-green-500' 
@@ .. @@
                               {question.question}
                             </h3>
                             
-                            {quiz.questionType === 'multiple-choice' ? (
+                            {quiz.question_type === 'multiple-choice' ? (
                               <div className="space-y-4">
                                 {/* Student's Answer */}
                                 <div className={`p-4 rounded-lg border-2 ${
@@ .. @@
                               {question.explanation && (
                                 <div className="p-4 bg-white rounded-lg border border-gray-200">
                                   <h4 className="font-medium text-gray-700 mb-2">
-                                    {quiz.questionType === 'multiple-choice' ? 'Explanation:' : 'Sample Answer / Key Points:'}
+                                    {quiz.question_type === 'multiple-choice' ? 'Explanation:' : 'Sample Answer / Key Points:'}
                                   </h4>
                                   <p className="text-gray-600 text-sm leading-relaxed">{question.explanation}</p>
                                 </div>