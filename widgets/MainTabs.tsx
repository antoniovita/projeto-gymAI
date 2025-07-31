import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import ChatScreen from 'components/ChatScreen';
import AgendaScreen from 'components/AgendaScreen';
import ExpensesScreen from 'components/ExpensesScreen';
import MoreScreen from 'components/MoreScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true, // mostra o nome abaixo do ícone
        tabBarActiveTintColor: '#ff7a7f',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingTop: 3
        },
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopWidth: 0,
          height: 110,
          paddingBottom: Platform.OS === 'android' ? 10 : 20,
          paddingTop: 10,
          ...(Platform.OS === 'android' && {
            elevation: 0,
            borderTopWidth: 0,
          }),
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Chat':
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              break;
            case 'Agenda':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'More':
              iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'Assistente' }} // nome alternativo
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarLabel: 'Agenda' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ tabBarLabel: 'Despesas' }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: 'Mais' }}
      />
    </Tab.Navigator>
  );
}
