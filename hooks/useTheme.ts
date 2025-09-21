//general imports
import { useTheme as useStyledTheme } from 'styled-components/native';

//types
import { AppTheme } from 'appearance';


export const useTheme = (): AppTheme => {
  return useStyledTheme() as AppTheme;
};