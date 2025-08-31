import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { RoutineTask } from 'api/model/RoutineTasks';

export interface UnifiedTask {
  id: string;
  title: string;
  content?: string;
  datetime: string;
  completed: 0 | 1;
  type?: string;
  isRoutine: boolean;
  routineId?: string;
  originalWeekDays?: string[];
  targetDate?: string; 
}

export interface LevelUpData {
  previousLevel: number;
  newLevel: number;
  xpGained: number;
}

export const dayNameToNumber: { [key: string]: number } = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
  'domingo': 0,
  'segunda': 1,
  'terca': 2,
  'quarta': 3,
  'quinta': 4,
  'sexta': 5,
  'sabado': 6
};

export const getInitialWeekStart = (): Date => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 3);
  return startOfWeek;
};

export const convertRoutineToUnifiedTask = (
  routine: RoutineTask, 
  targetDate: Date,
  isCompletedOnDate: (routine: RoutineTask, targetDate: Date) => boolean,
  isCancelledOnDate: (routine: RoutineTask, targetDateString: string) => boolean
): UnifiedTask | null => {
  const targetDateString = format(targetDate, 'yyyy-MM-dd');
  
  if (isCancelledOnDate(routine, targetDateString)) {
    console.log(`Data ${targetDateString} cancelada para routine ${routine.id} - pulando`);
    return null;
  }

  const routineDateTime = new Date(targetDate);
  if (routine.created_at) {
    const originalTime = new Date(routine.created_at);
    routineDateTime.setHours(originalTime.getHours());
    routineDateTime.setMinutes(originalTime.getMinutes());
  } else {
    routineDateTime.setHours(9, 0, 0, 0);
  }

  const isCompleted = isCompletedOnDate(routine, targetDate);

  let weekDays: string[] = [];
  try {
    weekDays = JSON.parse(routine.week_days || '[]');
  } catch (error) {
    console.error('Erro ao parse week_days:', error);
  }

  return {
    id: `routine_${routine.id}_${targetDateString}`,
    title: routine.title,
    content: routine.content,
    datetime: routineDateTime.toISOString(),
    completed: isCompleted ? 1 : 0,
    type: routine.type,
    isRoutine: true,
    routineId: routine.id,
    originalWeekDays: weekDays,
    targetDate: targetDateString
  };
};

export const getUnifiedTasks = (
  tasks: any[],
  routineTasks: RoutineTask[],
  currentWeekStart: Date,
  convertRoutineTaskFn: (routine: RoutineTask, targetDate: Date) => UnifiedTask | null
): UnifiedTask[] => {
  const normalTasks: UnifiedTask[] = tasks.map(task => ({
    ...task,
    isRoutine: false
  }));

  const routineUnifiedTasks: UnifiedTask[] = [];

  routineTasks.forEach((routine: RoutineTask) => {
    if (!routine.week_days || routine.is_active === 0) return;

    let weekDays: string[] = [];
    try {
      weekDays = JSON.parse(routine.week_days);
    } catch (error) {
      console.error('Erro ao parse week_days:', error);
      return;
    }

    if (weekDays.length === 0) return;

    const startDate = new Date(currentWeekStart);
    startDate.setDate(startDate.getDate() - 7); 
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 14); 

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0 = domingo, 1 = segunda, etc.
      
      const shouldShowOnThisDay = weekDays.some(dayName => {
        const dayNumber = dayNameToNumber[dayName.toLowerCase()];
        return dayNumber === dayOfWeek;
      });
      
      if (shouldShowOnThisDay) {
        const unifiedTask = convertRoutineTaskFn(routine, new Date(d));
        
        if (unifiedTask) {
          routineUnifiedTasks.push(unifiedTask);
        }
      }
    }
  });

  console.log(`Total unified tasks (após filtro de cancelados): ${normalTasks.length + routineUnifiedTasks.length}`);
  return [...normalTasks, ...routineUnifiedTasks];
};

