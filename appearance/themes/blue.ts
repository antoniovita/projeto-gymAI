import type { ThemeColors } from "../colors";
import { extra } from "../extra";

export const blueColors: ThemeColors = {
  primary: extra?.light?.primaryBlue ?? "#06B6D4",
  onPrimary: extra?.light?.onPrimary ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",
  
  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textTodayBlue ?? "#06B6D4",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",
  
  selected: extra?.light?.selectedBlue ?? "#06B6D4",
  taskIndicator: extra?.light?.taskIndicatorBlue ?? "#06B6D4",
  
  chevronColor: extra?.light?.chevronColorBlue ?? "#06B6D4",
  
  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",
  
  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",
  
  border: extra?.light?.border ?? "#404040",
  
  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActiveBlue ?? "#06B6D4",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",
  
  moreScreenHeader: extra?.light?.moreScreenHeaderBlue ?? "#27272A",
  moreScreenTitle: extra?.light?.moreScreenTitleBlue ?? "#FFFFFF",
  categoryTitle: extra?.light?.categoryTitleBlue ?? "#A3A3A3",
  itemBackground: extra?.light?.itemBackgroundBlue ?? "#35353A",
  itemTitle: extra?.light?.itemTitleBlue ?? "#FFFFFF",
  itemSubtitle: extra?.light?.itemSubtitleBlue ?? "#A3A3A3",
  itemIcon: extra?.light?.itemIconBlue ?? "#FFFFFF",
  settingsIcon: extra?.light?.settingsIconBlue ?? "#06B6D4",
  notesIcon: extra?.light?.notesIconBlue ?? "#06B6D4",
  premiumBackground: extra?.light?.premiumBackgroundBlue ?? "#35353A",
  premiumBadge: extra?.light?.premiumBadgeBlue ?? "#06B6D4",
  premiumTitle: extra?.light?.premiumTitleBlue ?? "#FFFFFF",
  premiumDescription: extra?.light?.premiumDescriptionBlue ?? "#A3A3A3",
  premiumPrice: extra?.light?.premiumPriceBlue ?? "#06B6D4",
  premiumButton: extra?.light?.premiumButtonBlue ?? "#06B6D4",
  premiumButtonText: extra?.light?.premiumButtonTextBlue ?? "#000000",
  appVersion: extra?.light?.appVersionBlue ?? "#A3A3A3",
  chevronIcon: extra?.light?.chevronIconBlue ?? "#A3A3A3",

  // TaskModal - Cores específicas com tons de ciano
  modalBackground: extra?.light?.modalBackgroundBlue ?? "#27272A",
  modalHeaderText: extra?.light?.modalHeaderTextBlue ?? "#FFFFFF",
  modalSaveButton: extra?.light?.modalSaveButtonBlue ?? "#06B6D4",
  modalPlaceholder: extra?.light?.modalPlaceholderBlue ?? "#71717A",
  modalSectionTitle: extra?.light?.modalSectionTitleBlue ?? "#A1A1AA",
  modalInputBackground: extra?.light?.modalInputBackgroundBlue ?? "rgba(63, 63, 70, 0.5)",
  modalInputBorder: extra?.light?.modalInputBorderBlue ?? "#06B6D4",
  modalDescriptionBackground: extra?.light?.modalDescriptionBackgroundBlue ?? "rgba(63, 63, 70, 0.3)",
  modalDescriptionBorder: extra?.light?.modalDescriptionBorderBlue ?? "#52525B",
  datePickerAccent: extra?.light?.datePickerAccentBlue ?? "#22D3EE",
  datePickerButton: extra?.light?.datePickerButtonBlue ?? "#0891B2",

  linearGradient: {
    primary: extra?.light?.linearGradient?.primaryBlue ?? ["#67E8F9", "#06B6D4", "#0891B2"],
    icon: extra?.light?.linearGradient?.iconBlue ?? ["#06B6D4", "#0891B2"],
  },
};
