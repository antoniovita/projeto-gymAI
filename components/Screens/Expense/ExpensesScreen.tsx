import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useExpenses } from '../../../hooks/useExpenses';
import { useCategory } from '../../../hooks/useCategory';
import { useAuth } from '../../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientIcon from '../../generalComps/GradientIcon';
import CategoryModal from 'components/generalComps/CategoryModal';
import DeleteCategoryModal from '../../generalComps/DeleteCategoryModal';
import { EmptyState } from '../../generalComps/EmptyState';
import { OUTLINE } from '../../../imageConstants'
import CreateExpenseModal from './comps/CreateExpenseModal';
import DateFilterModal from './comps/DateFilterModal';
import CategoryFilters from 'components/generalComps/CategoryFilters';
import ExpenseStatsSection from './comps/ExpenseStatsSection';
import { ExpenseType } from '../../../api/model/Expenses';

export interface DateFilter {
  type: 'all' | 'month' | 'year' | 'custom' | 'date';
  month?: number;
  year?: number;
  customStart?: string;
  customEnd?: string;
}

export default function ExpensesScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  
  // Estados para criação/edição de despesas
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null);
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff7a7f');
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });

  const { 
    createExpense, 
    fetchExpenses, 
    expenses, 
    deleteExpense, 
    updateExpense, 
    debugAllExpenses,
  } = useExpenses();
  const { userId, loading } = useAuth();
  
  const { 
    createCategory, 
    deleteCategory: deleteCategoryFromDB,
    getCategoriesByType,
    refreshCategories
  } = useCategory();

  const expenseCategories = getCategoriesByType('expense');

  const handleCreateExpense = async () => {
    try {
      const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
      const amount = parseFloat(sanitizedValue);
      if (isNaN(amount)) {
        alert("Valor inválido para despesa.");
        return;
      }

      if (!selectedExpenseType) {
        alert("Selecione se é um ganho ou gasto.");
        return;
      }

      if (!userId) {
        alert("User not logged in.");
        return;
      }
      
      const categoriesString = selectedExpenseCategories.length > 0 
        ? selectedExpenseCategories.join(', ') 
        : undefined;
      
      const expenseId = await createExpense(
        newTaskTitle,
        amount,
        selectedExpenseType,
        userId,
        new Date().toISOString().split('T')[0],
        new Date().toISOString(),
        categoriesString,
      );
      await fetchExpenses(userId!);

      setIsCreateVisible(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
  
    if (!category) {
      Alert.alert('Erro', 'Categoria não encontrada.');
      return;
    }

    // Verificar se categoria está em uso
    const isCategoryInUse = expenses.some(expense => {
      if (expense.type && expense.type.includes(',')) {
        const expenseCategories = expense.type.split(',').map((cat: string) => cat.trim());
        return expenseCategories.includes(category.name);
      }
      return expense.type === category.name;
    });
    
    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais despesas e não pode ser excluída.');
      return;
    }

    try {
      await deleteCategoryFromDB(category.id);
      
      // Remove a categoria do array de selecionadas se estiver presente
      if (selectedCategories.includes(category.name)) {
        setSelectedCategories(prev => prev.filter(cat => cat !== category.name));
      }
      
      if (selectedExpenseCategories.includes(category.name)) {
        setSelectedExpenseCategories(prev => prev.filter(cat => cat !== category.name));
      }
      
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      Alert.alert('Erro', 'Não foi possível excluir a categoria.');
    }
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

      if (!selectedExpenseType) {
        alert('Selecione se é um ganho ou gasto.');
        return;
      }

      const categoriesString = selectedExpenseCategories.length > 0 
        ? selectedExpenseCategories.join(', ') 
        : undefined;

      const updatedExpense = {
        name: newTaskTitle,
        amount,
        expense_type: selectedExpenseType,
        type: categoriesString,
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
    setSelectedExpenseType(null);
    setSelectedExpenseCategories([]);
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
    
    setSelectedExpenseType(expense.expense_type || ExpenseType.LOSS);
    
    if (expense.type && expense.type.includes(',')) {
      const parsedCategories = expense.type.split(',').map((cat: string) => cat.trim());
      setSelectedExpenseCategories(parsedCategories);
    } else {
      setSelectedExpenseCategories(expense.type ? [expense.type] : []);
    }
    
    setCurrentExpense(expense);
    setIsEditVisible(true);
  };

  // Função para toggle de categorias (apenas categorias, não tipos)
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(cat => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      alert('Nome da categoria não pode ser vazio.');
      return;
    }

    const alreadyExists = expenseCategories.some(
      (cat) => cat.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert('Essa categoria já existe.');
      return;
    }

    try {
      await createCategory(trimmedName, newCategoryColor, 'expense');
      setIsCategoryModalVisible(false);
      setNewCategoryName('');
      setNewCategoryColor('#ff7a7f');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria.');
    }
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
        return 'Todas';
      case 'month':
        return `${months[dateFilter.month!]} ${dateFilter.year}`;
      case 'year':
        return `${dateFilter.year}`;
      default:
        return 'Todas';
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
            width: 80,
            height: "100%",
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
    return Math.abs(value) >= 1000000;
  };

  const renderExpenseItem = ({ item }: { item: any }) => {

    const isGain = item.expense_type === ExpenseType.GAIN;
    const textColor = isGain ? "text-emerald-400" : "text-[#ff7a7f]";

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
            <Text className={`font-sans ${textColor} text-2xl mt-6`}>
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

  // Cálculo de totais usando expense_type
  useEffect(() => {
    const calculateTotals = async () => {
      if (!userId) return;

      try {
        let dateFilteredExpenses = filterExpensesByDate(expenses, dateFilter);
        
        // Aplicar filtros de categoria se existirem
        if (selectedCategories.length > 0) {
          dateFilteredExpenses = dateFilteredExpenses.filter(exp => {
            if (!exp.type) return false;
            
            if (exp.type.includes(',')) {
              const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
              return selectedCategories.some(selectedCat => expenseCategories.includes(selectedCat));
            } else {
              return selectedCategories.includes(exp.type);
            }
          });
        }

        // Calcular totais baseados no expense_type
        const totalGains = dateFilteredExpenses
          .filter(exp => exp.expense_type === ExpenseType.GAIN)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        const totalLosses = dateFilteredExpenses
          .filter(exp => exp.expense_type === ExpenseType.LOSS)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        setGains(totalGains);
        setLosses(totalLosses);
      } catch (error) {
        console.error('Erro ao calcular totais:', error);
      }
    };

    calculateTotals();
  }, [expenses, dateFilter, selectedCategories, userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && userId) {
        fetchExpenses(userId).catch(err => console.error('Erro ao buscar despesas: ', err));
        refreshCategories().catch(err => console.error('Erro ao buscar categorias: ', err));
      }
    }, [loading, userId])
  );

  // Filtrar despesas por categorias (não por tipos)
  useEffect(() => {
    let filtered = filterExpensesByDate(expenses, dateFilter);
    
    // Aplicar filtros de categoria se existirem
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((exp) => {
        if (!exp.type) return false;
        
        if (exp.type.includes(',')) {
          const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
          return selectedCategories.some(selectedCat => expenseCategories.includes(selectedCat));
        } else {
          return selectedCategories.includes(exp.type);
        }
      });
    }
    
    setFilteredExpenses(filtered);
  }, [selectedCategories, expenses, dateFilter]);

  useEffect(() => {
    debugAllExpenses();
  }, []);

  const currencyFormat = (value: number) => {
    const hasDecimals = value % 1 !== 0;
    
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getFilterDate = (): Date => {
    const today = new Date();
    
    switch (dateFilter.type) {
      case 'month':
        return new Date(dateFilter.year!, dateFilter.month!, 1);
      case 'year':
        return new Date(dateFilter.year!, 0, 1);
      default:
        return today;
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-zinc-800 ${Platform.OS === 'android' && 'py-[30px]'}`}>
      <Pressable
        className="absolute bottom-6 right-6 z-20 rounded-full items-center justify-center"
        onPress={openCreateModal}
      >
       <LinearGradient
          colors={['#FFD45A', '#FFA928', '#FF7A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "100%"}}
          >
        <Feather name="plus" strokeWidth={3} size={32} color="black" />
      </LinearGradient>
      </Pressable>

      {/* Header */}
      <View className="mt-5 px-4 mb-6 flex-row items-center justify-between">
        <View className="w-[80px]" />
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[18px] font-medium">Despesas</Text>
        </View>
        <View className="flex-row items-center gap-4 mr-1">
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <GradientIcon name="folder" size={22} />
          </Pressable>
        </View>
      </View>

      <ExpenseStatsSection
        onDateFilterPress={handleDateFilterModalOpen}
        dateFilterDisplayText={getDateFilterDisplayText()}
        gains={gains}
        losses={losses}
        formatLargeNumber={formatLargeNumber}
        currencyFormat={currencyFormat}
        isLargeNumber={isLargeNumber}
      />

      {/* CATEGORIA FILTERS - Apenas categorias, não tipos de despesa */}
      <CategoryFilters
        categories={expenseCategories}
        selectedTypes={selectedCategories}
        onToggleCategory={handleCategoryToggle}
        onAddNewCategory={() => setIsCategoryModalVisible(true)}
        addButtonText="Nova Categoria"
        containerClassName="flex flex-row flex-wrap gap-2 px-4 pb-4"
      />

      {filteredExpenses.length === 0 ? (
        <EmptyState
          image={OUTLINE.fuocoMONEY}
          title="Nenhuma despesa registrada"
          subtitle="Adicione suas despesas para controlar seu orçamento"
          />
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
        selectedCategories={selectedExpenseCategories}
        setSelectedCategories={setSelectedExpenseCategories}
        selectedExpenseType={selectedExpenseType}
        setSelectedExpenseType={setSelectedExpenseType}
        categories={expenseCategories}
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
        selectedCategories={selectedExpenseCategories}
        setSelectedCategories={setSelectedExpenseCategories}
        selectedExpenseType={selectedExpenseType}
        setSelectedExpenseType={setSelectedExpenseType}
        categories={expenseCategories}
        isEditMode={true}
      />

      <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
        onAddCategory={handleAddCategory}
        categories={expenseCategories}
      />

      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={expenseCategories}
        onDeleteCategory={handleDeleteCategory}
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