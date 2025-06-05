export interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  hint?: string;
}

export interface QuizProgress {
  currentQuestionIndex: number;
  totalCorrect: number;
  completed: boolean;
}