import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader, CheckCircle2, Edit3 } from 'lucide-react';
import { Question } from '../types/quiz';
import { generateQuestionsFromPDF } from '../utils/questionGenerator';

type QuestionType = 'multiple-choice' | 'open-ended';

interface PDFUploadProps {
  onPDFUploaded: (file: File, questions: Question[], questionType: QuestionType) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onPDFUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const questions = await generateQuestionsFromPDF(file, questionType);
      onPDFUploaded(file, questions, questionType);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onPDFUploaded, questionType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          PDF Quiz Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload your PDF document and get AI-generated questions for an interactive learning experience
        </p>
      </div>

      {/* Question Type Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Choose Question Type
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setQuestionType('multiple-choice')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              questionType === 'multiple-choice'
                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                questionType === 'multiple-choice' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <CheckCircle2 className={`w-6 h-6 ${
                  questionType === 'multiple-choice' ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Multiple Choice</h3>
                <p className="text-gray-600">Quick assessment with options</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Perfect for testing knowledge retention and understanding. Each question comes with 4 options and immediate feedback.
            </p>
            {questionType === 'multiple-choice' && (
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Selected
              </div>
            )}
          </button>

          <button
            onClick={() => setQuestionType('open-ended')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              questionType === 'open-ended'
                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                questionType === 'open-ended' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <Edit3 className={`w-6 h-6 ${
                  questionType === 'open-ended' ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Open-Ended</h3>
                <p className="text-gray-600">Detailed written responses</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Ideal for deeper understanding and critical thinking. Write detailed answers and get comprehensive feedback.
            </p>
            {questionType === 'open-ended' && (
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Selected
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
        {isProcessing ? (
          <div className="text-center py-16">
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Processing Your PDF
            </h3>
            <p className="text-gray-600 mb-4">
              Analyzing content and generating {questionType === 'multiple-choice' ? 'multiple choice' : 'open-ended'} questions...
            </p>
            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-red-500" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Upload Your PDF
            </h3>
            
            <p className="text-gray-600 mb-6">
              Drag and drop your PDF file here, or click to browse
            </p>
            
            <label className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors duration-200">
              <FileText className="w-5 h-5" />
              Choose PDF File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            
            <p className="text-sm text-gray-500 mt-4">
              Supported format: PDF (Max 10MB)
            </p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Selected:</strong> {questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'} questions
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-2">Upload PDF</h3>
          <p className="text-sm text-gray-600">
            Upload your study material or document
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-semibold mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-600">
            AI extracts key concepts and generates questions
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-500 font-bold text-lg">?</span>
          </div>
          <h3 className="font-semibold mb-2">Take Quiz</h3>
          <p className="text-sm text-gray-600">
            Answer questions and test your understanding
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;