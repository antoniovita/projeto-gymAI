import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

interface DateFilter {
  type: 'all' | 'month' | 'year' | 'custom' | 'date';
  month?: number;
  year?: number;
  customStart?: string;
  customEnd?: string;
}

interface DateFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: DateFilter) => void;
  currentFilter: DateFilter;
}

const DateFilterModal: React.FC<DateFilterModalProps> = ({ 
  isVisible, 
  onClose, 
  onApplyFilter, 
  currentFilter 
}) => {
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>(currentFilter);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleApply = () => {
    // Determina o tipo correto baseado na seleção
    let finalFilter: DateFilter = { ...selectedFilter };
    
    if (selectedFilter.type === 'date') {
      if (selectedFilter.year && selectedFilter.month !== undefined) {
        // Se tem ano E mês, é filtro por mês
        finalFilter = {
          type: 'month',
          month: selectedFilter.month,
          year: selectedFilter.year
        };
      } else if (selectedFilter.year) {
        // Se tem apenas ano, é filtro por ano
        finalFilter = {
          type: 'year',
          year: selectedFilter.year
        };
      }
    }
    
    onApplyFilter(finalFilter);
    onClose();
  };

  const FilterOption = ({ 
    icon, 
    title, 
    isSelected, 
    onPress 
  }: {
    icon: string;
    title: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 rounded-xl mb-3 ${
        isSelected ? 'bg-rose-400' : 'bg-neutral-700'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons 
          name={icon as any}
          size={20} 
          color={isSelected ? 'black' : 'white'} 
        />
        <Text className={`font-sans ${isSelected ? 'text-black' : 'text-white'}`}>
          {title}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color="black" />
      )}
    </TouchableOpacity>
  );

  const YearSelector = ({ 
    selectedYear, 
    onYearSelect 
  }: {
    selectedYear?: number;
    onYearSelect: (year: number) => void;
  }) => (
    <View className="mb-4">
      <View className="flex-row gap-2">
        {years.map((year) => (
          <TouchableOpacity
            key={year}
            onPress={() => {
              // Se já está selecionado, desfaz a seleção
              if (selectedYear === year) {
                setSelectedFilter({ type: 'all' });
              } else {
                onYearSelect(year);
              }
            }}
            className={`px-4 py-2 rounded-lg ${
              selectedYear === year ? 'bg-rose-400' : 'bg-neutral-600'
            }`}
          >
            <Text className={`font-sans text-[15px] ${
              selectedYear === year ? 'text-black' : 'text-white'
            }`}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const MonthSelector = ({ 
    selectedMonth, 
    onMonthSelect,
    selectedYear
  }: {
    selectedMonth?: number;
    onMonthSelect: (month: number) => void;
    selectedYear?: number;
  }) => (
    <View>
      <View className="flex-row mt-4 flex-wrap gap-2">
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (selectedMonth === index) {
                setSelectedFilter({ 
                  ...selectedFilter, 
                  month: undefined 
                });
              } else {
                onMonthSelect(index);
              }
            }}
            className={`px-3 py-2 mt-1 rounded-full ${
              selectedMonth === index ? 'bg-rose-400' : 'bg-neutral-600'
            }`}
          >
            <Text className={`font-sans text-[12px] ${
              selectedMonth === index ? 'text-black' : 'text-white'
            }`}>
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ActionButtons = () => (
    <View className="flex-row gap-3 mt-4 mb-6">
      <TouchableOpacity
        onPress={onClose}
        className="flex-1 bg-neutral-700 py-3 rounded-xl items-center"
      >
        <Text className="text-white font-sans">Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleApply}
        className="flex-1 bg-rose-400 py-3 rounded-xl items-center"
      >
        <Text className="text-black font-sans font-medium">Aplicar</Text>
      </TouchableOpacity>
    </View>
  );

  const getFilterPreview = () => {
    if (selectedFilter.type === 'all') return 'Todas as despesas';
    if (selectedFilter.type === 'date') {
      if (selectedFilter.year && selectedFilter.month !== undefined) {
        return `${months[selectedFilter.month]} ${selectedFilter.year}`;
      }
      if (selectedFilter.year) {
        return `Ano ${selectedFilter.year}`;
      }
    }
    return 'Selecione um período';
  };

  // Mapeia os tipos do filtro atual para o tipo interno
  const getInternalFilterType = () => {
    if (currentFilter.type === 'month' || currentFilter.type === 'year') {
      return 'date';
    }
    return currentFilter.type;
  };

  // Inicializa o filtro interno baseado no filtro atual
  React.useEffect(() => {
    if (currentFilter.type === 'month' || currentFilter.type === 'year') {
      setSelectedFilter({
        type: 'date',
        year: currentFilter.year,
        month: currentFilter.month
      });
    } else {
      setSelectedFilter(currentFilter);
    }
  }, [currentFilter]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View 
          className="bg-[#1e1e1e] rounded-t-3xl px-6 py-6"
          style={{ maxHeight: screenHeight * 0.8 }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-medium font-sans">
              Filtrar por período
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <FilterOption
              icon="calendar-outline"
              title="Todas as despesas"
              isSelected={selectedFilter.type === 'all'}
              onPress={() => setSelectedFilter({ type: 'all' })}
            />

            <FilterOption
              icon="calendar"
              title="Por data específica"
              isSelected={selectedFilter.type === 'date'}
              onPress={() => {
                if (selectedFilter.type === 'date') {
                  setSelectedFilter({ type: 'all' });
                } else {
                  setSelectedFilter({ 
                    type: 'date', 
                    year: selectedFilter.year ?? currentYear,
                    month: selectedFilter.month
                  });
                }
              }}
            />

            {selectedFilter.type === 'date' && (
              <View className="py-4">
                <YearSelector
                  selectedYear={selectedFilter.year}
                  onYearSelect={(year) => setSelectedFilter({ 
                    ...selectedFilter, 
                    year: year
                  })}
                />

                <MonthSelector
                  selectedMonth={selectedFilter.month}
                  selectedYear={selectedFilter.year}
                  onMonthSelect={(month) => setSelectedFilter({ 
                    ...selectedFilter, 
                    month: month
                  })}
                />
              </View>
            )}
          </ScrollView>

          <ActionButtons />
        </View>
      </View>
    </Modal>
  );
};

export default DateFilterModal;