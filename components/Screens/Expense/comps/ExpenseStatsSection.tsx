import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import GradientIcon from 'components/generalComps/GradientIcon';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ExpenseStatsSectionProps {
  onDateFilterPress: () => void;
  dateFilterDisplayText: string;
  gains: number;
  losses: number;
  formatLargeNumber: (value: number) => string;
  currencyFormat: (value: number) => string;
  isLargeNumber: (value: number) => boolean;
}

const ExpenseStatsSection: React.FC<ExpenseStatsSectionProps> = ({
  onDateFilterPress,
  dateFilterDisplayText,
  gains,
  losses,
  formatLargeNumber,
  currencyFormat,
  isLargeNumber,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const balance = gains - losses;
  const balanceColor =
    balance > 0 ? 'text-emerald-400' : balance < 0 ? 'text-[#ff7a7f]' : 'text-white';

  const formatValue = (value: number) =>
    isLargeNumber(value) ? formatLargeNumber(value) : currencyFormat(value);

  const hiddenValue = '••••••';

  return (
    <View className="relative mx-4 mb-4 rounded-2xl bg-[#35353a] px-4 h-[120px] flex-col justify-between py-4">

      {/* Header com filtro de data (já é absolute) */}
      <Pressable
        onPress={onDateFilterPress}
        className="flex-row gap-2 bg-zinc-800/80 items-center absolute left-4 px-3 rounded-b-xl py-1"
      >
        <View style={{width: 8, height: 8, borderRadius: '100%', backgroundColor: '#ffa41f'}}></View>
        <Text className="font-sans text-sm text-zinc-400">{dateFilterDisplayText}</Text>
      </Pressable>


      {/* Saldo central - agora absolute no centro, sem afetar o layout */}
      <View 
        className="absolute inset-0 items-center justify-center"
        pointerEvents="box-none"
      >
        <View className="items-center mt-8">
          <Text className={`text-3xl font-sans font-semibold text-white`}>
            {isVisible ? formatValue(balance) : hiddenValue}
          </Text>
          <Pressable 
            onPress={() => setIsVisible(!isVisible)}
            className=""
          >
            <Ionicons 
              name={isVisible ? "eye-outline" : "eye-off-outline"} 
              size={18} 
              color="#a1a1aa" 
            />
          </Pressable>
        </View>
      </View>

      {/* Espaçador para manter a posição do restante igual a antes */}
      <View className="mt-3.5" style={{ height: 48 }} />

      {/* Entradas e Saídas */}
      <View className="flex-row justify-between mb-2">
        {/* Entradas */}
        <View className="flex-row gap-2 items-center">
          <LinearGradient
          colors={['#FFD45A', '#FFA928', '#FF7A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 35,
              height: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 100, // número em RN
            }}
          >
            <Ionicons name="arrow-up" size={16} color="black" />
          </LinearGradient>
          <View className="flex-col">
            <Text className="text-xs font-sans text-zinc-500">Entradas</Text>
            <Text className="text-lg font-sans font-medium text-[#ffa41f]">
              {isVisible ? formatValue(gains) : hiddenValue}
            </Text>
          </View>
        </View>

        {/* Saídas */}
        <View className="flex-row gap-2 items-center">
          <LinearGradient
          colors={['#FFD45A', '#FFA928', '#FF7A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 35,
              height: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
            }}
          >
            <Ionicons name="arrow-down" size={16} color="black" />
          </LinearGradient>
          <View className="flex-col">
            <Text className="text-xs font-sans text-zinc-500">Saídas</Text>
            <Text className="text-lg font-sans font-medium text-[#ffa41f]">
              {isVisible ? formatValue(losses) : hiddenValue}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ExpenseStatsSection;