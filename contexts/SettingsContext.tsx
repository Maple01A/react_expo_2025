import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  showHints: boolean;
  autoCorrection: boolean;
  caseSensitive: boolean;
  autoNext: boolean;
  shuffleQuestions: boolean;
  darkMode: boolean;
  setShowHints: (value: boolean) => void;
  setAutoCorrection: (value: boolean) => void;
  setCaseSensitive: (value: boolean) => void;
  setAutoNext: (value: boolean) => void;
  setShuffleQuestions: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
}

const defaultSettings: Omit<
  SettingsContextType,
  | 'setShowHints'
  | 'setAutoCorrection'
  | 'setCaseSensitive'
  | 'setAutoNext'
  | 'setShuffleQuestions'
  | 'setDarkMode'
> = {
  showHints: true,
  autoCorrection: true,
  caseSensitive: false,
  autoNext: true,
  shuffleQuestions: false,
  darkMode: false,
};

const SettingsContext = createContext<SettingsContextType>({
  ...defaultSettings,
  setShowHints: () => { },
  setAutoCorrection: () => { },
  setCaseSensitive: () => { },
  setAutoNext: () => { },
  setShuffleQuestions: () => { },
  setDarkMode: () => { },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  // 設定をロード
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // 設定を保存
  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setShowHints = (value: boolean) => {
    const newSettings = { ...settings, showHints: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setAutoCorrection = (value: boolean) => {
    const newSettings = { ...settings, autoCorrection: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setCaseSensitive = (value: boolean) => {
    const newSettings = { ...settings, caseSensitive: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setAutoNext = (value: boolean) => {
    const newSettings = { ...settings, autoNext: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setShuffleQuestions = (value: boolean) => {
    const newSettings = { ...settings, shuffleQuestions: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const setDarkMode = (value: boolean) => {
    const newSettings = { ...settings, darkMode: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setShowHints,
        setAutoCorrection,
        setCaseSensitive,
        setAutoNext,
        setShuffleQuestions,
        setDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};