import { ExpenseType } from '../../../api/model/Expenses';

export interface DateFilter {
  type: 'all' | 'month' | 'year' | 'custom' | 'date';
  month?: number;
  year?: number;
  customStart?: string;
  customEnd?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  expense_type: ExpenseType;
  type?: string;
  date?: string;
  time?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: string;
}

export const formatLargeNumber = (value: number): string => {
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

export const isLargeNumber = (value: number): boolean => {
  return Math.abs(value) >= 1000000;
};

export const currencyFormat = (value: number): string => {
  const hasDecimals = value % 1 !== 0;
  
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(value);
};

export const filterExpensesByDate = (expenses: Expense[], filter: DateFilter): Expense[] => {
  if (filter.type === 'all') {
    return expenses;
  }

  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date ?? '');
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

export const getDateFilterDisplayText = (dateFilter: DateFilter): string => {
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

export const calculateTotals = (
  expenses: Expense[], 
  dateFilter: DateFilter, 
  selectedCategories: string[]
): { totalGains: number; totalLosses: number } => {
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

  return { totalGains, totalLosses };
};

export const filterExpensesByCategories = (
  expenses: Expense[], 
  dateFilter: DateFilter, 
  selectedCategories: string[]
): Expense[] => {
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
  
  return filtered;
};

export const validateExpenseForm = (
  title: string,
  expenseValue: string,
  selectedExpenseType: ExpenseType | null,
  userId: string | null
): { isValid: boolean; errorMessage?: string } => {
  const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
  const amount = parseFloat(sanitizedValue);
  
  if (isNaN(amount)) {
    return { isValid: false, errorMessage: "Valor inválido para despesa." };
  }

  if (!selectedExpenseType) {
    return { isValid: false, errorMessage: "Selecione se é um ganho ou gasto." };
  }

  if (!userId) {
    return { isValid: false, errorMessage: "User not logged in." };
  }

  if (!title.trim()) {
    return { isValid: false, errorMessage: "Título não pode estar vazio." };
  }

  return { isValid: true };
};

export const sanitizeExpenseValue = (expenseValue: string): number => {
  const sanitizedValue = expenseValue.replace(',', '.').replace(/[^0-9.]/g, '');
  return parseFloat(sanitizedValue);
};

export const checkCategoryInUse = (
  categoryName: string, 
  expenses: Expense[]
): boolean => {
  return expenses.some(expense => {
    if (expense.type && expense.type.includes(',')) {
      const expenseCategories = expense.type.split(',').map((cat: string) => cat.trim());
      return expenseCategories.includes(categoryName);
    }
    return expense.type === categoryName;
  });
};

export const getFilterDate = (dateFilter: DateFilter): Date => {
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

export const truncateExpenseName = (name: string, maxWords: number = 6): string => {
  const words = name.split(' ');
  if (words.length <= maxWords) {
    return name;
  }
  return words.slice(0, maxWords).join(' ') + '...';
};