import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { QuizQuestion } from '@/types/quiz';

interface QuizSampleListProps {
  questions: QuizQuestion[];
  maxDisplay?: number;
}

export function QuizSampleList({ questions, maxDisplay = 5 }: QuizSampleListProps) {
  // 表示する問題数を制限（すべてではなく一部のみ表示）
  const displayQuestions = questions.slice(0, maxDisplay);
  const hasMore = questions.length > maxDisplay;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>問題サンプル</ThemedText>
      <ScrollView style={styles.scrollView}>
        {displayQuestions.map((q, index) => (
          <ThemedView key={q.id} style={styles.questionItem}>
            <ThemedText style={styles.questionNumber}>問{index + 1}.</ThemedText>
            <ThemedText style={styles.questionText}>{q.question}</ThemedText>
          </ThemedView>
        ))}
        
        {hasMore && (
          <ThemedText style={styles.moreText}>
            ほか {questions.length - maxDisplay} 問...
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  title: {
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 150,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 40,
  },
  questionText: {
    flex: 1,
  },
  moreText: {
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 5,
  },
});