import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RoutineScreen() {
  const navigation = useNavigation();

  // Top-level tab state
  const [activeTab, setActiveTab] = useState<'agenda' | 'expenses'>('agenda');

  // Agenda day filter state
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const [selectedDay, setSelectedDay] = useState(days[0]);

  // Expenses tab filter state
  const [expenseFilter, setExpenseFilter] = useState<'Gastos' | 'Ganhos'>('Gastos');

  // Dummy data
  const agendaItems = [{ id: 1, title: 'Lavar o cachorro', time: '16:00 - 17:00' }];
  const expenseItems = [{ id: 1, title: 'Chiclete na banca', date: '01/03/2025 18:36', amount: 'R$ 5,00' }];
  const incomeItems: never[] = [];

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">

        <View className="mt-5 px-4 flex-row items-center justify-between">
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>

        {/* Título Centralizado com position absolute */}
        <View className="absolute left-0 right-0 items-center">
            <Text className="text-white font-sans text-[15px]">Informações</Text>
        </View>

        {/* Espaço invisível para alinhar visualmente */}
        <View style={{ width: 64 }} /> {/* Aproximadamente o mesmo espaço do botão Voltar */}
        </View>



      {/* Tabs: Expenses | Agenda */}
      <View className="flex-row mx-4 rounded-xl mt-[30px] overflow-hidden bg-neutral-800 border border-neutral-700">
        {['expenses', 'agenda'].map(tab => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 ${activeTab === tab ? 'bg-white' : ''}`}
            onPress={() => setActiveTab(tab as 'agenda' | 'expenses')}
          >
            <Text className={`text-center font-sans ${activeTab === tab ? 'text-black' : 'text-white'}`}>
              {tab === 'expenses' ? 'Expenses' : 'Agenda'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'agenda' ? (
        <View className="flex mt-4">
          {/* Day Scroll Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            className="py-2"
          >
            {days.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Agenda List */}
          <ScrollView className="px-4 mt-2">
            {agendaItems.map(item => (
              <View key={item.id} className="py-4 border-b border-neutral-700">
                <Text className="text-white font-sans text-lg">{item.title}</Text>
                <Text className="text-neutral-400 font-sans mt-1">{item.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 mt-4">
          {/* Expenses Filter */}
          <View className="flex-row mx-6 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
            {['Gastos', 'Ganhos'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setExpenseFilter(type as 'Gastos' | 'Ganhos')}
                className={`flex-1 py-3 ${expenseFilter === type ? 'bg-white' : ''}`}
              >
                <Text className={`text-center font-sans ${expenseFilter === type ? 'text-black' : 'text-white'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expenses or Incomes List */}
          <ScrollView className="px-4 mt-2">
            {(expenseFilter === 'Gastos' ? expenseItems : incomeItems).map(item => (
              <View
                key={item.id}
                className="py-4 border-b border-neutral-700 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white font-sans text-lg">{item.title}</Text>
                  <Text className="text-neutral-400 font-sans text-sm mt-1">{item.date}</Text>
                </View>
                <View className="border border-gray-600 px-3 py-1 rounded">
                  <Text className="text-white font-sans">{item.amount}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-white w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          // handle add new item
        }}
      >
        <Text className="text-black text-3xl" style={{ lineHeight: 34 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
