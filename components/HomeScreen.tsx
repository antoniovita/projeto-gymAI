import Constants from 'expo-constants';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  const statusBarHeight = Constants.statusBarHeight;

  return (
    <View className="h-screen bg-black p-3 px-8">
      <Text className="text-white font-bold text-4xl font-sans " style={{ marginTop: statusBarHeight + 50}}>Today</Text>

      <View>

      </View>
    </View>
  );
}
