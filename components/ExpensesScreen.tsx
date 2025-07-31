import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
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
    <View className="flex-1 justify-center items-center px-8 pb-[90px]">
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

  const formatLargeNumber = (value: number) => {
    const absValue = Math.abs(value);
    
    if (absValue >= 1000000000) {
      return `${(value / 1000000000).toFixed(1).replace('.0', '')}B`;
    } else if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace('.0', '')}M`;
    } else if (absValue >= 1000) {
      return `${(value / 1000).toFixed(1).replace('.0', '')}K`;
    }
    
    return currencyFormat(value);
  };

  const isLargeNumber = (value: number) => {
    return Math.abs(value) >= 1000000; // 1 milhão ou mais
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
                  {isLargeNumber(Number(item.amount)) 
                    ? `R$ ${formatLargeNumber(Number(item.amount))}`
                    : currencyFormat(Number(item.amount))
                  }            
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
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
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
        <Feather name="plus" strokeWidth={3} size={32} color="black" />
      </Pressable>

      {/* Header no estilo da Agenda */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Despesas</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <Ionicons name="folder" size={22} color="#ff7a7f" />
          </Pressable>
        </View>
      </View>

      {/* Seção de Filtro de Data e Saldo */}
      <View className="px-4 mb-4 flex-row gap-3">
        {/* Filtro de Data */}
        <View className="flex h-18 bg-[#35353a] rounded-xl overflow-hidden">
          <Pressable
            onPress={handleDateFilterModalOpen}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View 
                className="h-10 w-10 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)'
                }}
              >
                <Ionicons name="calendar-number-outline" size={16} color="#ff7a7f" />
              </View>
              <View className="flex-col">
                <Text className="text-zinc-400 font-sans text-xs mb-1">Período</Text>
                <Text className="text-white font-sans text-[12px] font-medium">
                  {getDateFilterDisplayText()}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Saldo */}
        <View className="bg-[#35353a] flex-row gap-3 flex-1 rounded-xl px-4 py-3.5">
          <View
            className="h-10 w-10 rounded-xl items-center justify-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <Feather name='dollar-sign' size={16} color="#ff7a7f" />
          </View>
          <View className="flex-col justify-center flex-1">
            <Text className="text-zinc-400 font-sans text-xs">Saldo</Text>
            <Text 
              className={`font-sans font-medium ${gains - losses >= 0 ? 'text-emerald-400' : 'text-[#ff7a7f]'}`}
              style={{
                fontSize: 17,
                flexShrink: 1
              }}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.6}
            >
              {isLargeNumber(gains - losses) 
                ? `R$ ${formatLargeNumber(Math.abs(gains - losses))}`
                : currencyFormat(Math.abs(gains - losses))
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Categorias */}
      <View className='flex flex-row flex-wrap gap-2 px-4 pb-4'>
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