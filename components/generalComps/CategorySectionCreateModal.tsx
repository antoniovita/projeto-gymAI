import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  name: string;
  color: string;
}

interface CategorySectionCreateModalProps {
  categories: Category[];
  selectedCategory: string[]; 
  onCategorySelect: (categoryName: string) => void;
}

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

const getTextColor = (backgroundColor: string): 'white' | 'black' => {
  const color = backgroundColor.toUpperCase();
  if (DARK_COLORS.includes(color)) return 'white';
  if (LIGHT_COLORS.includes(color)) return 'black';
  return 'white'; 
};

const CategorySectionCreateModal: React.FC<CategorySectionCreateModalProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const handleCategorySelection = (categoryName: string) => {
    onCategorySelect(categoryName); 
  };

  return (
    <View className="mb-8">
      <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
        Categoria
      </Text>
      {categories.length > 0 ? (
        <View className="flex flex-row flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory.includes(category.name); 
            const textColor = getTextColor(category.color);
            return (
              <Pressable
                key={category.name}
                onPress={() => handleCategorySelection(category.name)}
                className={`flex-row items-center gap-2 px-2 py-1 rounded-xl ${
                  isSelected ? '' : 'bg-zinc-700'
                }`}
                style={isSelected ? { backgroundColor: category.color } : undefined}
              >
                <Text
                  className={`font-sans text-sm ${
                    isSelected
                      ? (textColor === 'white' ? 'text-white' : 'text-black')
                      : 'text-white'
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View className="bg-zinc-700/30 px-4 py-6 rounded-xl items-center justify-center">
          <Ionicons name="pricetag-outline" size={24} color="#71717a" />
          <Text className="text-zinc-400 text-base font-sans mt-2">
            Nenhuma categoria disponível
          </Text>
          <Text className="text-zinc-500 text-sm font-sans mt-1 text-center">
            Crie categorias para organizar suas despesas
          </Text>
        </View>
      )}
    </View>
  );
};

export default CategorySectionCreateModal;