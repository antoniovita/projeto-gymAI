import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from 'components/HomeScreen';
import SchoolScreen from 'components/SchoolScreen';
import WorkScreen from 'components/WorkScreen';
import GymScreen from 'components/GymScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 70,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'School':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case 'Work':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Gym':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="School" component={SchoolScreen} />
      <Tab.Screen name="Work" component={WorkScreen} />
      <Tab.Screen name="Gym" component={GymScreen} />
    </Tab.Navigator>
  );
}
