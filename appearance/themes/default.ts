import type { ThemeColors } from "../colors";
import { extra } from "../extra";

export const defaultColors: ThemeColors = {
  primary: extra?.light?.primary ?? "#FFA41F",
  onPrimary: extra?.light?.onPrimary ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textToday ?? "#FFA41F",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  selected: extra?.light?.selected ?? "#FFA41F",
  taskIndicator: extra?.light?.taskIndicator ?? "#FFA41F",

  chevronColor: extra?.light?.chevronColor ?? "#FFA41F",

  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  border: extra?.light?.border ?? "#404040",

  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActive ?? "#FFA41F",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  moreScreenHeader: extra?.light?.moreScreenHeader ?? "#27272A",
  moreScreenTitle: extra?.light?.moreScreenTitle ?? "#FFFFFF",
  categoryTitle: extra?.light?.categoryTitle ?? "#A3A3A3",
  itemBackground: extra?.light?.itemBackground ?? "#35353A",
  itemTitle: extra?.light?.itemTitle ?? "#FFFFFF",
  itemSubtitle: extra?.light?.itemSubtitle ?? "#A3A3A3",
  itemIcon: extra?.light?.itemIcon ?? "#FFFFFF",
  settingsIcon: extra?.light?.settingsIcon ?? "#FF7A7F",
  notesIcon: extra?.light?.notesIcon ?? "#FF7A7F",
  premiumBackground: extra?.light?.premiumBackground ?? "#35353A",
  premiumBadge: extra?.light?.premiumBadge ?? "#FFA41F",
  premiumTitle: extra?.light?.premiumTitle ?? "#FFFFFF",
  premiumDescription: extra?.light?.premiumDescription ?? "#A3A3A3",
  premiumPrice: extra?.light?.premiumPrice ?? "#FFA41F",
  premiumButton: extra?.light?.premiumButton ?? "#FFA41F",
  premiumButtonText: extra?.light?.premiumButtonText ?? "#000000",
  appVersion: extra?.light?.appVersion ?? "#A3A3A3",
  chevronIcon: extra?.light?.chevronIcon ?? "#A3A3A3",

  linearGradient: {
    primary: extra?.light?.linearGradient?.primary ?? ["#FFD45A", "#FFA928", "#FF7A00"],
    icon: extra?.light?.linearGradient?.icon ?? ["#FFA41F", "#FF7A00"],
  },
};
