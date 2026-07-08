import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

type ColorSchemeType = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorSchemeType;
  colors: typeof Colors.light | typeof Colors.dark;
  spacing: typeof Spacing;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [scheme, setScheme] = useState<ColorSchemeType>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (systemScheme) {
      setScheme(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = Colors[scheme];

  return (
    <ThemeContext.Provider value={{ colorScheme: scheme, colors, spacing: Spacing, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
