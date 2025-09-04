import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  containerClassName = "flex flex-row flex-wrap gap-2 px-4 pb-4",
  unselectedColor = "bg-zinc-700",
}) => {
  return (
    <View className={containerClassName}>
      {categories.map((category) => {
        const isSelected = selectedTypes.includes(category.name);

        return (
          <Pressable
            key={category.id}
            onPress={() => onToggleCategory(category.name)}
            className='flex-row items-center gap-2 px-2 py-1 rounded-xl'
            style={isSelected? {backgroundColor: category.color} : {backgroundColor: "#3f3f46"} }
          >
            <View style={ isSelected ? {backgroundColor: "#000000", width: 10, height: 10, borderRadius: '100%' } : {backgroundColor: category.color, width: 10, height: 10, borderRadius: '100%' } }></View>

            <Text
              className={`font-sans text-sm ${
                isSelected ? 'text-black' : 'text-white'
              }`}
            >
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
