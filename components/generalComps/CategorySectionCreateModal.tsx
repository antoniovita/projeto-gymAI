import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySectionCreateModalProps {
  categories: Category[];
  selectedCategory: string[];
  onCategorySelect: (categoryName: string) => void;
  onAddNewCategory?: () => void;
  showAddButton?: boolean;
  addButtonText?: string;
  containerClassName?: string;
  unselectedColor?: string;
}

const CategorySectionCreateModal: React.FC<CategorySectionCreateModalProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onAddNewCategory,
  addButtonText = "Nova Categoria",
  containerClassName = "mb-8",
  unselectedColor,
}) => {
  const theme = useTheme();

  const handleCategorySelection = (categoryName: string) => {
    onCategorySelect(categoryName);
  };

  return (
    <View className={containerClassName}>
      <Text className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
        Categoria
      </Text>
      {categories.length > 0 ? (
        <View className="flex flex-row flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory.includes(category.name);
            return (
              <Pressable
                key={category.id}
                onPress={() => handleCategorySelection(category.name)}
                className='flex-row items-center gap-2 px-2 py-1 rounded-xl'
                style={{
                  backgroundColor: isSelected 
                    ? category.color 
                    : theme.colors.secondary
                }}
              >
                <View
                  style={{
                    backgroundColor: isSelected ? theme.colors.onPrimary : category.color,
                    width: 10,
                    height: 10,
                    borderRadius: 5
                  }}
                />
                <Text
                  className={`font-poppins text-sm`}
                  style={{
                    color: isSelected ? theme.colors.textSelected : theme.colors.text
                  }}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View className="flex items-center justify-center">
          <View
            className="items-center rounded-xl py-8 px-6 w-full"
            style={{
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: theme.colors.border
            }}
          >
            <View 
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: `${theme.colors.surface}30` }}
            >
              <Ionicons
                name="folder-outline"
                size={40}
                color={theme.colors.textMuted}
              />
            </View>
            <Text 
              className="text-[15px] mb-2 text-center font-poppins-medium"
              style={{ color: theme.colors.text }}
            >
              Nenhuma categoria
            </Text>
            <Text 
              className="text-sm text-center leading-5 font-poppins opacity-80"
              style={{ color: theme.colors.textMuted }}
            >
              Suas categorias aparecerão aqui
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CategorySectionCreateModal;