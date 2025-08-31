import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  FlatList,
  Image,
  Animated,
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
  
  // MUDANÇA: Usar array para múltiplas categorias na criação
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ff7a7f');
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  // Array para filtros de visualização (mantém a funcionalidade existente)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });

  const [rotationAnim] = useState(new Animated.Value(0));

  const { createExpense, fetchExpenses, expenses, deleteExpense, updateExpense, debugAllExpenses } = useExpenses();
  const { userId, loading } = useAuth();
  
  const { 
    categories: allCategories, 
    loading: categoriesLoading, 
    error: categoriesError,
    createCategory, 
    deleteCategory: deleteCategoryFromDB,
    getCategoriesByType,
    refreshCategories
  } = useCategory();

  // Get only expense categories
  const expenseCategories = getCategoriesByType('expense');

  const categories = [
    { id: 'ganhos', name: 'Ganhos', color: '#34D399', type: 'expense' },
    { id: 'gastos', name: 'Gastos', color: '#ff7a7f', type: 'expense' },
    ...expenseCategories.map(cat => ({ 
      id: cat.id, 
      name: cat.name, 
      color: cat.color, 
      type: cat.type 
    }))
  ];

  const handleCreateExpense = async () => {
    try {
      const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
      const amount = parseFloat(sanitizedValue);
      if (isNaN(amount)) {
        alert("Valor inválido para despesa.");
        return;
      }

      // MUDANÇA: Verificar se pelo menos uma categoria foi selecionada
      if (selectedExpenseCategories.length === 0) {
        alert("Selecione pelo menos uma categoria.")
        return;
      }

      if (!userId) {
        alert("User not logged in.");
        return;
      }
      
      // MUDANÇA: Usar as categorias selecionadas (join com vírgula como no AgendaScreen)
      const categoriesString = selectedExpenseCategories.join(', ');
      
      const expenseId = await createExpense(
        newTaskTitle,
        amount,
        userId,
        new Date().toISOString().split('T')[0],
        new Date().toISOString(),
        categoriesString, // Passa string com categorias separadas por vírgula
      );
      await fetchExpenses(userId!);

      setIsCreateVisible(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
  
    if (!category) {
      Alert.alert('Erro', 'Categoria não encontrada.');
      return;
    }

    // MUDANÇA: Verificar se categoria está em uso considerando múltiplas categorias
    const isCategoryInUse = expenses.some(expense => {
      if (expense.type && expense.type.includes(',')) {
        // Se a despesa tem múltiplas categorias
        const expenseCategories = expense.type.split(',').map((cat: string) => cat.trim());
        return expenseCategories.includes(category.name);
      }
      return expense.type === category.name;
    });
    
    if (isCategoryInUse) {
      Alert.alert('Erro', 'Esta categoria está associada a uma ou mais despesas e não pode ser excluída.');
      return;
    }

    if (category.name === 'Ganhos' || category.name === 'Gastos') {
      Alert.alert('Erro', 'Não é possível excluir as categorias padrão (Ganhos e Gastos).');
      return;
    }

    try {
      await deleteCategoryFromDB(category.id);
      
      // Remove a categoria do array de selecionadas se estiver presente
      if (selectedCategories.includes(category.name)) {
        setSelectedCategories(prev => prev.filter(cat => cat !== category.name));
      }
      
      // MUDANÇA: Remover também das categorias de criação
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

      // MUDANÇA: Verificar se pelo menos uma categoria foi selecionada
      if (selectedExpenseCategories.length === 0) {
        alert('Selecione pelo menos uma categoria.');
        return;
      }

      // MUDANÇA: Usar as categorias selecionadas
      const categoriesString = selectedExpenseCategories.join(', ');

      const updatedExpense = {
        ...currentExpense,
        name: newTaskTitle,
        amount,
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
    // MUDANÇA: Resetar array de categorias
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
    
    // MUDANÇA: Parse das categorias da despesa para array
    if (expense.type && expense.type.includes(',')) {
      const parsedCategories = expense.type.split(',').map((cat: string) => cat.trim());
      setSelectedExpenseCategories(parsedCategories);
    } else {
      setSelectedExpenseCategories(expense.type ? [expense.type] : []);
    }
    
    setCurrentExpense(expense);
    setIsEditVisible(true);
  };

  // Função para lidar com seleção múltipla de filtros (mantém funcionalidade existente)
  const handleCategorySelection = (categoryName: string) => {
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

    const alreadyExists = categories.some(
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
            <Text className={`font-sans ${item.type && item.type.includes("Ganhos") ? "text-emerald-400" : "text-[#ff7a7f]"} text-2xl mt-6`}>
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

  // MUDANÇA: Atualizar cálculo considerando múltiplas categorias
  useEffect(() => {
    let dateFilteredExpenses = filterExpensesByDate(expenses, dateFilter);
    
    // Se há categorias selecionadas, filtra por elas
    if (selectedCategories.length > 0) {
      dateFilteredExpenses = dateFilteredExpenses.filter(exp => {
        if (exp.type && exp.type.includes(',')) {
          // Despesa com múltiplas categorias
          const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
          return selectedCategories.some(selectedCat => expenseCategories.includes(selectedCat));
        }
        return selectedCategories.includes(exp.type);
      });
    }
    
    const totalGains = dateFilteredExpenses
      .filter(exp => {
        if (exp.type && exp.type.includes(',')) {
          const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
          return expenseCategories.includes('Ganhos');
        }
        return exp.type === 'Ganhos';
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalLosses = dateFilteredExpenses
      .filter(exp => {
        if (exp.type && exp.type.includes(',')) {
          const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
          return !expenseCategories.includes('Ganhos');
        }
        return exp.type !== 'Ganhos';
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    setGains(totalGains);
    setLosses(totalLosses);
  }, [expenses, dateFilter, selectedCategories]);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading && userId) {
        fetchExpenses(userId).catch(err => console.error('Erro ao buscar despesas: ', err));
        refreshCategories().catch(err => console.error('Erro ao buscar categorias: ', err));
      }
    }, [loading, userId])
  );

  // MUDANÇA: Filtrar despesas considerando múltiplas categorias
  useEffect(() => {
    let filtered = filterExpensesByDate(expenses, dateFilter);
    
    // Se há categorias selecionadas, filtra para mostrar apenas essas categorias
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((exp) => {
        if (exp.type && exp.type.includes(',')) {
          // Despesa com múltiplas categorias
          const expenseCategories = exp.type.split(',').map((cat: string) => cat.trim());
          return selectedCategories.some(selectedCat => expenseCategories.includes(selectedCat));
        }
        return selectedCategories.includes(exp.type);
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

  // Função para obter a data relevante baseada no filtro atual
  const getFilterDate = (): Date => {
    const today = new Date();
    
    switch (dateFilter.type) {
      case 'month':
        // Se filtrando por mês, usar o primeiro dia do mês
        return new Date(dateFilter.year!, dateFilter.month!, 1);
      case 'year':
        // Se filtrando por ano, usar o primeiro dia do ano
        return new Date(dateFilter.year!, 0, 1);
      default:
        // Para 'all' ou outros tipos, usar hoje
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

      {/* Header no estilo da Agenda */}
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

      {/* Seção de Filtro de Data e Saldo */}
      <View className="px-4 mb-4 justify-center flex-row gap-3">
        {/* Filtro de Data */}
        <View className="flex h-18 bg-[#35353a] w-[49%] rounded-xl overflow-hidden">
          <Pressable
            onPress={handleDateFilterModalOpen}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View 
              className="h-10 w-10 rounded-xl items-center justify-center bg-orange-400/35"
              >
                <GradientIcon name="calendar-number" size={16} />
              </View>
              <View className="flex-col">
                <Text className="text-zinc-400 font-sans text-xs">Período</Text>
                <Text className="text-white font-sans text-[10.5px] font-medium">
                  {getDateFilterDisplayText()}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Saldo */}
        <View className="bg-[#35353a] flex-row gap-3 w-[49%] rounded-xl px-4 py-3.5">
          <View
            className="h-10 w-10 rounded-xl items-center justify-center bg-orange-400/35"
          >
              <GradientIcon name='card' size={18} />
          </View>
          <View className="flex-col justify-center flex-1">
            <Text className="text-zinc-400 font-sans text-xs">Saldo</Text>
            <Text 
              className={`font-sans font-medium ${
                gains - losses > 0
                  ? 'text-emerald-400'
                  : gains - losses < 0
                  ? 'text-[#ff7a7f]'
                  : 'text-white'
              }`}
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

      <CategoryFilters
        categories={categories}
        selectedTypes={selectedCategories}
        onToggleCategory={handleCategorySelection}
        onAddNewCategory={() => setIsCategoryModalVisible(true)}
        addButtonText="Nova Categoria"
        showAddButton={true}
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
        selectedCategories={selectedExpenseCategories} // MUDANÇA: Passar array
        setSelectedCategories={setSelectedExpenseCategories} // MUDANÇA: Passar setter do array
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
        selectedCategories={selectedExpenseCategories} // MUDANÇA: Passar array
        setSelectedCategories={setSelectedExpenseCategories} // MUDANÇA: Passar setter do array
        categories={categories}
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
        categories={categories}
      />

      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={categories}
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