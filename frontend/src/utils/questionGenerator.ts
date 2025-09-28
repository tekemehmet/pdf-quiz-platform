import { Question } from '../types/quiz';

type QuestionType = 'multiple-choice' | 'open-ended';

// Mock question generator - In a real app, this would use an LLM API
export const generateQuestionsFromPDF = async (file: File, questionType: QuestionType): Promise<Question[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock multiple choice questions
  const multipleChoiceQuestions: Question[] = [
    {
      id: '1',
      question: 'What is the primary purpose of photosynthesis in plants?',
      options: [
        'To produce oxygen for animals',
        'To convert light energy into chemical energy',
        'To absorb water from soil',
        'To create chlorophyll'
      ],
      correctAnswer: 1,
      explanation: 'Photosynthesis is the process by which plants convert light energy, usually from the sun, into chemical energy stored in glucose molecules.',
      type: 'multiple-choice'
    },
    {
      id: '2',
      question: 'Which of the following best describes machine learning?',
      options: [
        'A type of computer hardware',
        'A programming language',
        'A method for computers to learn from data without explicit programming',
        'A database management system'
      ],
      correctAnswer: 2,
      explanation: 'Machine learning is a subset of artificial intelligence where computers learn to make predictions or decisions by finding patterns in data.',
      type: 'multiple-choice'
    },
    {
      id: '3',
      question: 'What is the main function of the mitochondria in a cell?',
      options: [
        'Protein synthesis',
        'DNA replication',
        'Energy production',
        'Waste disposal'
      ],
      correctAnswer: 2,
      explanation: 'Mitochondria are known as the powerhouses of the cell because they generate most of the cell\'s energy in the form of ATP through cellular respiration.',
      type: 'multiple-choice'
    },
    {
      id: '4',
      question: 'In object-oriented programming, what is encapsulation?',
      options: [
        'The process of creating multiple objects',
        'Hiding internal implementation details while exposing a public interface',
        'Inheriting properties from parent classes',
        'Converting code to machine language'
      ],
      correctAnswer: 1,
      explanation: 'Encapsulation is the principle of bundling data and methods together while hiding the internal implementation details from the outside world.',
      type: 'multiple-choice'
    },
    {
      id: '5',
      question: 'What is the significance of the greenhouse effect?',
      options: [
        'It only causes global warming',
        'It helps maintain Earth\'s temperature suitable for life',
        'It only affects plant growth',
        'It has no impact on climate'
      ],
      correctAnswer: 1,
      explanation: 'The greenhouse effect is essential for life on Earth as it helps maintain temperatures suitable for living organisms, though excess greenhouse gases can lead to climate change.',
      type: 'multiple-choice'
    }
  ];

  // Mock open-ended questions
  const openEndedQuestions: Question[] = [
    {
      id: '1',
      question: 'Explain the process of photosynthesis and its importance in the ecosystem.',
      options: [], // No options for open-ended
      correctAnswer: 0, // Not applicable for open-ended
      explanation: 'A comprehensive answer should include: the conversion of light energy to chemical energy, the role of chlorophyll, the production of glucose and oxygen, and the importance for food chains and oxygen production in ecosystems.',
      type: 'open-ended'
    },
    {
      id: '2',
      question: 'Describe how machine learning algorithms learn from data and provide examples of real-world applications.',
      options: [],
      correctAnswer: 0,
      explanation: 'A good answer should cover: pattern recognition in data, training and testing phases, different types of learning (supervised, unsupervised, reinforcement), and examples like recommendation systems, image recognition, or natural language processing.',
      type: 'open-ended'
    },
    {
      id: '3',
      question: 'Analyze the role of mitochondria in cellular respiration and energy production.',
      options: [],
      correctAnswer: 0,
      explanation: 'The answer should include: the structure of mitochondria, the process of cellular respiration, ATP production, the electron transport chain, and the relationship between oxygen consumption and energy production.',
      type: 'open-ended'
    },
    {
      id: '4',
      question: 'Compare and contrast the four main principles of object-oriented programming.',
      options: [],
      correctAnswer: 0,
      explanation: 'A complete answer should discuss: encapsulation (data hiding), inheritance (code reuse), polymorphism (multiple forms), and abstraction (simplification), with examples and how they work together.',
      type: 'open-ended'
    },
    {
      id: '5',
      question: 'Evaluate the causes and potential solutions for climate change, considering both natural and human factors.',
      options: [],
      correctAnswer: 0,
      explanation: 'The response should address: greenhouse gas emissions, deforestation, industrial activities, renewable energy solutions, policy changes, and individual actions, with a balanced analysis of challenges and opportunities.',
      type: 'open-ended'
    }
  ];
  // In a real implementation, you would:
  // 1. Extract text from the PDF
  // 2. Send the text to an LLM API (OpenAI, Claude, etc.)
  // 3. Parse the response to get structured questions
  // 4. Return the questions

  return questionType === 'multiple-choice' ? multipleChoiceQuestions : openEndedQuestions;
};