import { blueColors } from "./themes/blue";
import { defaultColors } from "./themes/default";
import { whiteColors } from "./themes/white";

export type { ThemeColors } from "./colors";

export const themes = {
  default: { colors: defaultColors },
  blue: { colors: blueColors },
  white: { colors: whiteColors },
} as const;

export type ThemeName = keyof typeof themes;
export type AppTheme = (typeof themes)["default"];
