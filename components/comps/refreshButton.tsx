import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RefreshButton({ onPress }: { onPress: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePress = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onPress();
    setTimeout(() => {
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Ionicons name="reload-circle-outline" size={24} color="#ff7a7f" />
      </View>
    </TouchableOpacity>
  );
}
