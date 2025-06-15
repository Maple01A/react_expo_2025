import { View, StyleSheet } from 'react-native';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';

interface QuizProgressProps {
  progress: {
    currentQuestionIndex: number;
    totalCorrect: number;
    completed: boolean;
  };
  totalQuestions: number;
}

export function QuizProgress({ progress, totalQuestions }: QuizProgressProps) {
  const progressPercent = (progress.currentQuestionIndex / totalQuestions) * 100;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>
        問題 {progress.currentQuestionIndex + 1}/{totalQuestions}
      </ThemedText>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercent}%` }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  text: {
    textAlign: 'center',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0a7ea4',
  },
});