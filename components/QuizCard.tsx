import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { QuizQuestion } from '@/types/quiz';

interface QuizCardProps {
  question: QuizQuestion | null;  // nullも許容するよう修正
  showHint: boolean;
}

export function QuizCard({ question, showHint }: QuizCardProps) {
  // questionがnullの場合は空のビューを返す
  if (!question) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.question}>
        {question.question}
      </ThemedText>
      {showHint && question.hint && (
        <ThemedView style={styles.hintContainer}>
          <ThemedText type="default" style={styles.hint}>
            ヒント: {question.hint}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

// 既存のスタイルはそのまま
const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 22,
  },
  hintContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hint: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});