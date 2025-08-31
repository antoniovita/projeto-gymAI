import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  color: string;
}

// Cores escuras - texto branco
const DARK_COLORS = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Roxo
  '#F43F5E', // Rosa escuro
  '#6B7280', // Cinza
  '#FF6B6B', // Coral
];

// Cores claras - texto preto
const LIGHT_COLORS = [
  '#EAB308', // Amarelo
  '#10B981', // Verde
  '#EC4899', // Rosa
  '#4ECDC4', // Turquesa
  '#34D399', // Verde Gastos
  '#FF7A7F', // Vermelho gastos
];

// Função para determinar a cor do texto baseada na cor de fundo
const getTextColor = (backgroundColor: string): 'white' | 'black' => {
  const color = backgroundColor.toUpperCase();
  if (DARK_COLORS.includes(color)) return 'white';
  if (LIGHT_COLORS.includes(color)) return 'black';
  return 'white'; // padrão para cores não listadas
};

interface CategoryFiltersProps {
  categories: Category[];
  selectedTypes: string[];
  onToggleCategory: (categoryName: string) => void;
  onAddNewCategory?: () => void;
  showAddButton?: boolean;
  addButtonText?: string;
  containerClassName?: string;
  selectedColor?: string;
  unselectedColor?: string;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedTypes,
  onToggleCategory,
  onAddNewCategory,
  addButtonText = "Nova Categoria",
  containerClassName = "flex flex-row flex-wrap gap-2 px-4 pb-4",
  unselectedColor = "bg-zinc-700"
}) => {
  return (
    <View className={containerClassName}>
      {categories.map((category) => {
        const isSelected = selectedTypes.includes(category.name);
        const textColor = getTextColor(category.color);
        
        return (
          <Pressable
            key={category.id}
            onPress={() => onToggleCategory(category.name)}
            className={`flex-row items-center gap-2 px-2 py-1 rounded-xl ${
              isSelected ? '' : unselectedColor
            }`}
            style={isSelected ? { backgroundColor: category.color } : undefined}
          >
            <Text className={`font-sans text-sm ${
              isSelected 
                ? (textColor === 'white' ? 'text-white' : 'text-black')
                : 'text-white'
            }`}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
      
      {categories.length == 0 ? (
        <Pressable
          onPress={onAddNewCategory}
          className={`flex-row items-center gap-2 px-2.5 py-1 rounded-xl ${unselectedColor}`}
        >
          <Ionicons name="add" size={16} color="white" />
          {categories.length == 0 && (
            <Text className="text-white text-sm font-sans">{addButtonText}</Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          onPress={onAddNewCategory}
          className={`flex-row items-center gap-2 px-1 py-1 rounded-full ${unselectedColor}`}
        >
          <Ionicons name="add" size={16} color="white" />
        </Pressable>
      )}

    </View>
  );
};

export default CategoryFilters;