import { Image } from 'expo-image';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { quizQuestions } from '@/data/quizData';

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
  
  // クイズ範囲の設定
  const [selectedRange, setSelectedRange] = useState('all');
  
  // クイズIDから動的に範囲を作成
  const createRangesFromQuizData = () => {
    const ranges = [{ id: 'all', name: '全問題' }];
    
    // 問題数に応じて範囲を動的に作成
    const totalQuestions = quizQuestions.length;
    const rangeSize = 5; // 5問ごとに範囲を分ける
    
    for (let i = 0; i < totalQuestions; i += rangeSize) {
      const start = i + 1;
      const end = Math.min(i + rangeSize, totalQuestions);
      ranges.push({
        id: `${start}-${end}`,
        name: `問題${start}〜${end}`
      });
    }
    
    return ranges;
  };
  
  const quizRangesFromData = createRangesFromQuizData();
  
  // 選択した範囲でクイズを開始
  const startQuizWithRange = () => {
    // パラメータ付きでクイズ画面に遷移
    router.push({ 
      pathname: '/quiz',
      params: { range: selectedRange }
    });
  };
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A0D8F0', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
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
          ヒントボタンを押すか、間違えた場合にヒントが表示されます。ヒントを参考にもう一度挑戦してみましょう！
        </ThemedText>
      </ThemedView>
      
      {/* クイズ範囲選択を追加 */}
      <ThemedView style={styles.rangeSection}>
        <ThemedText type="subtitle">テスト範囲を選択</ThemedText>
        
        <RangeSelector
          title="テストする問題範囲"
          ranges={quizRangesFromData}
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
        />
      </ThemedView>
      
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: Colors[colorScheme].tint }]}
        onPress={startQuizWithRange}
      >
        <ThemedText style={styles.buttonText}>
          テストを始める
        </ThemedText>
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
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});
