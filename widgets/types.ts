import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  SettingsScreen: undefined;
};

export type MainTabsParamList = {
  Chat: {
    userName: string;
    pin: string;
    subscription: 'free' | 'premium';
  };
  Workout: {
    userName: string;
    pin: string;
    subscription: 'free' | 'premium';
  };
  Task: {
    userName: string;
    pin: string;
    subscription: 'free' | 'premium';
  };
  Agenda: {
    userName: string;
    pin: string;
    subscription: 'free' | 'premium';
  };
};

