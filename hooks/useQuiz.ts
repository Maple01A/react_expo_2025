import { useState, useEffect } from 'react';
import { QuizQuestion, QuizProgress } from '@/types/quiz';

export function useQuiz(questions: QuizQuestion[]) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);

  // 現在の問題 - インデックスがオーバーしないようにする
  const currentQuestion = questions.length > currentQuestionIndex 
    ? questions[currentQuestionIndex] 
    : null;
  
  // 進行状況を追跡
  const progress: QuizProgress = {
    currentQuestionIndex,
    totalCorrect,
    completed,
  };

  // クイズが完了したかチェックする
  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      setCompleted(true);
    }
  }, [currentQuestionIndex, questions.length]);

  // 回答をチェック
  const checkAnswer = (answer: string) => {
    // currentQuestionが存在しない場合は何もしない
    if (!currentQuestion) return;
    
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase();
    
    const correct = normalizedAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setTotalCorrect(prev => prev + 1);
      
      // 少し遅延して次の問題に移動
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      // 不正解の場合、ヒントを表示
      setShowHint(true);
      
      // 不正解フィードバックを表示した後、フィードバックのみをリセット
      setTimeout(() => {
        setIsCorrect(null);
      }, 1500);
    }
  };
  
  // ヒントの表示/非表示を切り替え
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };
  
  // 次の問題へ進む
  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setIsCorrect(null);
    setShowHint(false);
  };
  
  // クイズをリセット
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setTotalCorrect(0);
    setIsCorrect(null);
    setShowHint(false);
    setCompleted(false);
  };

  return {
    currentQuestion,
    isCorrect,
    showHint,
    progress,
    completed,
    totalCorrect,
    totalQuestions: questions.length,
    checkAnswer,
    toggleHint,
    nextQuestion,
    resetQuiz
  };
}