import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs:  NavigatorScreenParams<MainTabsParamList>;
  SettingsScreen: undefined
};


export type MainTabsParamList = {
  Home: undefined;
  Chat: undefined;
  Workout: undefined;
  Agenda: undefined;
};
