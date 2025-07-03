import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RoutineScreen() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'expenses'>('agenda');
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const;
  type DayKey = typeof days[number];
  const [selectedDay, setSelectedDay] = useState<DayKey>(days[0]);
  const [expenseFilter, setExpenseFilter] = useState<'Gastos' | 'Ganhos'>('Gastos');

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      {/* Header */}
      <View className="mt-5 px-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => {}} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[15px]">Minha Rotina</Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 rounded-xl mt-[30px] overflow-hidden bg-neutral-800 border border-neutral-700">
        {['expenses', 'agenda'].map(tab => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 ${activeTab === tab ? 'bg-[#ff7a7f]' : ''}`}
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
          {/* Day Picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} className="py-2">
            {days.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-1.5 rounded-full mr-2 ${selectedDay === day ? 'bg-[#ff7a7f]' : 'bg-neutral-700'}`}
              >
                <Text className={`font-sans ${selectedDay === day ? 'text-black' : 'text-white'}`}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Empty State */}
          <View className="self-center z-20 items-center px-4" style={{ paddingTop: 150 }}>
            <Ionicons name="calendar-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">
              Nenhuma tarefa para {selectedDay}
            </Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Crie novas tarefas para organizar sua rotina
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 mt-4">
          {/* Expenses Filter */}
          <View className="flex-row mx-6 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800">
            {['Gastos', 'Ganhos'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setExpenseFilter(type as 'Gastos' | 'Ganhos')}
                className={`flex-1 py-3 ${expenseFilter === type ? 'bg-white' : ''}`}
              >
                <Text className={`text-center font-sans ${expenseFilter === type ? 'text-black' : 'text-white'}`}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
          <View className="flex-1 justify-center items-center px-4">
            <Ionicons name="wallet-outline" size={64} color="#6b7280" />
            <Text className="text-neutral-400 font-sans text-lg mt-4 text-center">Expenses em desenvolvimento</Text>
            <Text className="text-neutral-500 font-sans text-sm mt-2 text-center">
              Esta funcionalidade será implementada em breve
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
