import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface QuizInputProps {
  onSubmit: (answer: string) => void;
  onShowHint: () => void;
  isCorrect: boolean | null;
  showHint: boolean;
}

export function QuizInput({ onSubmit, onShowHint, isCorrect, showHint }: QuizInputProps) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? 'light';

  // 入力欄に自動フォーカス
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // 正解の場合のみ入力欄をクリア
  useEffect(() => {
    if (isCorrect === null) {
      setAnswer('');
      inputRef.current?.focus();
    }
  }, [isCorrect]);

  // 不正解の場合、フォーカスを入力欄に戻す
  useEffect(() => {
    if (isCorrect === false) {
      // 少し遅延してからフォーカス（アニメーションなどの完了を待つ）
      setTimeout(() => {
        if (inputRef.current) {
          // ネイティブ環境とウェブ環境の違いに対応
          if (Platform.OS === 'web') {
            // ウェブでは setSelection は使えないのでフォーカスのみ
            inputRef.current.focus();

            // ウェブではプログラムで入力を全選択するのではなく、一度クリアして再入力する
            setAnswer('');
          } else {
            // ネイティブ環境では setSelection が使える
            inputRef.current.focus();
            inputRef.current.setSelection(0, answer.length);
          }
        }
      }, 300);
    }
  }, [isCorrect, answer]);

  const handleSubmit = () => {
    if (answer.trim()) {
      // ハプティックフィードバック（iOS向け）
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onSubmit(answer.trim());
    }
  };

  const handleShowHint = () => {
    // ハプティックフィードバック（iOS向け）
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onShowHint();
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: Colors[colorScheme].text,
            borderColor: isCorrect === true
              ? '#4CAF50'
              : isCorrect === false
                ? '#F44336'
                : Colors[colorScheme].icon,
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5'
          }
        ]}
        placeholder="答えを入力..."
        placeholderTextColor={Colors[colorScheme].icon}
        value={answer}
        onChangeText={setAnswer}
        autoCapitalize="none"
        autoCorrect={false}
        editable={isCorrect !== true}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme].tint,
              opacity: (isCorrect === true || !answer.trim()) ? 0.6 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={isCorrect === true || !answer.trim()}
        >
          <ThemedText style={styles.buttonText}>
            送信
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.hintButton,
            {
              backgroundColor: showHint ? '#F9A825' : Colors[colorScheme === 'dark' ? 'dark' : 'light'].background,
              borderColor: Colors[colorScheme].tint,
            }
          ]}
          onPress={handleShowHint}
        >
          <ThemedText style={[
            styles.hintButtonText,
            { color: showHint ? '#FFFFFF' : Colors[colorScheme].tint }
          ]}>
            ヒント
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});