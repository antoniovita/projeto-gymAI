import React, { JSX } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { View } from 'react-native';

// Tupla com >=2 cores
type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

const HOT_COLORS = ['#FFD45A', '#FFA928', '#FF7A00'] as const satisfies GradientColors;
const COLD_COLORS = [
  'rgba(255,212,90,0.55)',
  'rgba(255,169,40,0.55)',
  'rgba(255,122,0,0.55)',
] as const satisfies GradientColors;

type BaseProps = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
};

// Modo Tab - usa focused state
type TabModeProps = BaseProps & {
  mode: 'tab';
  focused: boolean;
};

// Modo Custom - permite cores customizadas
type CustomModeProps = BaseProps & {
  mode: 'custom';
  colors: GradientColors;
  focused?: never; // não permite focused quando mode é custom
};

// Modo Default - sempre usa as cores "hot"
type DefaultModeProps = BaseProps & {
  mode?: 'default';
  focused?: never;
  colors?: never;
};

type Props = TabModeProps | CustomModeProps | DefaultModeProps;

export default function GradientIcon(props: Props): JSX.Element {
  const { name, size = 24 } = props;
  
  let colors: GradientColors;

  switch (props.mode) {
    case 'tab':
      colors = props.focused ? HOT_COLORS : COLD_COLORS;
      break;
    case 'custom':
      colors = props.colors;
      break;
    case 'default':
    default:
      colors = HOT_COLORS;
      break;
  }

  return (
    <MaskedView
      maskElement={
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name={name} size={size} color="#000" />
        </View>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  );
}

// Exemplos de uso:

// 1. Modo Tab (para uso em Tab Navigator)
// <GradientIcon name="home" mode="tab" focused={true} />

// 2. Modo Custom (cores personalizadas)
// <GradientIcon 
//   name="heart" 
//   mode="custom" 
//   colors={['#FF6B6B', '#FF8E8E', '#FFB6B6']} 
// />

// 3. Modo Default (sempre "hot colors")
// <GradientIcon name="star" />
// <GradientIcon name="star" mode="default" />