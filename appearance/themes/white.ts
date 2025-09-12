import type { ThemeColors } from "../colors";
import { extra } from "../extra";

export const whiteColors: ThemeColors = {
  primary: extra?.light?.primaryWhite ?? "#FFFFFF",
  onPrimary: extra?.light?.onPrimaryWhite ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textTodayWhite ?? "#FFFFFF",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  selected: extra?.light?.selectedWhite ?? "#FFFFFF",
  taskIndicator: extra?.light?.taskIndicatorWhite ?? "#FFFFFF",

  chevronColor: extra?.light?.chevronColorWhite ?? "#FFFFFF",

  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  border: extra?.light?.border ?? "#404040",

  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActiveWhite ?? "#FFFFFF",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  moreScreenHeader: extra?.light?.moreScreenHeaderWhite ?? "#27272A",
  moreScreenTitle: extra?.light?.moreScreenTitleWhite ?? "#FFFFFF",
  categoryTitle: extra?.light?.categoryTitleWhite ?? "#A3A3A3",
  itemBackground: extra?.light?.itemBackgroundWhite ?? "#35353A",
  itemTitle: extra?.light?.itemTitleWhite ?? "#FFFFFF",
  itemSubtitle: extra?.light?.itemSubtitleWhite ?? "#A3A3A3",
  itemIcon: extra?.light?.itemIconWhite ?? "#FFFFFF",
  settingsIcon: extra?.light?.settingsIconWhite ?? "#FFFFFF",
  notesIcon: extra?.light?.notesIconWhite ?? "#FFFFFF",
  premiumBackground: extra?.light?.premiumBackgroundWhite ?? "#35353A",
  premiumBadge: extra?.light?.premiumBadgeWhite ?? "#FFFFFF",
  premiumTitle: extra?.light?.premiumTitleWhite ?? "#FFFFFF",
  premiumDescription: extra?.light?.premiumDescriptionWhite ?? "#A3A3A3",
  premiumPrice: extra?.light?.premiumPriceWhite ?? "#FFFFFF",
  premiumButton: extra?.light?.premiumButtonWhite ?? "#FFFFFF",
  premiumButtonText: extra?.light?.premiumButtonTextWhite ?? "#000000",
  appVersion: extra?.light?.appVersionWhite ?? "#A3A3A3",
  chevronIcon: extra?.light?.chevronIconWhite ?? "#A3A3A3",

  linearGradient: {
    primary: extra?.light?.linearGradient?.primaryWhite ?? ["#FFFFFF", "#F3F4F6", "#E5E7EB"],
    icon: extra?.light?.linearGradient?.iconWhite ?? ["#FFFFFF", "#E5E7EB"],
  },
};
