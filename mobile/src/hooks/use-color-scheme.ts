import { useAppTheme } from '@/theme/ThemeProvider';

export function useColorScheme(): 'light' | 'dark' {
  try {
    return useAppTheme().colorScheme;
  } catch {
    return 'dark';
  }
}
