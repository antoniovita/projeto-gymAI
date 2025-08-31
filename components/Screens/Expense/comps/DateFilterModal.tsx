import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  TouchableWithoutFeedback,
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
  const slideAnim = useRef(new Animated.Value(300)).current;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 8}, (_, i) => currentYear - i);

  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(600);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const handleApply = () => {
    let finalFilter: DateFilter = { ...selectedFilter };
    
    if (selectedFilter.type === 'date') {
      if (selectedFilter.year && selectedFilter.month !== undefined) {
        finalFilter = {
          type: 'month',
          month: selectedFilter.month,
          year: selectedFilter.year
        };
      } else if (selectedFilter.year) {
        finalFilter = {
          type: 'year',
          year: selectedFilter.year
        };
      }
    }
    
    onApplyFilter(finalFilter);
    handleClose();
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
      className={`flex-row items-center justify-between px-4 py-3 rounded-2xl mb-1 ${
        isSelected ? 'bg-rose-400' : 'bg-zinc-800'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons 
          name={icon as any}
          size={22} 
          color={isSelected ? 'black' : '#999'} 
        />
        <Text className={`font-sans text-[16px] ${isSelected ? 'text-black font-medium' : 'text-zinc-300'}`}>
          {title}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color="black" />
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-zinc-400 font-sans text-[13px] font-medium mb-2 mt-6 uppercase tracking-wide">
      {title}
    </Text>
  );

  const YearSelector = ({ 
    selectedYear, 
    onYearSelect 
  }: {
    selectedYear?: number;
    onYearSelect: (year: number) => void;
  }) => (
    <View className="mb-4">
      <View className="bg-zinc-900/10 rounded-2xl p-3">
        <View className="flex-row gap-2 flex-wrap justify-center">
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => {
                if (selectedYear === year) {
                  setSelectedFilter({ type: 'all' });
                } else {
                  onYearSelect(year);
                }
              }}
              className={`px-6 py-2 rounded-full ${
                selectedYear === year ? 'bg-rose-400' : 'bg-zinc-800'
              }`}
            >
              <Text className={`font-sans text-[15px] font-medium ${
                selectedYear === year ? 'text-black' : 'text-zinc-300'
              }`}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    <View className="mb-4">
      <View className="bg-zinc-900/10 rounded-2xl p-3">
        <View className="flex-row flex-wrap gap-2 justify-center">
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
              className={`px-4 py-2 rounded-full ${
                selectedMonth === index ? 'bg-rose-400' : 'bg-zinc-800'
              }`}
            >
              <Text className={`font-sans text-[13px] font-medium ${
                selectedMonth === index ? 'text-black' : 'text-zinc-300'
              }`}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const ActionButtons = () => (
    <View className="flex-row gap-3 mt-6 mb-6">
      <TouchableOpacity
        onPress={handleClose}
        className="flex-1 bg-zinc-800 py-4 rounded-2xl items-center"
      >
        <Text className="text-zinc-300 font-sans font-medium text-[16px]">Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleApply}
        className="flex-1 bg-rose-400 py-4 rounded-2xl items-center"
      >
        <Text className="text-black font-sans font-medium text-[16px]">Aplicar</Text>
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
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <Animated.View
              className="rounded-t-3xl px-6 py-6"
              style={{ 
                backgroundColor: '#1e1e1e',
                transform: [{ translateY: slideAnim }]
              }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-zinc-100 text-[20px] font-semibold font-sans">
                  Filtrar por período
                </Text>
                <TouchableOpacity 
                  onPress={handleClose}
                  className="w-8 h-8 bg-zinc-800 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>

                <FilterOption
                  icon='list-outline'
                  title="Todas as despesas"
                  isSelected={selectedFilter.type === 'all'}
                  onPress={() => setSelectedFilter({ type: 'all' })}
                />

                <SectionTitle title="Ano" />
                <YearSelector
                  selectedYear={selectedFilter.year}
                  onYearSelect={(year) => setSelectedFilter({ 
                    type: 'date',
                    year: year,
                    month: selectedFilter.month
                  })}
                />

                <SectionTitle title="Mês" />
                <MonthSelector
                  selectedMonth={selectedFilter.month}
                  selectedYear={selectedFilter.year}
                  onMonthSelect={(month) => setSelectedFilter({ 
                    type: 'date',
                    year: selectedFilter.year || currentYear,
                    month: month
                  })}
                />
              </ScrollView>

              <ActionButtons />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DateFilterModal;