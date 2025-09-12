import type { ThemeColors } from "./colors";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as any;

export const defaultColors: ThemeColors = {
  // Cores principais
  primary: extra?.light?.primary ?? "#FFA41F",
  onPrimary: extra?.light?.onPrimary ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  // Cores de texto
  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textToday ?? "#FFA41F",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  // Cores de estado
  selected: extra?.light?.selected ?? "#FFA41F",
  taskIndicator: extra?.light?.taskIndicator ?? "#FFA41F",

  // Cores de navegação
  chevronColor: extra?.light?.chevronColor ?? "#FFA41F",

  // Cores financeiras
  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  // Cores de ação/interação
  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  // Cores de separação/divisão
  border: extra?.light?.border ?? "#404040",

  // Cores da Tab Bar
  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActive ?? "#FFA41F",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  // MoreScreen - Cores específicas
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

  // Gradientes lineares
  linearGradient: {
    primary: extra?.light?.linearGradient?.primary ?? ["#FFD45A", "#FFA928", "#FF7A00"],
    icon: extra?.light?.linearGradient?.icon ?? ["#FFA41F", "#FF7A00"],
  },
};

/** Versão azul: somente os tons laranja/amarelo foram trocados por azuis */
export const blueColors: ThemeColors = {
  // Cores principais (azul)
  primary: extra?.light?.primaryBlue ?? "#3B82F6",
  onPrimary: extra?.light?.onPrimary ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  // Cores de texto
  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textTodayBlue ?? "#3B82F6",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  // Cores de estado
  selected: extra?.light?.selectedBlue ?? "#3B82F6",
  taskIndicator: extra?.light?.taskIndicatorBlue ?? "#3B82F6",

  // Cores de navegação
  chevronColor: extra?.light?.chevronColorBlue ?? "#3B82F6",

  // Cores financeiras
  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  // Cores de ação/interação
  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  // Cores de separação/divisão
  border: extra?.light?.border ?? "#404040",

  // Cores da Tab Bar
  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActiveBlue ?? "#3B82F6",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  // MoreScreen - Cores específicas (versão azul)
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

  // Gradientes lineares (versão azul)
  linearGradient: {
    primary: extra?.light?.linearGradient?.primaryBlue ?? ["#93C5FD", "#3B82F6", "#1D4ED8"],
    icon: extra?.light?.linearGradient?.iconBlue ?? ["#3B82F6", "#1D4ED8"],
  },
};

/** Versão white: onde havia AZUL no tema azul passa a ser BRANCO */
export const whiteColors: ThemeColors = {
  // Cores principais (antes azuis → agora brancas)
  primary: extra?.light?.primaryWhite ?? "#FFFFFF",
  onPrimary: extra?.light?.onPrimaryWhite ?? "#000000",
  secondary: extra?.light?.secondary ?? "#35353A",
  background: extra?.light?.background ?? "#27272A",
  surface: extra?.light?.surface ?? "rgba(39, 39, 42, 0.8)",

  // Cores de texto
  text: extra?.light?.text ?? "#FFFFFF",
  textMuted: extra?.light?.textMuted ?? "#A3A3A3",
  textSelected: extra?.light?.textSelected ?? "#000000",
  textToday: extra?.light?.textTodayWhite ?? "#FFFFFF",
  textExpenseName: extra?.light?.textExpenseName ?? "#D1D5DB",
  textExpenseDate: extra?.light?.textExpenseDate ?? "#A3A3A3",

  // Cores de estado
  selected: extra?.light?.selectedWhite ?? "#FFFFFF",
  taskIndicator: extra?.light?.taskIndicatorWhite ?? "#FFFFFF",

  // Cores de navegação
  chevronColor: extra?.light?.chevronColorWhite ?? "#FFFFFF",

  // Cores financeiras
  gain: extra?.light?.gain ?? "#34D399",
  loss: extra?.light?.loss ?? "#FF7A7F",

  // Cores de ação/interação
  deleteAction: extra?.light?.deleteAction ?? "#F43F5E",
  deleteActionIcon: extra?.light?.deleteActionIcon ?? "#FFFFFF",

  // Cores de separação/divisão
  border: extra?.light?.border ?? "#404040",

  // Cores da Tab Bar
  tabBarBackground: extra?.light?.tabBarBackground ?? "#1E1E1E",
  tabBarActive: extra?.light?.tabBarActiveWhite ?? "#FFFFFF",
  tabBarInactive: extra?.light?.tabBarInactive ?? "#9CA3AF",

  // MoreScreen - Cores específicas (onde eram azuis → brancas)
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

  // Gradientes lineares (onde eram azuis → tons de branco/cinza claro)
  linearGradient: {
    primary: extra?.light?.linearGradient?.primaryWhite ?? ["#FFFFFF", "#F3F4F6", "#E5E7EB"],
    icon: extra?.light?.linearGradient?.iconWhite ?? ["#FFFFFF", "#E5E7EB"],
  },
};

export const themes = {
  default: { colors: defaultColors },
  blue: { colors: blueColors },
  white: { colors: whiteColors },
};

export type AppTheme = typeof themes.default;
