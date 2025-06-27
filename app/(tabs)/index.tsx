import React, { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { quizQuestions } from '@/data/quizData';
import { IconSymbol } from '@/components/ui/IconSymbol';

// 範囲選択用のコンポーネント
function RangeSelector({
  title,
  ranges,
  selectedRange,
  onSelectRange
}: {
  title: string;
  ranges: { id: string; name: string }[];
  selectedRange: string;
  onSelectRange: (rangeId: string) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.rangeSelector}>
      <ThemedText style={styles.rangeSelectorTitle}>{title}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangesScrollView}>
        <View style={styles.rangesContainer}>
          {ranges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.rangeItem,
                selectedRange === range.id && {
                  backgroundColor: Colors[colorScheme].tint,
                }
              ]}
              onPress={() => onSelectRange(range.id)}
            >
              <ThemedText
                style={[
                  styles.rangeItemText,
                  selectedRange === range.id && { color: '#fff' }
                ]}
              >
                {range.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState('all');

  // 固定のテスト範囲を定義
  const quizRanges = [
    { id: 'all', name: '全問題' },
    { id: '1-13', name: '問題1〜13' },
    { id: '14-26', name: '問題14〜26' },
    { id: '27-45', name: '問題27〜45' },
    { id: '46-61', name: '問題46〜61' },
    { id: '62-74', name: '問題62〜74' }
  ];

  // 選択した範囲でクイズを開始
  const startQuizWithRange = () => {
    // パラメータ付きでクイズ画面に遷移
    router.push({
      pathname: '/quiz',
      params: {
        range: selectedRange,
        shuffle: 'true',  // デフォルトでシャッフルを有効に
        showHints: 'false' // デフォルトで自動ヒント表示を無効に
      }
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A0D8F0', dark: '#1D3D47' }}
      headerImage={
        <Image
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">学名テストへようこそ！</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">遊び方</ThemedText>
        <ThemedText>
          表示される植物名から学名を答えましょう。正解すると自動的に次の問題に進みます。
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">ヒントについて</ThemedText>
        <ThemedText>
          ヒントボタンを押すとヒントが表示されます。ヒントを参考にもう一度挑戦してみましょう！
        </ThemedText>
      </ThemedView>

      {/* クイズ範囲選択を追加 */}
      <ThemedView style={styles.rangeSection}>
        <ThemedText type="subtitle">テスト範囲を選択</ThemedText>

        <RangeSelector
          title="テストする問題範囲"
          ranges={quizRanges}
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
        />
      </ThemedView>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: Colors[colorScheme].tint }]}
        onPress={startQuizWithRange}
      >
        <View style={styles.startButtonContent}>
          <ThemedText style={styles.startButtonText}>
            テストを開始
          </ThemedText>
          <IconSymbol name="arrow.right" color="#FFF" size={20} />
        </View>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  startButton: {
    width: '100%',
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  // 範囲選択のスタイル
  rangeSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  rangeSelector: {
    marginTop: 8,
    marginBottom: 20,
  },
  rangeSelectorTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  rangesScrollView: {
    flexGrow: 0,
    marginBottom: 5,
  },
  rangesContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  rangeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  rangeItemText: {
    fontSize: 14,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  settingsButtonText: {
    marginLeft: 5,
    fontSize: 14,
  },
});
