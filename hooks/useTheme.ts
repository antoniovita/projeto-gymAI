import { useTheme as useStyledTheme } from 'styled-components/native';
import { AppTheme } from 'theme/themes';

export const useTheme = (): AppTheme => {
  return useStyledTheme();
};