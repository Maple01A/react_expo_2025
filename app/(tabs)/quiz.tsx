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
  // URLパラメータから範囲を取得
  const params = useLocalSearchParams<{ range?: string }>();
  const quizRange = params.range || 'all';

  // 選択された範囲に基づいて問題をフィルタリング
  const getFilteredQuestions = (range: string): QuizQuestion[] => {
    if (range === 'all') {
      return quizQuestions;
    }
    
    // 範囲が "1-5" のような形式の場合
    const match = range.match(/(\d+)-(\d+)/);
    if (match) {
      const startId = parseInt(match[1]);
      const endId = parseInt(match[2]);
      
      return quizQuestions.filter(q => {
        const questionId = parseInt(q.id);
        return questionId >= startId && questionId <= endId;
      });
    }
    
    // 単一のIDの場合
    if (!isNaN(Number(range))) {
      return quizQuestions.filter(q => q.id === range);
    }
    
    // デフォルトは全問題
    return quizQuestions;
  };
  
  // フィルタリングされた問題
  const filteredQuestions = getFilteredQuestions(quizRange);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  const totalQuestions = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  
  // クイズが完了したかチェックする
  useEffect(() => {
    if (currentQuestionIndex >= filteredQuestions.length) {
      setCompleted(true);
    }
  }, [currentQuestionIndex, filteredQuestions.length]);
  
  // クイズ完了時のハプティックフィードバック
  useEffect(() => {
    if (completed && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [completed]);
  
  // 回答をチェック
  const checkAnswer = (answer: string) => {
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
      // 不正解の場合、ヒントを表示し、1秒後にフィードバックをリセット
      setShowHint(true);
      
      // 不正解フィードバックを表示した後、フィードバックのみをリセット
      // これにより入力欄は引き続き使用可能に
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
  
  // リセット確認ダイアログを表示
  const confirmReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('テストをリセットしますか？\n進行状況は失われます。')) {
        resetQuiz();
      }
    } else {
      Alert.alert(
        'リセット確認',
        'テストをリセットしますか？\n進行状況は失われます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'リセット', onPress: () => resetQuiz(), style: 'destructive' }
        ]
      );
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
        <ThemedText style={styles.rangeInfo}>
          {quizRange === 'all' ? '全問題' : `問題範囲: ${quizRange}`}
        </ThemedText>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={confirmReset}
        >
          <ThemedText style={styles.resetButtonText}>
            やり直す
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <QuizProgress progress={progress} totalQuestions={totalQuestions} />
      
      <Animated.View entering={FadeInDown.duration(300)}>
        <QuizCard question={currentQuestion} showHint={showHint} />
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
});