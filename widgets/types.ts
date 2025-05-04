import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs:  NavigatorScreenParams<MainTabsParamList>;
  UserConfig: undefined
};


export type MainTabsParamList = {
  Home: undefined;
  School: undefined;
  Work: undefined;
  Gym: undefined;
};
