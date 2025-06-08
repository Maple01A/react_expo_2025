import { Image } from 'expo-image';
import { Platform, StyleSheet, Switch, View, Text } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { quizQuestions } from '@/data/quizData';
import { useRouter } from 'expo-router';

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

function SettingItem({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: string;
  children?: React.ReactNode;
}) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <IconSymbol size={24} name={icon} color={Colors[colorScheme].tint} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        {description && (
          <ThemedText style={styles.settingDescription}>{description}</ThemedText>
        )}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </ThemedView>
  );
}

export default function SettingsScreen() {
  // 既存のステート設定
  const [showHints, setShowHints] = useState(false); // デフォルトでfalse（自動ヒント表示しない）
  const [shuffleQuestions, setShuffleQuestions] = useState(true); // デフォルトでtrue（シャッフルする）
  const [darkMode, setDarkMode] = useState(useColorScheme() === 'dark');
  
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  // この設定でクイズを開始するボタンを追加
  const startQuizWithSettings = () => {
    router.push({
      pathname: '/quiz',
      params: {
        shuffle: shuffleQuestions ? 'true' : 'false',
        showHints: showHints ? 'true' : 'false'
      }
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A0D8F0', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">設定</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          クイズ設定
        </ThemedText>

        <SettingItem
          title="ヒント表示"
          description="不正解時に自動的にヒントを表示します"
          icon="lightbulb.fill">
          <Switch
            trackColor={{ false: '#767577', true: Colors[colorScheme].tint }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={setShowHints}
            value={showHints}
          />
        </SettingItem>

        <SettingItem
          title="問題をシャッフル"
          description="問題の順番をランダムにします"
          icon="shuffle">
          <Switch
            trackColor={{ false: '#767577', true: Colors[colorScheme].tint }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={setShuffleQuestions}
            value={shuffleQuestions}
          />
        </SettingItem>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          アプリ設定
        </ThemedText>

        <SettingItem
          title="ダークモード"
          description="アプリの表示テーマを変更します"
          icon="moon.fill">
          <Switch
            trackColor={{ false: '#767577', true: Colors[colorScheme].tint }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={setDarkMode}
            value={darkMode}
          />
        </SettingItem>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          アプリ情報
        </ThemedText>

        <SettingItem
          title="バージョン"
          description="1.0.0"
          icon="info.circle.fill"
        />

        <SettingItem
          title="開発者"
          description="ラウデンドン"
          icon="person.fill"
        />
      </ThemedView>
      
      <ThemedText style={styles.footer}>© 2025 学名テストアプリ</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // 既存のスタイル
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc30',
  },
  headerIcon: {
    marginRight: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc20',
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 3,
  },
  settingControl: {
    width: 60,
    alignItems: 'flex-end',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.5,
    fontSize: 12,
  },
  
  // 範囲選択のスタイル
  rangeSelector: {
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
  
  // スタートボタンのスタイル
  startButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 追加するスタイル
  backButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
