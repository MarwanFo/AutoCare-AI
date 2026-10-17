import { useAppTheme } from '@/theme/ThemeProvider';
import { Colors } from '@/constants/theme';

export function useTheme() {
  try {
    return useAppTheme().colors;
  } catch {
    return Colors.dark;
  }
}
