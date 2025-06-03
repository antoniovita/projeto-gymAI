import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useExpenses } from '../hooks/useExpenses';  // Importando o hook useExpenses

export default function ExpensesScreen() {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [taskContent, setTaskContent] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [expenseValue, setExpenseValue] = useState(''); 

  const { createExpense, loading, error, expenses } = useExpenses();

  const handleCreateExpense = async () => {
    try {
      const amount = parseFloat(expenseValue);  // Convertendo o valor gasto para número
      if (isNaN(amount)) {
        alert("Valor inválido para despesa.");
        return;
      }

      const expenseId = await createExpense(
        newTaskTitle,
        amount,
        'user-id-123', // Esse valor pode ser alterado para o ID do usuário real
        date.toLocaleDateString('pt-BR'),
        time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        selectedCategories.join(','), // Tipo ou categoria (pode ser uma string separada por vírgulas)
      );

      alert(`Despesa criada com ID: ${expenseId}`);
      setIsCreateVisible(false);  // Fechar modal após criar
    } catch (err) {
      if (err instanceof Error) {
        alert('Erro ao criar despesa: ' + err.message);
      } else {
        alert('Erro ao criar despesa: ' + String(err));
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <TouchableOpacity
        onPress={() => setIsCreateVisible(true)}
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
          <Text className='text-rose-400 text-lg font-sans'> R$ 10,00 </Text>
          <Text className='text-emerald-400 text-lg font-sans'>R$ 9,00</Text>
        </View>
      </View>

      <View className=' flex flex-row flex-wrap gap-2 px-6 pb-3'>
        {['Food', 'Transport', 'Entertainment'].map((cat) => {
          const isSelected = selectedCategories.includes(cat);

          return (
            <TouchableOpacity
              key={cat}
              onPress={() =>
                setSelectedCategories((prev) =>
                  prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                )
              }
              className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6347" }} />
              <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SwipeListView
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
            <View className="flex flex-row justify-between">
              <TouchableOpacity className="flex flex-col gap-1 mt-1">
                <Text className="text-xl font-sans font-medium text-gray-300">
                  {item.name}
                </Text>
                <Text className="text-neutral-400 text-sm mt-1 font-sans">
                  {new Date(item.date ?? '').toLocaleDateString('pt-BR')} - {new Date(item.time ?? '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <Text className='font-sans text-emerald-400 text-2xl mt-6'> R$ {item.amount}</Text>
            </View>
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View className="w-full flex flex-col justify-center px-6 border-b border-neutral-700 bg-rose-500">
            <View className="flex flex-row justify-start items-center h-full">
              <TouchableOpacity className="p-3">
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

      <Modal
        transparent
        animationType="slide"
        visible={isCreateVisible}
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View className="flex-1 py-[50px] bg-zinc-800">
          <View className="flex-row justify-between items-center px-4 py-4">
            <TouchableOpacity
              className="items-center flex flex-row"
              onPress={() => setIsCreateVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
              <Text className="text-gray-300 text-lg"> Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCreateExpense}>
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

            <View className="flex-row space-x-4 flex gap-3 mb-4">
              <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#F25C5C" />
                <Text className="text-rose-400 ml-2">{date.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#F25C5C" />
                <Text className="text-rose-400 ml-1">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <Modal visible={showDatePicker} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/90">
                  <TouchableOpacity
                    className='bg-rose-400 rounded-full p-3 absolute bottom-[10%]'
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Ionicons name="checkmark" size={24} color="#black" />
                  </TouchableOpacity>
                </View>
              </Modal>
            )}

            {showTimePicker && (
              <Modal visible={showTimePicker} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/90">
                  <TouchableOpacity
                    className='bg-rose-400 rounded-full p-3 absolute right-[45%] bottom-[10%]'
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Ionicons name="checkmark" size={24} color="#black" />
                  </TouchableOpacity>
                </View>
              </Modal>
            )}

            <View className="flex flex-row flex-wrap gap-2 mb-4">
              {['Food', 'Transport', 'Entertainment'].map((cat) => {
                const isSelected = selectedCategories.includes(cat);

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }
                    className={`flex-row items-center gap-2 px-3 py-1 rounded-xl ${isSelected ? 'bg-rose-400' : 'bg-neutral-700'}`}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6347" }} />
                    <Text className={`${isSelected ? 'text-black' : 'text-white'}`}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className='flex flex-row items-center mt-4 mb-4'>
              <Text className='font-sans text-2xl text-white'> R$ </Text>
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
    </SafeAreaView>
  );
}
