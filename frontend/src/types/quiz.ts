export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'open-ended';
}

export interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
  openEndedAnswer?: string;
}