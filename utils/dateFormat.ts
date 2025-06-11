import { format, parseISO } from 'date-fns';

export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy HH:mm');
  } catch {
    return '';
  }
};

export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '';
  }
};

export const formatTime = (date: Date | string): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm');
  } catch {
    return '';
  }
};
