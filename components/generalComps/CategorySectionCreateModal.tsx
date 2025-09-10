import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  unselectedColor = "bg-zinc-700",
}) => {
  
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
                className={`flex-row items-center gap-2 px-2 py-1 rounded-xl ${
                  isSelected ? 'bg-[#1e1e1e]' : unselectedColor
                }`}
              >
                <View 
                  style={{
                    backgroundColor: category.color, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '100%'
                  }}
                />
                <Text
                  className={`font-poppins text-sm ${
                    isSelected ? 'text-white' : 'text-white'
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
          
          {onAddNewCategory && (
            <Pressable
              onPress={onAddNewCategory}
              className={`flex-row items-center gap-2 px-1 py-1 rounded-full ${unselectedColor}`}
            >
              <Ionicons name="add" size={16} color="white" />
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={onAddNewCategory}
          className={`flex-row items-center gap-2 px-2.5 py-1 rounded-xl ${unselectedColor}`}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-sm font-poppins">{addButtonText}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default CategorySectionCreateModal;