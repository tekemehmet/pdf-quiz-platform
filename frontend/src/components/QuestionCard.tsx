import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';

type QuestionType = 'multiple-choice' | 'open-ended';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedOption: number, openEndedAnswer?: string) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  questionType: QuestionType;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onNext,
  questionNumber,
  totalQuestions,
  questionType
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [openEndedAnswer, setOpenEndedAnswer] = useState('');

  // Reset state when question changes
  React.useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setTimeElapsed(0);
    setOpenEndedAnswer('');
  }, [question.id]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return;

    setSelectedOption(optionIndex);
    setShowResult(true);
    onAnswer(optionIndex);
  };

  const handleOpenEndedSubmit = () => {
    if (openEndedAnswer.trim() === '') return;
    
    setShowResult(true);
    onAnswer(0, openEndedAnswer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {questionNumber}
          </div>
          <span className="text-gray-500">of {totalQuestions}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
        {question.question}
      </h2>

      {questionType === 'multiple-choice' ? (
        /* Multiple Choice Options */
        <div className="space-y-4">
          {question.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ";
            
            if (showResult) {
              if (index === question.correctAnswer) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (index === selectedOption && index !== question.correctAnswer) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else {
              buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer text-gray-700";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-lg">{option}</span>
                  {showResult && index === question.correctAnswer && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {showResult && index === selectedOption && index !== question.correctAnswer && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Open-Ended Answer */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Answer:
            </label>
            <textarea
              value={openEndedAnswer}
              onChange={(e) => setOpenEndedAnswer(e.target.value)}
              placeholder="Write your detailed answer here..."
              className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-gray-700 leading-relaxed"
              disabled={showResult}
            />
          </div>
          
          {!showResult && (
            <button
              onClick={handleOpenEndedSubmit}
              disabled={openEndedAnswer.trim() === ''}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
              Submit Answer
            </button>
          )}
          
          {showResult && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Your Response:</h4>
              <p className="text-blue-700 mb-4">{openEndedAnswer}</p>
              <div className="text-sm text-blue-600">
                ✓ Answer submitted successfully
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {showResult && question.explanation && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            {questionType === 'multiple-choice' ? 'Explanation' : 'Sample Answer / Key Points'}
          </h3>
          <p className="text-blue-700">{question.explanation}</p>
        </div>
      )}

      {/* Next Question Button */}
      {showResult && (
        <div className="mt-8 text-center">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {questionNumber === totalQuestions ? 'View Results' : 'Next Question'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;