import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useExpenses } from '../hooks/useExpenses';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';

const EmptyState = ({ selectedCategory, onCreateExpense }: { selectedCategory: string, onCreateExpense: () => void }) => {
  const getCategoryMessage = (category: string) => {
    if (category === 'Ganhos') return 'ganhos';
    if (category === 'Gastos') return 'gastos';
    if (category) return `despesas de ${category.toLowerCase()}`;
    return 'despesas';
  };

  return (
    <View className="flex-1 justify-center items-center px-8 pb-20">
      <View className="items-center">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="wallet-outline" size={60} color="gray" />
        </View>

        <Text className="text-neutral-400 text-xl font-medium font-sans mb-2 text-center">
          Nenhuma despesa
        </Text>

        <Text
          className="text-neutral-400 text-sm font-sans mb-4 text-center"
          style={{ maxWidth: 230 }}
        >
          Adicione suas despesas para controlar suas finanças
        </Text>
      </View>
    </View>
  );
};

export default function ExpensesScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<{ name: string, color: string }[]>([]);
  const [taskContent, setTaskContent] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff7a7f');
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ name: string, color: string } | null>(null);

  const colorOptions = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#EAB308', // Amarelo
  '#10B981', // Verde
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#F43F5E', // Rosa escuro
  '#6B7280', // Cinza
];

  const [currentExpense, setCurrentExpense] = useState<any>(null);

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const { createExpense, fetchExpenses, expenses, deleteExpense, updateExpense, debugAllExpenses } = useExpenses();

  const { userId, loading } = useAuth();

  const categories = [
    { name: 'Ganhos', color: '#34D399' },
    { name: 'Gastos', color: '#ff7a7f' },
    ...selectedCategories
  ];

  const CATEGORIES_KEY = '@categories';

  const saveCategoriesToStorage = async (categories: { name: string, color: string }[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  };

  const loadCategoriesFromStorage = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (storedCategories) {
        setSelectedCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  
  const handleCreateExpense = async () => {
    try {

      const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
      const amount = parseFloat(sanitizedValue);
      if (isNaN(amount)) {
        alert("Valor inválido para despesa.");
        return;
      }
      

      if (!userId) {
        alert("User not logged in.");
        return;
      }
      const expenseId = await createExpense(
        newTaskTitle,
        amount,
        userId,
        new Date().toISOString().split('T')[0],
        new Date().toISOString(),
        selectedCategory,
      );
      await fetchExpenses(userId!);

      setIsCreateVisible(false);
      resetForm();
    } catch (err) {
    }
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
  
    const updatedCategories = selectedCategories.filter(
      cat => cat.name !== categoryToDelete.name
    );
  
    setSelectedCategories(updatedCategories);
    saveCategoriesToStorage(updatedCategories);
  
    if (selectedCategory === categoryToDelete.name) {
      setSelectedCategory('');
    }
  
    setCategoryToDelete(null);
    setShowConfirmDeleteModal(false);
  };
  

  const handleUpdateExpense = async () => {
    try {
      if (!currentExpense) return;
  
      const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
      const amount = parseFloat(sanitizedValue);
  
      if (isNaN(amount)) {
        alert('Valor inválido para despesa.');
        return;
      }
  
      const updatedExpense = {
        ...currentExpense,
        name: newTaskTitle,
        amount,
        type: selectedCategory,
      };
  
      await updateExpense(currentExpense.id, updatedExpense);
      await fetchExpenses(userId!);

      setIsEditVisible(false);
      setCurrentExpense(null);
      resetForm();
    } catch (err) {
      alert('Erro ao atualizar despesa: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  

  const resetForm = () => {
    setNewTaskTitle('');
    setExpenseValue('');
    setTaskContent('');
    setSelectedCategory('');
  };

  const openCreateModal = () => {
    resetForm();
    setCurrentExpense(null);
    setIsCreateVisible(true);
  };

  const openEditModal = (expense: any) => {
    setNewTaskTitle(expense.name);
    setExpenseValue(String(expense.amount));
    setTaskContent('');
    setSelectedCategory(expense.type);
    setCurrentExpense(expense);
    setIsEditVisible(true);
  };

  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategory((prev) => (prev === categoryName ? '' : categoryName));
  };
  

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
  
    if (!trimmedName) {
      alert('Nome da categoria não pode ser vazio.');
      return;
    }
  
    const alreadyExists = selectedCategories.some(
      (cat) => cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
  
    if (alreadyExists || ['Ganhos', 'Gastos'].includes(trimmedName)) {
      alert('Essa categoria já existe.');
      return;
    }
  
    const updatedCategories = [...selectedCategories, { name: trimmedName, color: newCategoryColor }];
  
    setSelectedCategories(updatedCategories);
    saveCategoriesToStorage(updatedCategories);
  
    setIsCategoryModalVisible(false);
    setNewCategoryName('');
    setNewCategoryColor('#ff7a7f');
  };
  
  
  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Excluir despesa',
      'Tem certeza que deseja excluir esta despesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
            if (userId) await deleteExpense(expenseId);
            if (userId) await fetchExpenses(userId);
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir a despesa.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  useEffect(() => {
    loadCategoriesFromStorage();
  }, []);


  useEffect(() => {
    const totalGains = expenses
      .filter(exp => exp.type === 'Ganhos')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalLosses = expenses
      .filter(exp => exp.type === 'Gastos')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    setGains(totalGains);
    setLosses(totalLosses);
  }, [expenses]);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && userId) {
        fetchExpenses(userId).catch(err => console.error('Erro ao buscar despesas: ', err));
      }
    }, [loading, userId])
  );



  useEffect(() => {
    if (selectedCategory) {
      const filtered = expenses.filter((exp) => exp.type === selectedCategory);
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [selectedCategory, expenses]);

    useEffect(() => {
    debugAllExpenses();
  }, []);
  
  
  const renderModal = (isVisible: boolean, onClose: () => void, onSave: () => void) => (
    <Modal transparent animationType="slide" visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 py-[50px] bg-zinc-800">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity onPress={onClose} className="items-center flex flex-row">
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-white text-lg font-sans">Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave}>
            <Text className="text-rose-400 text-lg mr-4 font-semibold">Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 py-4 px-8">
          <TextInput
            placeholder="Título"
            placeholderTextColor="#a1a1aa"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            className="text-gray-300 text-3xl font-semibold mb-4"
            multiline
          />

          <View className="flex flex-row flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
                <TouchableOpacity
                key={category.name}
                onPress={() => handleCategorySelection(category.name)}
                className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
                >
                <View
                  style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: category.color,
                  borderWidth: 0.5,
                  borderColor: '#fff',
                  }}
                />
                <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{category.name}</Text>
                </TouchableOpacity>
            );
          })}
          </View>

          <View className='flex flex-row items-center mt-2 gap-2 mb-4'>
            <Text className='font-sans text-2xl text-white'>R$</Text>
            <TextInput
              placeholder="00,00"
              placeholderTextColor="#a1a1aa"
              className="text-white text-2xl font-sans"
              keyboardType="numeric"
              value={expenseValue}
              onChangeText={setExpenseValue}
            />
          </View>

          <TextInput
            placeholder="Descrição da despesa"
            placeholderTextColor="#a1a1aa"
            className="text-gray-300 text-lg"
            multiline
            value={taskContent}
            onChangeText={setTaskContent}
            style={{ minHeight: 150, textAlignVertical: 'top' }}
          />
        </ScrollView>
      </View>
    </Modal>
  );

  const currencyFormat = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={openCreateModal}
        className="w-[50px] h-[50px] absolute bottom-6 right-6 z-20 rounded-full bg-rose-400 items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>


      <View className="flex flex-row items-center justify-between px-6 mt-[40px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Despesas</Text>
        

        <View className='flex flex-row gap-4 items-center'>

        <View className={`${gains - losses >= 0 ? 'border-emerald-300' : 'border-[#ff7a7f]'} flex flex-row items-center gap-4 border rounded-lg px-3 py-1`}>
          <Text className="text-lg font-sans text-white">
            {currencyFormat(Math.abs(gains - losses))}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowDeleteCategoryModal(true)}>
          <Ionicons name="options-outline" size={24} color="#ff7a7f" />
        </TouchableOpacity>

        </View>
        
    <Modal
      transparent
      animationType="fade"
      visible={showDeleteCategoryModal}
      onRequestClose={() => setShowDeleteCategoryModal(false)}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-zinc-800 rounded-2xl w-full max-h-[80%] p-4">
          <ScrollView className="mb-4">
            {categories.map((cat) => (
              <View
                key={cat.name}
                className="flex-row justify-between items-center py-2 border-b border-neutral-700"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 7.5,
                      backgroundColor: cat.color, 
                      borderWidth: 0.5, 
                      borderColor: '#fff'
                    }}
                  />
                  <Text className="text-white font-sans text-lg">{cat.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (cat.name !== "Ganhos" && cat.name !== "Gastos") {
                      setCategoryToDelete(cat);
                      setShowConfirmDeleteModal(true);
                    }
                  }}
                  className="p-2 bg-neutral-700 rounded-xl"
                >
                  {cat.name === "Ganhos" || cat.name === "Gastos" ? (
                    <Ionicons name="ban" size={20} color="#fa4d5c" />
                  ) : (
                    <Ionicons name="trash" size={20} color="#fa4d5c" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setShowDeleteCategoryModal(false)}
            className="bg-neutral-700 rounded-xl p-3 items-center"
          >
            <Text className="text-white text-lg font-sans font-semibold">Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>

    <Modal
      transparent
      animationType="fade"
      visible={showConfirmDeleteModal}
      onRequestClose={() => setShowConfirmDeleteModal(false)}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-8">
        <View className="bg-zinc-800 w-full rounded-2xl p-6 items-center shadow-lg">
          <Ionicons name="alert-circle" size={48} color="#F25C5C" className="mb-4" />

          <Text className="text-white text-xl font-semibold mb-2 font-sans text-center">
            Apagar Categoria
          </Text>

          <Text className="text-neutral-400 font-sans text-center mb-6">
            {categoryToDelete
              ? `Tem certeza que deseja apagar a categoria "${categoryToDelete.name}"? Esta ação não pode ser desfeita.`
              : 'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.'}
          </Text>

          <View className="flex-row w-full justify-between gap-3">
            <TouchableOpacity
              onPress={() => setShowConfirmDeleteModal(false)}
              className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold font-sans">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteCategory}
              className="flex-1 bg-rose-500 py-3 rounded-xl items-center"
            >
              <Text className="text-black font-sans font-semibold">Apagar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </Modal>


      </View>

      <View className='flex flex-row flex-wrap gap-2 px-6 pb-3'>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;
        return (
          <TouchableOpacity
            key={category.name}
            onPress={() => handleCategorySelection(category.name)}
            className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
          >
            <View
              style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: category.color,
              borderWidth: 0.5,
              borderColor: '#fff',
              }}
            />            
              <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{category.name}</Text>
          </TouchableOpacity>
        );
      })}

        <TouchableOpacity
          onPress={() => setIsCategoryModalVisible(true)}
          className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-neutral-700"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-sm font-sans">Nova Categoria</Text>
        </TouchableOpacity>
      </View>

      {filteredExpenses.length === 0 ? (
        <EmptyState selectedCategory={selectedCategory} onCreateExpense={openCreateModal} />
      ) : (
        <SwipeListView
          data={filteredExpenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
              <View className="flex flex-row justify-between">
                <TouchableOpacity className="flex flex-col gap-1 mt-1" onPress={() => openEditModal(item)}>
                  <Text className="text-xl font-sans font-medium text-gray-300 max-w-[250px]">
                    {item.name.split(' ').slice(0, 6).join(' ')}
                    {item.name.split(' ').length > 6 ? '...' : ''}
                  </Text>
                  <Text className="text-neutral-400 text-sm mt-1 font-sans">
                    {new Date(item.date ?? '').toLocaleDateString('pt-BR')} - {new Date(item.time ?? '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                <Text className={`font-sans ${item.type == "Ganhos" ? "text-emerald-400" : "text-[#ff7a7f]"} text-2xl mt-6`}>{currencyFormat(Number(item.amount))}</Text>
              </View>
            </View>
          )}
          renderHiddenItem={({ item }) => (
            <View className="w-full flex flex-col justify-center px-6 border-b border-neutral-700 bg-rose-500">
              <View className="flex flex-row justify-start items-center h-full">
                <TouchableOpacity className="p-3" onPress={() => handleDeleteExpense(item.id)}>
                  <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          leftOpenValue={80}
          rightOpenValue={0}
          disableRightSwipe={false}
          disableLeftSwipe={true}
        />
      )}

      {renderModal(isCreateVisible, () => setIsCreateVisible(false), handleCreateExpense)}
      {renderModal(isEditVisible, () => setIsEditVisible(false), handleUpdateExpense)}

      <Modal
        transparent
        animationType="fade"
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/90 px-8">
          <View className="bg-zinc-800 p-6 rounded-2xl w-full">
            <TextInput
              placeholder="Nome da categoria"
              placeholderTextColor="#a1a1aa"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              className="text-white font-sans font-3xl p-2 rounded mb-4"
            />

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewCategoryColor(color)}
                  style={{
                    backgroundColor: color,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: newCategoryColor === color ? 3 : 1,
                    borderColor: newCategoryColor === color ? '#fff' : '#333',
                  }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAddCategory}
              className="bg-rose-400 p-3 mt-3 rounded-xl items-center"
            >
              <Text className="text-black font-semibold font-sans">Adicionar Categoria</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} className="mt-4 p-2">
              <Text className="text-neutral-400 text-center font-sans">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}