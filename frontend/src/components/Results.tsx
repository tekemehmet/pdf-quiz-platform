import React from 'react';
import { Question, Answer } from '../types/quiz';
import { Trophy, RotateCcw, CheckCircle, XCircle, Clock, Target } from 'lucide-react';

type QuestionType = 'multiple-choice' | 'open-ended';

interface ResultsProps {
  questions: Question[];
  answers: Answer[];
  onRestart: () => void;
  fileName: string;
  questionType: QuestionType;
}

const Results: React.FC<ResultsProps> = ({ questions, answers, onRestart, fileName, questionType }) => {
  const correctAnswers = questionType === 'multiple-choice' 
    ? answers.filter(answer => answer.isCorrect).length
    : answers.length; // For open-ended, we consider all as "completed"
  const totalQuestions = questions.length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
  const averageTime = Math.round(totalTime / answers.length / 1000);

  const getScoreColor = () => {
    if (questionType === 'open-ended') return 'text-blue-500';
    if (scorePercentage >= 80) return 'text-green-500';
    if (scorePercentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = () => {
    if (questionType === 'open-ended') return 'Quiz Completed! 🎉';
    if (scorePercentage >= 90) return 'Outstanding! 🎉';
    if (scorePercentage >= 80) return 'Great job! 👏';
    if (scorePercentage >= 70) return 'Good work! 👍';
    if (scorePercentage >= 60) return 'Not bad! 📚';
    return 'Keep studying! 💪';
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
        <p className="text-xl text-gray-600">{fileName}</p>
      </div>

      {/* Score Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-sm bg-opacity-90">
        <div className="text-center mb-8">
          {questionType === 'multiple-choice' ? (
            <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
              {scorePercentage}%
            </div>
          ) : (
            <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
              {totalQuestions}/{totalQuestions}
            </div>
          )}
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            {getScoreMessage()}
          </p>
          {questionType === 'multiple-choice' ? (
            <p className="text-gray-600">
              You got {correctAnswers} out of {totalQuestions} questions correct
            </p>
          ) : (
            <p className="text-gray-600">
              You completed all {totalQuestions} questions with detailed responses
            </p>
          )}
        </div>

        {/* Stats */}
        {questionType === 'multiple-choice' ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600 mb-1">
                {correctAnswers}
              </div>
              <p className="text-green-700 font-medium">Correct</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-xl">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-600 mb-1">
                {totalQuestions - correctAnswers}
              </div>
              <p className="text-red-700 font-medium">Incorrect</p>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {averageTime}s
              </div>
              <p className="text-blue-700 font-medium">Avg. Time</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalQuestions}
              </div>
              <p className="text-blue-700 font-medium">Questions Completed</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {averageTime}s
              </div>
              <p className="text-purple-700 font-medium">Avg. Time per Question</p>
            </div>
          </div>
        )}
      </div>

      {/* Question Review */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-sm bg-opacity-90">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Target className="w-6 h-6" />
          {questionType === 'multiple-choice' ? 'Question Review' : 'Your Responses'}
        </h2>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers[index];
            const isCorrect = questionType === 'multiple-choice' ? answer.isCorrect : true;

            return (
              <div
                key={question.id}
                className={`p-6 rounded-xl border-2 ${
                  questionType === 'open-ended' 
                    ? 'border-blue-200 bg-blue-50'
                    : isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    questionType === 'open-ended'
                      ? 'bg-blue-500'
                      : isCorrect 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {question.question}
                    </h3>
                    
                    {questionType === 'multiple-choice' ? (
                      <div className="space-y-2">
                        <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          Your answer: {question.options[answer.selectedOption]}
                          {isCorrect ? ' ✓' : ' ✗'}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-700 font-medium">
                            Correct answer: {question.options[question.correctAnswer]} ✓
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Time taken: {formatTime(answer.timeSpent)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-medium text-gray-700 mb-2">Your Response:</h4>
                          <p className="text-gray-600 leading-relaxed">{answer.openEndedAnswer}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Time taken: {formatTime(answer.timeSpent)}
                        </p>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <h4 className="font-medium text-gray-700 mb-2">
                          {questionType === 'multiple-choice' ? 'Explanation:' : 'Key Points to Consider:'}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          Try Another Quiz
        </button>
      </div>
    </div>
  );
};

export default Results;