export const filterTasksByDateAndType = (
  tasks: UnifiedTask[],
  dateFilter: Date,
  selectedTypes: string[]
): UnifiedTask[] => {
  if (tasks.length === 0) {
    return [];
  }

  const filtered = tasks.filter(task => {
    if (!task.datetime) return false;

    const taskDateISO = task.datetime.split('T')[0];
    const selectedDateISO = dateFilter.toISOString().split('T')[0];
    
    if (taskDateISO !== selectedDateISO) return false;
    if (selectedTypes.length === 0) return true;

    const types = task.type?.split(',').map(t => t.trim()) || [];
    return selectedTypes.some(cat => types.includes(cat));
  });

  return filtered;
};

export const combineDateAndTime = (date: Date, time: Date): Date => {
  const combined = new Date(date);
  combined.setHours(time.getHours());
  combined.setMinutes(time.getMinutes());
  combined.setSeconds(0);
  combined.setMilliseconds(0);
  return combined;
};

export const getWeekDays = (currentWeekStart: Date): Date[] => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

export const navigateWeek = (currentWeekStart: Date, direction: 'previous' | 'next'): Date => {
  const newWeekStart = new Date(currentWeekStart);
  const daysToAdd = direction === 'previous' ? -7 : 7;
  newWeekStart.setDate(currentWeekStart.getDate() + daysToAdd);
  return newWeekStart;
};

export const dayHasTasks = (date: Date, allTasks: UnifiedTask[]): boolean => {
  const dateString = date.toISOString().split('T')[0];
  return allTasks.some(task => task.datetime && task.datetime.split('T')[0] === dateString);
};

export const isSelectedDay = (date: Date, dateFilter: Date): boolean => {
  return date.toDateString() === dateFilter.toDateString();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const getCategories = (allTasks: UnifiedTask[], extraCategories: { name: string; color: string }[]): string[] => {
  return Array.from(
    new Set([
      ...allTasks
        .flatMap((task) => task.type?.split(',').map((s: string) => s.trim()) ?? [])
        .filter((t) => t.length > 0),
      ...extraCategories.map(cat => cat.name),
    ])
  );
};

export const getCategoryColor = (catName: string, extraCategories: { name: string; color: string }[]): string => {
  const extraCat = extraCategories.find(c => c.name === catName);
  return extraCat ? extraCat.color : '#999999';
};

export const validateTask = (title: string): boolean => {
  return title.trim().length > 0;
};

export const showDeleteConfirmation = (
  isRoutine: boolean,
  onConfirm: () => void
): void => {
  const alertTitle = isRoutine ? 'Confirmar exclusão da rotina' : 'Confirmar exclusão';
  const alertMessage = 'Tem certeza que deseja deletar essa tarefa?';

  Alert.alert(
    alertTitle,
    alertMessage,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};


export const checkAndHandleLevelUp = async (
  userId: string,
  currentLevel: number,
  currentXp: number,
  setLevelUpData: (data: LevelUpData) => void,
  setIsLevelUpVisible: (visible: boolean) => void
): Promise<void> => {
  if (!userId || currentLevel <= 1) return;

  try {
    const savedLevel = await AsyncStorage.getItem(`userLevel_${userId}`);
    const previousLevel = savedLevel ? parseInt(savedLevel) : 1;

    if (currentLevel > previousLevel) {
      setLevelUpData({
        previousLevel,
        newLevel: currentLevel,
        xpGained: currentXp - (previousLevel * 100) 
      });
      setIsLevelUpVisible(true);
      
      await AsyncStorage.setItem(`userLevel_${userId}`, currentLevel.toString());
    }
  } catch (error) {
    console.error('Erro ao verificar level up:', error);
  }
};

export const saveCurrentLevel = async (userId: string, currentLevel: number): Promise<void> => {
  if (currentLevel > 1) {
    await AsyncStorage.setItem(`userLevel_${userId}`, currentLevel.toString());
  }
};