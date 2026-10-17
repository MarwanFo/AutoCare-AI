import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { secureStore } from '@/storage/secureStore';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorSchemeType = 'light' | 'dark';

const THEME_STORAGE_KEY = 'autocare_theme_mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeType;
  isDark: boolean;
  colors: typeof Colors.light | typeof Colors.dark;
  spacing: typeof Spacing;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  // Load persisted theme preference from storage on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await secureStore.getItem(THEME_STORAGE_KEY);
        if (isMounted && stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
          setThemeModeState(stored as ThemeMode);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save persisted theme
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await secureStore.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = colorScheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // Resolved active color scheme based on user preference or system
  const colorScheme: ColorSchemeType = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const value = useMemo(
    () => ({
      themeMode,
      colorScheme,
      isDark,
      colors,
      spacing: Spacing,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, colorScheme, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
