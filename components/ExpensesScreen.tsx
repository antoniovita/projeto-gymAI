import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useExpenses } from '../hooks/useExpenses';

export default function ExpensesScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [taskContent, setTaskContent] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6347');
  const [colorOptions] = useState(['#FF6347', '#4CAF50', '#3B82F6', '#F59E0B']);
  const [gains, setGains] = useState(0);
  const [losses, setLosses] = useState(0);

  const [currentExpense, setCurrentExpense] = useState<any>(null);

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const { createExpense, fetchExpenses, expenses, deleteExpense, updateExpense } = useExpenses();

  const userId = 'user-id-123'; // Simulação de ID de usuário, deve ser dinâmico na aplicação real

  const categories = ['Ganhos', 'Perdas', ...selectedCategories];

  const handleCreateExpense = async () => {
    try {
      const amount = parseFloat(expenseValue);
      if (isNaN(amount)) {
        alert("Valor inválido para despesa.");
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

      alert(`Despesa criada com ID: ${expenseId}`);
      setIsCreateVisible(false);
      resetForm();
    } catch (err) {
      alert('Erro ao criar despesa: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateExpense = async () => {
    try {
      if (!currentExpense) return;

      const updatedExpense = {
        ...currentExpense,
        name: newTaskTitle,
        amount: parseFloat(expenseValue),
        type: selectedCategory,
      };

      await updateExpense(currentExpense.id, updatedExpense);
      alert('Despesa atualizada com sucesso.');
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

  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Nome da categoria não pode ser vazio.');
      return;
    }
    setSelectedCategories(prev => [...prev, newCategoryName]);
    setIsCategoryModalVisible(false);
    setNewCategoryName('');
    setNewCategoryColor('#FF6347');
  };

  const getCategoryColor = (category: string) => {
    if (category === 'Ganhos') return '#34D399';
    if (category === 'Perdas') return '#FF6347';
    return newCategoryColor; // ou pode mapear uma cor fixa para cada nova categoria
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      alert('Despesa excluída com sucesso.');
    } catch (err) {
      alert('Erro ao excluir despesa: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    const totalGains = expenses
      .filter(exp => exp.type === 'Ganhos')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalLosses = expenses
      .filter(exp => exp.type === 'Perdas')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    setGains(totalGains);
    setLosses(totalLosses);
  }, [expenses]);

  useEffect(() => {
    fetchExpenses(userId).catch(err => console.error('Erro ao buscar despesas: ', err));
  }, [expenses]);
  
  const renderModal = (isVisible: boolean, onClose: () => void, onSave: () => void) => (
    <Modal transparent animationType="slide" visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 py-[50px] bg-zinc-800">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity onPress={onClose} className="items-center flex flex-row">
            <Ionicons name="chevron-back" size={28} color="white" />
            <Text className="text-gray-300 text-lg">Voltar</Text>
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
              const isSelected = selectedCategory === category;
              const color = getCategoryColor(category);
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                  <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className='flex flex-row items-center mt-4 gap-2 mb-4'>
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
            placeholder="Descrição da tarefa"
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

      <View className="flex flex-row items-center justify-between px-6 mt-[60px] mb-6">
        <Text className="text-3xl text-white font-medium font-sans">Expenses</Text>
        <View className='flex flex-row items-center gap-4 border border-neutral-700 rounded-lg px-3 py-1'>
          <Text className='text-[#FF6347] text-lg font-sans'>{currencyFormat(losses)}</Text>
          <Text className='text-emerald-400 text-lg font-sans'>{currencyFormat(gains)}</Text>
        </View>
      </View>

      <View className='flex flex-row flex-wrap gap-2 px-6 pb-3'>
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const color = getCategoryColor(category);
          return (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategorySelection(category)}
              className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
              <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{category}</Text>
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

      <SwipeListView
        data={expenses}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between">
              <TouchableOpacity className="flex flex-col gap-1 mt-1" onPress={() => openEditModal(item)}>
                <Text className="text-xl font-sans font-medium text-gray-300">{item.name}</Text>
                <Text className="text-neutral-400 text-sm mt-1 font-sans">
                  {new Date(item.date ?? '').toLocaleDateString('pt-BR')} - {new Date(item.time ?? '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              <Text className='font-sans text-emerald-400 text-2xl mt-6'>{currencyFormat(Number(item.amount))}</Text>
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
