// navigationHelpers.ts

import type { NavigationProp } from '@react-navigation/native';

type TabNavigationParams = {
  MainTabs: {
    screen: 'Chat' | 'Agenda' | 'Expenses' | 'Workout';
    params?: {
      userName?: string;
      pin?: string;
      subscription?: 'free' | 'premium';
    };
  };
};

export const goToChatTab = (
  navigation: NavigationProp<TabNavigationParams>,
  userName?: string,
  pin?: string,
  subscription?: 'free' | 'premium'
) => {
  navigation.navigate('MainTabs', {
    screen: 'Chat',
    params: { userName, pin, subscription },
  });
};

export const goToWorkoutTab = (navigation: NavigationProp<TabNavigationParams>) => {
  navigation.navigate('MainTabs', {
    screen: 'Workout',
  });
};
