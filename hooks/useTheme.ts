import { AppTheme } from 'appearance';
import { useTheme as useStyledTheme } from 'styled-components/native';

export const useTheme = (): AppTheme => {
  return useStyledTheme() as AppTheme;
};