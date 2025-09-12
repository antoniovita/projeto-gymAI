import { useTheme as useStyledTheme } from 'styled-components/native';
import { AppTheme } from 'appearance/themes';

export const useTheme = (): AppTheme => {
  return useStyledTheme();
};