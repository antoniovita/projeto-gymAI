import { JSX } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

type BaseProps = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
};

type TabModeProps = BaseProps & {
  mode: 'tab';
  focused: boolean;
};

type CustomModeProps = BaseProps & {
  mode: 'custom';
  colors: GradientColors;
  focused?: never; // não permite focused quando mode é custom
};

type DefaultModeProps = BaseProps & {
  mode?: 'default';
  focused?: never;
  colors?: never;
};

type Props = TabModeProps | CustomModeProps | DefaultModeProps;

export default function GradientIcon(props: Props): JSX.Element {
  const theme = useTheme();
  const { name, size = 24 } = props;
  
  // Cores "cold" baseadas no tema com transparência
  const convertToRgbaWithOpacity = (color: ColorValue): string => {
    const colorString = String(color);
    
    // Se já é rgba, apenas substitui a opacidade
    if (colorString.startsWith('rgba(')) {
      return colorString.replace(/,\s*[\d.]+\)$/, ', 0.55)');
    }
    
    // Se é rgb, converte para rgba
    if (colorString.startsWith('rgb(')) {
      return colorString.replace('rgb(', 'rgba(').replace(')', ', 0.55)');
    }
    
    // Se é hex, converte para rgba
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, 0.55)`;
    }
    
    return colorString;
  };

  // Garante que temos pelo menos 2 cores do tema
  const themeColors = theme.colors.linearGradient.primary;
  const primaryColors: GradientColors = themeColors.length >= 2 
    ? (themeColors as unknown as GradientColors)
    : ['#FFD45A', '#FFA928', '#FF7A00'] as const;

  const coldColors: GradientColors = [
    convertToRgbaWithOpacity(primaryColors[0]),
    convertToRgbaWithOpacity(primaryColors[1]),
    ...primaryColors.slice(2).map(convertToRgbaWithOpacity)
  ] as const;

  let colors: GradientColors;

  switch (props.mode) {
    case 'tab':
      colors = props.focused ? primaryColors : coldColors;
      break;
    case 'custom':
      colors = props.colors;
      break;
    case 'default':
    default:
      colors = primaryColors;
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
// 3. Modo Default (sempre cores do tema)
// <GradientIcon name="star" />
// <GradientIcon name="star" mode="default" />