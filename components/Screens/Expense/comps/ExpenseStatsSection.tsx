import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import GradientIcon from 'components/generalComps/GradientIcon';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'styled-components';

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
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const balance = gains - losses;
  const balanceColor = balance > 0 
    ? theme.colors.gain 
    : balance < 0 
    ? theme.colors.loss 
    : theme.colors.text;

  const formatValue = (value: number) =>
    isLargeNumber(value) ? formatLargeNumber(value) : currencyFormat(value);

  const hiddenValue = '••••••';

  return (
    <View style={{
      position: 'relative',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: 16,
      height: 120,
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingVertical: 16
    }}>
      {/* Header com filtro de data */}
      <Pressable
        onPress={onDateFilterPress}
        style={{
          flexDirection: 'row',
          gap: 8,
          backgroundColor: `${theme.colors.background}CC`, // 80% opacity
          alignItems: 'center',
          position: 'absolute',
          left: 16,
          paddingHorizontal: 12,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          paddingVertical: 4
        }}
      >
        <View style={{
          width: 8, 
          height: 8, 
          borderRadius: 4, 
          backgroundColor: theme.colors.primary
        }} />
        <Text style={{
          fontFamily: 'Poppins-Regular',
          fontSize: 14,
          color: theme.colors.textMuted
        }}>
          {dateFilterDisplayText}
        </Text>
      </Pressable>

      {/* Saldo central */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        pointerEvents="box-none"
      >
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{
            fontSize: 30,
            fontFamily: 'Poppins-SemiBold',
            color: balanceColor
          }}>
            {isVisible ? formatValue(balance) : hiddenValue}
          </Text>
          <Pressable onPress={() => setIsVisible(!isVisible)}>
            <Ionicons
              name={isVisible ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Espaçador para manter a posição do restante igual a antes */}
      <View style={{ marginTop: 14, height: 48 }} />

      {/* Entradas e Saídas */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        {/* Entradas */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LinearGradient
            colors={[...theme.colors.linearGradient.primary] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 35,
              height: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 17.5
            }}
          >
            <Ionicons name="arrow-up" size={16} color={theme.colors.onPrimary} />
          </LinearGradient>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              color: theme.colors.textMuted
            }}>
              Entradas
            </Text>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-Medium',
              color: theme.colors.primary
            }}>
              {isVisible ? formatValue(gains) : hiddenValue}
            </Text>
          </View>
        </View>

        {/* Saídas */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LinearGradient
            colors={[...theme.colors.linearGradient.primary] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 35,
              height: 35,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 17.5
            }}
          >
            <Ionicons name="arrow-down" size={16} color={theme.colors.onPrimary} />
          </LinearGradient>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              color: theme.colors.textMuted
            }}>
              Saídas
            </Text>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-Medium',
              color: theme.colors.primary
            }}>
              {isVisible ? formatValue(losses) : hiddenValue}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ExpenseStatsSection;