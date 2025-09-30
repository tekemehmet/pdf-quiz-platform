@@ .. @@
 import React, { useState, useCallback } from 'react';
 import { Upload, FileText, Loader, CheckCircle2, Edit3 } from 'lucide-react';
 import { Question } from '../types/quiz';
-import { generateQuestionsFromPDF } from '../utils/questionGenerator';
+import { apiClient } from '../lib/api';

 type QuestionType = 'multiple-choice' | 'open-ended';

@@ .. @@
     try {
-      // Simulate processing time
-      await new Promise(resolve => setTimeout(resolve, 2000));
-      
-      const questions = await generateQuestionsFromPDF(file, questionType);
-      onPDFUploaded(file, questions, questionType);
+      const response = await apiClient.uploadPDF(file, questionType);
+      if (response.success && response.quiz) {
+        onPDFUploaded(file, response.quiz.questions, questionType);
+      } else {
+        throw new Error(response.message || 'Failed to process PDF');
+      }
     } catch (error) {
       console.error('Error processing PDF:', error);
-      alert('Error processing PDF. Please try again.');
+      alert(error instanceof Error ? error.message : 'Error processing PDF. Please try again.');
     } finally {
       setIsProcessing(false);
     }