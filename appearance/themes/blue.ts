import type { ThemeColors } from "../colors";
import { extra } from "../extra";

export const blueColors: ThemeColors = {
  primary: extra?.light?.primaryBlue ?? "#3B82F6",
  onPrimary: extra?.light?.onPrimary ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textTodayBlue ?? "#3B82F6",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  selected: extra?.light?.selectedBlue ?? "#3B82F6",
  taskIndicator: extra?.light?.taskIndicatorBlue ?? "#3B82F6",

  chevronColor: extra?.light?.chevronColorBlue ?? "#3B82F6",

  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  border: extra?.light?.border ?? "#404040",

  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActiveBlue ?? "#3B82F6",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  moreScreenHeader: extra?.light?.moreScreenHeaderBlue ?? "#27272A",
  moreScreenTitle: extra?.light?.moreScreenTitleBlue ?? "#FFFFFF",
  categoryTitle: extra?.light?.categoryTitleBlue ?? "#A3A3A3",
  itemBackground: extra?.light?.itemBackgroundBlue ?? "#35353A",
  itemTitle: extra?.light?.itemTitleBlue ?? "#FFFFFF",
  itemSubtitle: extra?.light?.itemSubtitleBlue ?? "#A3A3A3",
  itemIcon: extra?.light?.itemIconBlue ?? "#FFFFFF",
  settingsIcon: extra?.light?.settingsIconBlue ?? "#3B82F6",
  notesIcon: extra?.light?.notesIconBlue ?? "#3B82F6",
  premiumBackground: extra?.light?.premiumBackgroundBlue ?? "#35353A",
  premiumBadge: extra?.light?.premiumBadgeBlue ?? "#3B82F6",
  premiumTitle: extra?.light?.premiumTitleBlue ?? "#FFFFFF",
  premiumDescription: extra?.light?.premiumDescriptionBlue ?? "#A3A3A3",
  premiumPrice: extra?.light?.premiumPriceBlue ?? "#3B82F6",
  premiumButton: extra?.light?.premiumButtonBlue ?? "#3B82F6",
  premiumButtonText: extra?.light?.premiumButtonTextBlue ?? "#000000",
  appVersion: extra?.light?.appVersionBlue ?? "#A3A3A3",
  chevronIcon: extra?.light?.chevronIconBlue ?? "#A3A3A3",

  linearGradient: {
    primary: extra?.light?.linearGradient?.primaryBlue ?? ["#93C5FD", "#3B82F6", "#1D4ED8"],
    icon: extra?.light?.linearGradient?.iconBlue ?? ["#3B82F6", "#1D4ED8"],
  },
};
