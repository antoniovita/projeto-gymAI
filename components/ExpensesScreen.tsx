import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useExpenses } from '../hooks/useExpenses';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import CreateExpenseModal from '../components/comps/CreateExpenseModal';
import CreateCategoryModal from '../components/comps/CreateCategoryModal';
import DeleteCategoryModal from '../components/comps/DeleteCategoryModalExp';
import DateFilterModal from '../components/comps/DateFilterModal';

export interface DateFilter {
  type: 'all' | 'month' | 'year' | 'custom' | 'date';
  month?: number;
  year?: number;
  customStart?: string;
  customEnd?: string;
}

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

  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });

  const [rotationAnim] = useState(new Animated.Value(0));

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
      console.error(err);
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

  const handleDeleteCategoryPress = (category: { name: string, color: string }) => {
    setCategoryToDelete(category);
    setShowConfirmDeleteModal(true);
  };

  const handleDateFilterApply = (filter: DateFilter) => {
    setDateFilter(filter);
  };

  const handleDateFilterModalOpen = () => {
    setShowDateFilterModal(true);

  };

  const handleDateFilterModalClose = () => {
    setShowDateFilterModal(false);
  };

  const filterExpensesByDate = (expenses: any[], filter: DateFilter) => {
    if (filter.type === 'all') {
      return expenses;
    }

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();

      switch (filter.type) {
        case 'month':
          return expenseYear === filter.year && expenseMonth === filter.month;
        case 'year':
          return expenseYear === filter.year;
        default:
          return true;
      }
    });
  };

  const getDateFilterDisplayText = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    switch (dateFilter.type) {
      case 'all':
        return 'Todas as despesas';
      case 'month':
        return `${months[dateFilter.month!]} ${dateFilter.year}`;
      case 'year':
        return `${dateFilter.year}`;
      default:
        return 'Todas as despesas';
    }
  };

  const renderLeftActions = (item: any) => {
    return (
    <View className="flex-row items-center justify-start border-t bg-rose-500 px-4 h-full">
        <TouchableOpacity
          onPress={() => handleDeleteExpense(item.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 32,
          }}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderExpenseItem = ({ item }: { item: any }) => {
    return (
      <Swipeable
        renderLeftActions={() => renderLeftActions(item)}
        leftThreshold={40}
        rightThreshold={40}
        overshootLeft={false}
        overshootRight={false}
        dragOffsetFromLeftEdge={80}
        friction={1}
      >
        <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
          <View className="flex flex-row justify-between">
            <Pressable className="flex flex-col gap-1 mt-1" onPress={() => openEditModal(item)}>
              <Text className="text-xl font-sans font-medium text-gray-300 max-w-[250px]">
                {item.name.split(' ').slice(0, 6).join(' ')}
                {item.name.split(' ').length > 6 ? '...' : ''}
              </Text>
              <Text className="text-neutral-400 text-sm mt-1 font-sans">
                {new Date(item.date ?? '').toLocaleDateString('pt-BR')} - {new Date(item.time ?? '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
            <Text className={`font-sans ${item.type == "Ganhos" ? "text-emerald-400" : "text-[#ff7a7f]"} text-2xl mt-6`}>
              {currencyFormat(Number(item.amount))}
            </Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  useEffect(() => {
    loadCategoriesFromStorage();
  }, []);

  useEffect(() => {

    const dateFilteredExpenses = filterExpensesByDate(expenses, dateFilter);
    
    const totalGains = dateFilteredExpenses
      .filter(exp => exp.type === 'Ganhos')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalLosses = dateFilteredExpenses
      .filter(exp => exp.type === 'Gastos')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    setGains(totalGains);
    setLosses(totalLosses);
  }, [expenses, dateFilter]);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && userId) {
        fetchExpenses(userId).catch(err => console.error('Erro ao buscar despesas: ', err));
      }
    }, [loading, userId])
  );

  useEffect(() => {
    let filtered = filterExpensesByDate(expenses, dateFilter);
    
    if (selectedCategory) {
      filtered = filtered.filter((exp) => exp.type === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
  }, [selectedCategory, expenses, dateFilter]);

  useEffect(() => {
    debugAllExpenses();
  }, []);

  const currencyFormat = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <Pressable
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
      </Pressable>

      <View className="flex flex-row items-center justify-between px-6 mt-[40px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Despesas</Text>

        <View className='flex flex-row gap-4 items-center'>
          <View className={`${gains - losses >= 0 ? 'border-emerald-300' : 'border-[#ff7a7f]'} flex flex-row items-center gap-4 border rounded-lg px-3 py-1`}>
            <Text className="text-lg font-sans text-white">
              {currencyFormat(Math.abs(gains - losses))}
            </Text>
          </View>

          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <Ionicons name="options-outline" size={24} color="#ff7a7f" />
          </Pressable>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Pressable
          onPress={handleDateFilterModalOpen}
          className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-[#35353a]"
        >
          <View className="flex-row items-center gap-3">
            <View 
              className="p-2 rounded-xl"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)'
              }}
            >
              <Ionicons name="calendar-number-outline" size={16} color="#ff7a7f" />
            </View>
            <View className="flex-col">
              <Text className="text-zinc-400 font-sans text-xs mb-1">Período selecionado</Text>
              <Text className="text-white font-sans text-sm font-semibold">
                {getDateFilterDisplayText()}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-3">
            <View 
              className="px-2 py-1 rounded-lg"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(34, 197, 94, 0.3)',
              }}
            >
              <Text className="text-emerald-400 font-sans text-xs font-medium">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'item' : 'itens'}
              </Text>
            </View>
            <Animated.View
              style={{
                transform: [{
                  rotate: rotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg']
                  })
                }]
              }}
            >
            </Animated.View>
          </View>
        </Pressable>
      </View>

      <View className='flex flex-row flex-wrap gap-2 px-6 pb-3'>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <Pressable
              key={category.name}
              onPress={() => handleCategorySelection(category.name)}
              className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-zinc-700'}`}
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
              <Text className={`font-sans text-sm ${isSelected ? 'text-black' : 'text-white'}`}>{category.name}</Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setIsCategoryModalVisible(true)}
          className="flex-row items-center gap-2 px-3 py-1 rounded-xl bg-zinc-700"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white text-sm font-sans">Nova Categoria</Text>
        </Pressable>
      </View>

      {filteredExpenses.length === 0 ? (
        <EmptyState selectedCategory={selectedCategory} onCreateExpense={openCreateModal} />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderExpenseItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreateExpenseModal
        isVisible={isCreateVisible}
        onClose={() => setIsCreateVisible(false)}
        onSave={handleCreateExpense}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        expenseValue={expenseValue}
        setExpenseValue={setExpenseValue}
        taskContent={taskContent}
        setTaskContent={setTaskContent}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <CreateExpenseModal
        isVisible={isEditVisible}
        onClose={() => setIsEditVisible(false)}
        onSave={handleUpdateExpense}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        expenseValue={expenseValue}
        setExpenseValue={setExpenseValue}
        taskContent={taskContent}
        setTaskContent={setTaskContent}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        isEditMode={true}
      />

      <CreateCategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        onAddCategory={handleAddCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
      />

      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={categories}
        onDeleteCategory={handleDeleteCategoryPress}
        showConfirmDeleteModal={showConfirmDeleteModal}
        setShowConfirmDeleteModal={setShowConfirmDeleteModal}
        categoryToDelete={categoryToDelete}
        onConfirmDelete={handleDeleteCategory}
      />

      <DateFilterModal
        isVisible={showDateFilterModal}
        onClose={handleDateFilterModalClose}
        onApplyFilter={(filter) => {
          handleDateFilterApply(filter);
          handleDateFilterModalClose();
        }}
        currentFilter={dateFilter}
      />
    </SafeAreaView>
  );
}