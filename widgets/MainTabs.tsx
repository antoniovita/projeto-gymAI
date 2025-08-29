import React, { JSX } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // só pelo tipo do nome
import GradientIcon from 'components/GradientIcon';
import ChatScreen from 'components/ChatScreen';
import AgendaScreen from 'components/AgendaScreen';
import ExpensesScreen from 'components/ExpensesScreen';
import MoreScreen from 'components/MoreScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ffa41f',
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
          paddingTop: 20,
          ...(Platform.OS === 'android' && { 
            elevation: 0, 
            borderTopWidth: 0 
          }),
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarIcon: ({ focused }): React.ReactElement => {
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

          return (
            <GradientIcon 
              name={iconName} 
              mode="tab" 
              focused={focused} 
              size={30} 
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ tabBarLabel: 'Assistente' }} 
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