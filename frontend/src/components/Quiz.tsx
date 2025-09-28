import React, { useState, useEffect } from 'react';
import { Question, Answer } from '../types/quiz';
import QuestionCard from './QuestionCard';
import { ArrowLeft } from 'lucide-react';

type QuestionType = 'multiple-choice' | 'open-ended';

interface QuizProps {
  questions: Question[];
  onQuizCompleted: (answers: Answer[]) => void;
  fileName: string;
  questionType: QuestionType;
}

const Quiz: React.FC<QuizProps> = ({ questions, onQuizCompleted, fileName, questionType }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswer = (selectedOption: number, openEndedAnswer?: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - startTime;
    const isCorrect = questionType === 'multiple-choice' 
      ? selectedOption === currentQuestion.correctAnswer
      : true; // For open-ended, we'll evaluate later

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      timeSpent,
      openEndedAnswer,
    };

    setAnswers(prevAnswers => [...prevAnswers, answer]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onQuizCompleted(answers);
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6 text-gray-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {questionType === 'multiple-choice' ? 'Multiple Choice Quiz' : 'Open-Ended Quiz'}
              </h1>
              <p className="text-gray-600">{fileName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Question</p>
            <p className="text-2xl font-bold text-blue-500">
              {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={questions[currentQuestionIndex]}
        onAnswer={handleAnswer}
        onNext={handleNext}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        questionType={questionType}
      />
    </div>
  );
};

export default Quiz;