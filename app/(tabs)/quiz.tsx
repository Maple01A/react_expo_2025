import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { QuizCard } from '@/components/QuizCard';
import { QuizInput } from '@/components/QuizInput';
import { QuizProgress } from '@/components/QuizProgress';
import { quizQuestions } from '@/data/quizData';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QuizQuestion } from '@/types/quiz';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function QuizScreen() {
  // URLパラメータから設定を取得
  const params = useLocalSearchParams<{
    range?: string;
    shuffle?: string;
    showHints?: string;
  }>();
  const quizRange = params.range || 'all';
  const shouldShuffle = params.shuffle === 'true';
  const shouldShowHints = params.showHints !== 'false'; // デフォルトはtrue

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]); // スキップした問題のインデックスを記録

  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  // 配列をシャッフルする関数
  const shuffleArray = (array: QuizQuestion[]): QuizQuestion[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 選択された範囲に基づいて問題をフィルタリング
  const getFilteredQuestions = (range: string): QuizQuestion[] => {
    let questions = [];

    if (range === 'all') {
      questions = [...quizQuestions];
    } else {
      // 範囲が "1-5" のような形式の場合
      const match = range.match(/(\d+)-(\d+)/);
      if (match) {
        const startId = parseInt(match[1]);
        const endId = parseInt(match[2]);

        questions = quizQuestions.filter(q => {
          const questionId = parseInt(q.id);
          return questionId >= startId && questionId <= endId;
        });
      } else if (!isNaN(Number(range))) {
        // 単一のIDの場合
        questions = quizQuestions.filter(q => q.id === range);
      } else {
        // デフォルトは全問題
        questions = [...quizQuestions];
      }
    }

    // シャッフルが有効な場合、問題の順序をシャッフル
    if (shouldShuffle) {
      console.log("問題をシャッフルします");
      return shuffleArray(questions);
    }

    return questions;
  };

  // フィルタリングされた問題
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);

  // 初回レンダリング時に問題をセットアップ
  useEffect(() => {
    const questions = getFilteredQuestions(quizRange);
    setFilteredQuestions(questions);
    // シャッフルのデバッグ出力
    if (shouldShuffle) {
      console.log("シャッフル後の問題ID:", questions.map(q => q.id).join(', '));
    }
  }, [quizRange, shouldShuffle]);

  const totalQuestions = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // クイズが完了したかチェックする
  useEffect(() => {
    if (currentQuestionIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCompleted(true);
    }
  }, [currentQuestionIndex, filteredQuestions.length]);

  // クイズ完了時のハプティックフィードバック
  useEffect(() => {
    if (completed && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completed]);

  // 回答をチェックする関数を修正
  const checkAnswer = (answer: string) => {
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
      // 不正解の場合、ヒント表示設定がONの場合のみヒントを表示
      if (shouldShowHints) {
        setShowHint(true);
      }

      // 不正解フィードバックを表示した後、フィードバックのみをリセット
      setTimeout(() => {
        setIsCorrect(null);
      }, 1500);
    }
  };

  // 問題をスキップする関数
  const skipQuestion = () => {
    // スキップした問題のインデックスを記録
    setSkippedQuestions(prev => [...prev, currentQuestionIndex]);
    
    // 次の問題へ進む
    nextQuestion();
    
    // haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // ヒントボタンを押したときの処理
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  // 次の問題へ進む
  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setIsCorrect(null);
    setShowHint(false);
  };

  // クイズをリセット - やり直しボタン用に直接リセットする関数
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setTotalCorrect(0);
    setIsCorrect(null);
    setShowHint(false);
    setCompleted(false);
    setSkippedQuestions([]); // スキップした問題もリセット
    
    // シャッフルが有効な場合は問題を再シャッフル
    if (shouldShuffle) {
      const reshuffledQuestions = getFilteredQuestions(quizRange);
      setFilteredQuestions(reshuffledQuestions);
    }
  };

  const progress = {
    currentQuestionIndex,
    totalCorrect,
    completed
  };

  // 問題がない場合の表示
  if (filteredQuestions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.noQuestionsContainer}>
          <IconSymbol
            size={48}
            name="exclamationmark.circle"
            color={Colors[colorScheme].tint}
          />
          <ThemedText type="subtitle" style={styles.noQuestionsText}>
            選択した範囲の問題がありません
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={() => router.replace('/explore')}
          >
            <ThemedText style={styles.buttonText}>
              設定画面に戻る
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  if (completed) {
    return (
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <ThemedView style={styles.resultContainer}>
            <ThemedText type="title" style={styles.resultTitle}>
              テスト完了！
            </ThemedText>

            <ThemedText type="subtitle" style={styles.resultScore}>
              {totalQuestions}問中{totalCorrect}問正解
            </ThemedText>

            <ThemedText style={styles.resultMessage}>
              {totalCorrect === totalQuestions
                ? '全問正解おめでとう！'
                : `正解率: ${Math.round((totalCorrect / totalQuestions) * 100)}%`}
            </ThemedText>

            {skippedQuestions.length > 0 && (
              <ThemedText style={styles.skippedInfo}>
                スキップした問題: {skippedQuestions.length}問
              </ThemedText>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={resetQuiz}
            >
              <ThemedText style={styles.buttonText}>
                もう一度挑戦する
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton]}
              onPress={() => router.replace('/')}
            >
              <ThemedText type="link">
                ホームに戻る
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>
      </ThemedView>
    );
  }

  // 問題がない場合やすべての問題に回答した場合の対応
  if (!currentQuestion || currentQuestionIndex >= filteredQuestions.length) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.noQuestionsContainer}>
          <IconSymbol
            size={48}
            name="exclamationmark.circle"
            color={Colors[colorScheme].tint}
          />
          <ThemedText type="subtitle" style={styles.noQuestionsText}>
            問題は終了しました
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={resetQuiz}
          >
            <ThemedText style={styles.buttonText}>
              テストをリセット
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  // 通常の問題表示
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.rangeInfo}>
            {quizRange === 'all' ? '全問題' : `問題範囲: ${quizRange}`}
          </ThemedText>
          {shouldShuffle && (
            <ThemedText style={styles.shuffleInfo}>
              シャッフルモード
            </ThemedText>
          )}
          {shouldShowHints && (
            <ThemedText style={styles.hintInfo}>
              自動ヒント表示オン
            </ThemedText>
          )}
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetQuiz}
          >
            <ThemedText style={styles.resetButtonText}>
              やり直す
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipQuestion}
          >
            <ThemedText style={styles.skipButtonText}>
              スキップ
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <QuizProgress progress={progress} totalQuestions={totalQuestions} />

      <Animated.View entering={FadeInDown.duration(300)}>
        <QuizCard
          question={currentQuestion}
          showHint={showHint}
        />
      </Animated.View>

      <ThemedText style={[
        styles.feedback,
        isCorrect === true ? styles.correctFeedback :
          isCorrect === false ? styles.incorrectFeedback : null
      ]}>
        {isCorrect === true ? '正解！' :
          isCorrect === false ? 'もう一度試してみましょう' : ''}
      </ThemedText>

      <QuizInput
        onSubmit={checkAnswer}
        onShowHint={toggleHint}
        isCorrect={isCorrect}
        showHint={showHint}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeInfo: {
    opacity: 0.7,
    fontSize: 14,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#555',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#FFD700',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#333',
  },
  feedback: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
    height: 25,
  },
  correctFeedback: {
    color: '#4CAF50',
  },
  incorrectFeedback: {
    color: '#F44336',
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultTitle: {
    marginBottom: 20,
  },
  resultScore: {
    marginBottom: 15,
  },
  resultMessage: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  skippedInfo: {
    fontSize: 16,
    marginBottom: 20,
    color: '#FFA500',
  },
  noQuestionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 100,
  },
  noQuestionsText: {
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 10,
  },
  shuffleInfo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  hintInfo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});