import { useState, useMemo } from 'react';

export interface DateFilter {
  type: 'all' | 'month' | 'year' | 'custom';
  month?: number;
  year?: number;
  customStart?: string;
  customEnd?: string;
}

export interface DateFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilter: (filter: DateFilter) => void;
  currentFilter: DateFilter;
}

export const useDateFilter = (initialFilter: DateFilter = { type: 'all' }) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>(initialFilter);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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

  const applyFilter = (filter: DateFilter) => {
    setDateFilter(filter);
  };

  const resetFilter = () => {
    setDateFilter({ type: 'all' });
  };

  return {
    dateFilter,
    setDateFilter,
    filterExpensesByDate,
    getDateFilterDisplayText,
    applyFilter,
    resetFilter
  };
};