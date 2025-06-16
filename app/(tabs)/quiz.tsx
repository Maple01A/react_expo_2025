import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
  
  // 状態管理
  const [shouldShuffle, setShouldShuffle] = useState(true); // デフォルトをtrueに
  const [shouldShowHints, setShouldShowHints] = useState(false); // デフォルトはfalse
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);

  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  // 初期設定の読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 保存された設定を読み込む
        const savedSettings = await AsyncStorage.getItem('quizSettings');
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          
          // パラメータが指定されている場合はそちらを優先、なければ保存値を使用
          if (params.shuffle !== undefined) {
            setShouldShuffle(params.shuffle === 'true');
          } else {
            setShouldShuffle(settings.shuffleQuestions);
          }
          
          if (params.showHints !== undefined) {
            setShouldShowHints(params.showHints === 'true');
          } else {
            setShouldShowHints(settings.showHints);
          }
          
          console.log('読み込んだ設定:', { 
            shuffleQuestions: settings.shuffleQuestions, 
            showHints: settings.showHints 
          });
        } else {
          // 設定がない場合はパラメータを使用、それもなければデフォルト値
          setShouldShuffle(params.shuffle === 'true' || true); // デフォルトtrue
          setShouldShowHints(params.showHints === 'true' || false); // デフォルトfalse
        }
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        // エラー時はパラメータを使用
        setShouldShuffle(params.shuffle === 'true' || true);
        setShouldShowHints(params.showHints === 'true' || false);
      }
    };

    loadSettings();
  }, [params.shuffle, params.showHints]);

  // 画面がフォーカスされるたびに設定を再読み込み
  useFocusEffect(
    React.useCallback(() => {
      // 設定の読み込み関数
      const loadSettings = async () => {
        try {
          const savedSettings = await AsyncStorage.getItem('quizSettings');
          
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // URLパラメータが指定されている場合はそれを優先
            if (params.shuffle !== undefined) {
              setShouldShuffle(params.shuffle === 'true');
            } else {
              setShouldShuffle(settings.shuffleQuestions);
            }
            
            if (params.showHints !== undefined) {
              setShouldShowHints(params.showHints === 'true');
            } else {
              setShouldShowHints(settings.showHints);
            }
            
            console.log('設定を再読み込みしました:', { 
              shuffleQuestions: settings.shuffleQuestions, 
              showHints: settings.showHints 
            });
          }
        } catch (error) {
          console.error('設定の読み込みに失敗しました:', error);
        }
      };

      loadSettings();
      
      return () => {
        // クリーンアップが必要な場合はここに記述
      };
    }, [])
  );

  // 配列をシャッフル
  const shuffleArray = (array: QuizQuestion[]): QuizQuestion[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 問題のフィルタリング
  const getFilteredQuestions = (range: string, shuffle: boolean): QuizQuestion[] => {
    let questions = [];

    if (range === 'all') {
      questions = [...quizQuestions];
    } else {
      const match = range.match(/(\d+)-(\d+)/);
      if (match) {
        const startId = parseInt(match[1]);
        const endId = parseInt(match[2]);

        questions = quizQuestions.filter(q => {
          const questionId = parseInt(q.id);
          return questionId >= startId && questionId <= endId;
        });
      } else if (!isNaN(Number(range))) {
        questions = quizQuestions.filter(q => q.id === range);
      } else {
        questions = [...quizQuestions];
      }
    }

    // シャッフルが有効な場合のみシャッフル
    if (shuffle) {
      return shuffleArray(questions);
    }

    return questions;
  };

  // フィルタリングされた問題
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([]);

  // 問題のセットアップ
  useEffect(() => {
    const questions = getFilteredQuestions(quizRange, shouldShuffle);
    setFilteredQuestions(questions);
    
    if (shouldShuffle) {
      console.log("問題をシャッフルしました");
    }
  }, [quizRange, shouldShuffle]);

  const totalQuestions = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  // クイズ完了のチェック
  useEffect(() => {
    if (currentQuestionIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCompleted(true);
    }
  }, [currentQuestionIndex, filteredQuestions.length]);

  // クイズ完了時のフィードバック
  useEffect(() => {
    if (completed && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completed]);

  // 回答チェック
  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;

    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase();

    const correct = normalizedAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);

    if (correct) {
      setTotalCorrect(prev => prev + 1);
      
      // 正解時に次の問題へ
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      // 不正解時、設定に応じてヒント表示
      if (shouldShowHints) {
        setShowHint(true);
      }

      setTimeout(() => {
        setIsCorrect(null);
      }, 1500);
    }
  };

  // 問題スキップ
  const skipQuestion = () => {
    setSkippedQuestions(prev => [...prev, currentQuestionIndex]);
    nextQuestion();
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // ヒント表示切替
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  // 次の問題へ
  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setIsCorrect(null);
    setShowHint(false);
  };

  // クイズリセット
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setTotalCorrect(0);
    setIsCorrect(null);
    setShowHint(false);
    setCompleted(false);
    setSkippedQuestions([]);
    
    // シャッフルが有効なら再シャッフル
    if (shouldShuffle) {
      const reshuffledQuestions = getFilteredQuestions(quizRange, true);
      setFilteredQuestions(reshuffledQuestions);
    }
  };

  const progress = {
    currentQuestionIndex,
    totalCorrect,
    completed
  };

  // 以下のレンダリングコード部分は変更なしで、そのまま維持します
  
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
            onPress={() => router.replace('/')}
          >
            <ThemedText style={styles.buttonText}>
              ホーム画面に戻る
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
          
          <ThemedText style={styles.settingInfo}>
            {shouldShuffle ? 'シャッフルモード: オン' : 'シャッフルモード: オフ'}
          </ThemedText>
          
          <ThemedText style={styles.settingInfo}>
            {shouldShowHints ? '自動ヒント表示: オン' : '自動ヒント表示: オフ'}
          </ThemedText>
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
  settingInfo: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
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