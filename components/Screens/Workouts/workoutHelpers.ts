import { Alert } from 'react-native';
import { Workout, Exercise } from '../../../api/model/Workout';

export interface WorkoutFormData {
  title: string;
  muscles: string[];
  exercises: Exercise[];
}

export interface ExerciseFormData {
  name: string;
  reps: string;
  series: string;
}

// Validações
export const validateWorkoutForm = (formData: WorkoutFormData): string | null => {
  if (!formData.title.trim()) {
    return 'O título do treino não pode estar vazio.';
  }

  if (formData.exercises.length === 0) {
    return 'Adicione pelo menos um exercício ao treino.';
  }

  return null;
};

export const validateCategoryName = (
  name: string,
  existingCategories: Array<{ name: string }>
): string | null => {
  if (!name.trim()) {
    return 'O nome da categoria não pode ser vazio.';
  }

  if (existingCategories.find(cat => 
    cat.name.toLowerCase() === name.trim().toLowerCase()
  )) {
    return 'Essa categoria já existe.';
  }

  return null;
};

// Manipulação de dados
export const extractMuscleCategories = (workouts: Workout[]): string[] => {
  return Array.from(
    new Set(
      workouts
        .flatMap((workout) => 
          workout.type?.split(',').map((s: string) => s.trim()) ?? []
        )
        .filter((muscle) => muscle.length > 0)
    )
  );
};

export const mergeCategoriesWithMuscles = (
  workoutCategories: Array<{ name: string }>,
  taskMuscles: string[]
): string[] => {
  return [
    ...workoutCategories.map(cat => cat.name),
    ...taskMuscles.filter(muscle => 
      !workoutCategories.some(cat => cat.name === muscle)
    )
  ];
};

export const getCategoryColor = (
  categoryName: string,
  workoutCategories: Array<{ name: string; color: string }>,
  fallbackColor: string
): string => {
  const category = workoutCategories.find(c => c.name === categoryName);
  return category ? category.color : fallbackColor;
};

export const filterWorkoutsByCategories = (
  workouts: Workout[],
  selectedCategories: string[]
): Workout[] => {
  if (selectedCategories.length === 0) {
    return workouts;
  }

  return workouts.filter((workout) =>
    workout.type?.split(',').some((muscle) => 
      selectedCategories.includes(muscle.trim())
    )
  );
};

export const isCategoryInUse = (
  categoryName: string,
  workouts: Workout[]
): boolean => {
  return workouts.some(workout =>
    workout.type?.split(',')
      .map((t: string) => t.trim())
      .includes(categoryName)
  );
};

// Formatação
export const formatWorkoutDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const getCurrentDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getExerciseCountText = (count: number): string => {
  return `${count} exercício${count !== 1 ? 's' : ''}`;
};

// Handlers de ações
export const handleDeleteWorkout = (
  workoutId: string,
  onConfirm: (id: string) => Promise<void>
): void => {
  Alert.alert(
    'Excluir treino',
    'Tem certeza que deseja excluir este treino?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => onConfirm(workoutId),
      },
    ],
    { cancelable: true }
  );
};

export const handleDuplicateWorkout = (
  workoutId: string,
  onConfirm: (id: string) => Promise<void>
): void => {
  Alert.alert(
    'Duplicar treino',
    'Tem certeza que deseja duplicar este treino?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Duplicar',
        style: 'cancel',
        onPress: () => onConfirm(workoutId),
      },
    ],
    { cancelable: true }
  );
};

export const handleDeleteCategory = (
  categoryName: string,
  workouts: Workout[],
  onConfirm: (name: string) => Promise<void>
): void => {
  if (isCategoryInUse(categoryName, workouts)) {
    Alert.alert(
      'Erro', 
      'Esta categoria está associada a uma ou mais tarefas e não pode ser excluída.'
    );
    return;
  }

  onConfirm(categoryName);
};

// Inicialização de formulários
export const getInitialWorkoutForm = (): WorkoutFormData => ({
  title: '',
  muscles: [],
  exercises: []
});

export const getInitialExerciseForm = (): ExerciseFormData => ({
  name: '',
  reps: '10',
  series: '3'
});

export const workoutToFormData = (workout: Workout): WorkoutFormData => ({
  title: workout.name,
  muscles: workout.type ? workout.type.split(',').map(m => m.trim()) : [],
  exercises: workout.exercises || []
});

// Estados de controle
export const resetWorkoutForm = () => ({
  ...getInitialWorkoutForm(),
  ...getInitialExerciseForm()
});