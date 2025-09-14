import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Category {
  id: string;
  name: string;
  color: string;
}

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
}) => {

  const theme = useTheme();

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
    }}>
      {categories.map((category) => {
        const isSelected = selectedTypes.includes(category.name);
        return (
          <Pressable
            key={category.id}
            onPress={() => onToggleCategory(category.name)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: isSelected ? category.color : theme.colors.secondary,
            }}
          >
            <View style={{
              backgroundColor: isSelected ? theme.colors.onPrimary : category.color,
              width: 10,
              height: 10,
              borderRadius: 5,
            }} />
            <Text
              style={{
                fontFamily: 'Poppins',
                fontSize: 14,
                color: isSelected ? theme.colors.textSelected : theme.colors.text,
              }}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
      
      {categories.length === 0 ? (
        <Pressable
          onPress={onAddNewCategory}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.secondary,
          }}
        >
          <Ionicons name="add" size={16} color={theme.colors.text} />
          <Text style={{
            color: theme.colors.text,
            fontSize: 14,
            fontFamily: 'Poppins',
          }}>
            {addButtonText}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onAddNewCategory}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 4,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: theme.colors.secondary,
          }}
        >
          <Ionicons name="add" size={16} color={theme.colors.text} />
        </Pressable>
      )}
    </View>
  );
};

export default CategoryFilters;