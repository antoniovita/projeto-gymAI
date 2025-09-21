//general imports
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, Alert, FlatList,
  Pressable, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';

//hooks
import { useTask } from '../../../hooks/useTask';
import { useRoutineTasks } from '../../../hooks/useRoutineTasks';
import { useStats } from '../../../hooks/useStats';
import { useAuth } from 'hooks/useAuth';
import { useCategory } from 'hooks/useCategory';
import { useTheme } from 'hooks/useTheme';

// general components
import CategoryModal from '../../generalComps/CategoryModal';
import DeleteCategoryModal from '../../generalComps/DeleteCategoryModal';
import LoadingSpinner from '../../generalComps/LoadingSpinner';
import { EmptyState } from '../../generalComps/EmptyState';
import LevelUpModal from '../../generalComps/LevelUpModal';
import GradientIcon from '../../generalComps/GradientIcon';
import CategoryFilters from '../../generalComps/CategoryFilters';

//specific components
import SwipeableTaskItem from './comps/SwipeableTaskItem';
import TaskModal from './comps/CreateTask';

//constants
import { OUTLINE } from '../../../imageConstants'

//helpers
import {
  LevelUpData,
  getInitialWeekStart,
  convertRoutineToUnifiedTask,
  getUnifiedTasks,
  filterTasksByDateAndType,
  combineDateAndTime,
  getWeekDays,
  navigateWeek,
  dayHasTasks,
  isSelectedDay,
  isToday,
  validateTask,
  showDeleteConfirmation,
  checkAndHandleLevelUp,
  saveCurrentLevel
} from './agendaHelpers';

//types
import { UnifiedTask } from 'api/types/taskTypes';
import { RoutineTask } from 'api/types/routineTaskTypes';


export default function AgendaScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  
  const {
    categories: allCategories,
    loading: categoryLoading,
    error: categoryError,
    createCategory,
    deleteCategory,
    getCategoriesByType,
    refreshCategories
  } = useCategory();

  const {
    tasks,
    createTask,
    updateTask,
    fetchTasks,
    updateTaskCompletion,
    deleteTask,
  } = useTask();

  const {
    routineTasks,
    loading: routineLoading,
    error: routineError,
    refreshRoutineTasks,
    completeRoutineTaskForDate,
    uncompleteRoutineTaskForDate,
    cancelRoutineTaskForDate,
    updateRoutineTask,
    isCompletedOnDate,
    isCancelledOnDate,
  } = useRoutineTasks();

  const {
    userStats,
    loadUserStats,
    addExperience,
    currentLevel,
    currentXp
  } = useStats();

  // Estados do componente
  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData>({
    previousLevel: 1,
    newLevel: 1,
    xpGained: 0
  });
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [taskContent, setTaskContent] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#EF4444');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date());
  const [filteredTasks, setFilteredTasks] = useState<UnifiedTask[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getInitialWeekStart);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const taskCategories = getCategoriesByType('agenda');

  // Handlers para categorias
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'O nome da categoria não pode estar vazio.');
      return;
    }
    
    try {
      await createCategory(newCategoryName.trim(), newCategoryColor, 'agenda');
      setNewCategoryName('');
      setNewCategoryColor('#EF4444');
      setIsCategoryModalVisible(false);
      Alert.alert('Sucesso', 'Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const category = allCategories.find(cat => cat.name === categoryName);
      if (!category) {
        Alert.alert('Erro', 'Categoria não encontrada.');
        return;
      }

      Alert.alert(
        'Confirmar exclusão',
        `Tem certeza que deseja excluir a categoria "${categoryName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategory(category.id);
                Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
              } catch (error) {
                console.error('Erro ao deletar categoria:', error);
                Alert.alert('Erro', 'Não foi possível excluir a categoria.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      Alert.alert('Erro', 'Não foi possível excluir a categoria.');
    }
  };

  // Função para verificar se rotina está completa na data
  const isRoutineCompletedOnDate = useCallback((routine: RoutineTask, targetDate: Date): boolean => {
    const targetDateString = format(targetDate, 'yyyy-MM-dd');
    return isCompletedOnDate(routine, targetDateString);
  }, [isCompletedOnDate]);

  // Função para converter rotina para UnifiedTask usando helper
  const convertRoutineTaskToUnified = useCallback((routine: RoutineTask, targetDate: Date): UnifiedTask | null => {
    return convertRoutineToUnifiedTask(routine, targetDate, isRoutineCompletedOnDate, isCancelledOnDate);
  }, [isRoutineCompletedOnDate, isCancelledOnDate]);

  // Função para obter todas as tasks unificadas usando helper
  const getAllUnifiedTasks = useCallback((): UnifiedTask[] => {
    return getUnifiedTasks(tasks, routineTasks, currentWeekStart, convertRoutineTaskToUnified);
  }, [tasks, routineTasks, currentWeekStart, convertRoutineTaskToUnified]);

  const allUnifiedTasks = getAllUnifiedTasks();

  // Handlers para task completion
  const handleTaskCompletion = async (taskId: string, completed: 0 | 1, isRoutine: boolean = false, routineId?: string, targetDate?: string, xpReward: number = 50) => {
    try {
      if (isRoutine && routineId && targetDate) {
        if (completed === 0) {
          const result = await completeRoutineTaskForDate(routineId, targetDate, userId!, xpReward);
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Não foi possível completar a rotina.');
            return;
          }

          if (userId) {
            const expResult = await addExperience(userId, xpReward);
            if (expResult.data?.leveledUp) {
              setLevelUpData({
                previousLevel: expResult.data.previousLevel,
                newLevel: expResult.data.newLevel,
                xpGained: xpReward
              });
              setIsLevelUpVisible(true);
            }
          }
        } else {
          const result = await uncompleteRoutineTaskForDate(routineId, targetDate, userId!);
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Não foi possível descompletar a rotina.');
            return;
          }
        }
      } else {
        await updateTaskCompletion(userId!, taskId, completed === 0 ? 1 : 0);
        if (completed === 0 && userId) {
          const result = await addExperience(userId, xpReward);
          if (result.data?.leveledUp) {
            setLevelUpData({
              previousLevel: result.data.previousLevel,
              newLevel: result.data.newLevel,
              xpGained: xpReward
            });
            setIsLevelUpVisible(true);
          }
        }
        await fetchTasks(userId!);
      }
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

  // Handler para salvar task
  const handleSaveTask = async () => {
    if (!validateTask(newTaskTitle)) {
      Alert.alert('Erro', 'O título não pode estar vazio.');
      return;
    }

    try {
      setIsSaving(true);
      const categoriesString = selectedCategories.join(', ');
      const combinedDateTime = combineDateAndTime(date, time);
      const datetimeISO = combinedDateTime.toISOString();

      if (selectedTask) {
        if (selectedTask.isRoutine && selectedTask.routineId) {
          const result = await updateRoutineTask(
            selectedTask.routineId,
            newTaskTitle,
            taskContent,
            selectedTask.originalWeekDays,
            categoriesString,
            datetimeISO
          );
          if (!result.success) {
            Alert.alert('Erro', result.error || 'Falha ao atualizar rotina.');
            return;
          }
        } else {
          await updateTask(selectedTask.id, {
            title: newTaskTitle,
            content: taskContent,
            type: categoriesString,
            datetime: datetimeISO,
          });
          await fetchTasks(userId!);
        }
      } else {
        await createTask(
          newTaskTitle,
          taskContent,
          datetimeISO,
          userId!,
          categoriesString
        );
        await fetchTasks(userId!);
      }

      resetModal();
    } catch (err) {
      console.error('[handleSaveTask] Erro:', err);
      Alert.alert('Erro', 'Falha ao salvar tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para abrir edição
  const handleOpenEdit = (task: UnifiedTask) => {
    setSelectedTask(task);
    setNewTaskTitle(task.title);
    setTaskContent(task.content || '');
    const parsedCategories = task.type
      ? task.type.split(',').map((cat: string) => cat.trim())
      : [];
    setSelectedCategories(parsedCategories);

    if (task.datetime) {
      const dateObj = new Date(task.datetime);
      setDate(dateObj);
      setTime(dateObj);
    } else {
      setDate(new Date());
      setTime(new Date());
    }

    setIsCreateVisible(true);
  };

  // Handler para toggle completion
  const toggleTaskCompletion = async (taskId: string, completed: 0 | 1, isRoutine?: boolean, routineId?: string, targetDate?: string) => {
    await handleTaskCompletion(taskId, completed, isRoutine, routineId, targetDate);
  };

  // Handler para deletar task
  const handleDeleteTask = (taskId: string, date: string, isRoutine?: boolean, routineId?: string) => {
    const taskToDelete = allUnifiedTasks.find(task => task.id === taskId);
    if (!taskToDelete) {
      Alert.alert('Erro', 'Tarefa não encontrada.');
      return;
    }

    const onConfirm = async () => {
      if (isRoutine && routineId) {
        const result = await cancelRoutineTaskForDate(routineId, date);
        if (!result.success) {
          Alert.alert('Erro', result.error || 'Não foi possível deletar a rotina.');
          return;
        }
      } else {
        await deleteTask(taskId);
        await fetchTasks(userId!);
      }
      setFilteredTasks(prev => prev.filter(task => task.id !== taskId));
    };

    showDeleteConfirmation(!!isRoutine, onConfirm);
  };

  // Handlers de navegação
  const handleRefresh = async () => {
    if (userId) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 150);
      await Promise.all([
        fetchTasks(userId),
        refreshRoutineTasks(userId),
        refreshCategories()
      ]);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => navigateWeek(prev, 'previous'));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => navigateWeek(prev, 'next'));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getInitialWeekStart());
  };

  // Handler para seleção de dia
  const onDaySelect = async (date: Date) => {
    setDateFilter(date);
    setDate(date);
    if (userId) {
      await Promise.all([
        fetchTasks(userId),
        refreshRoutineTasks(userId)
      ]);
    }
  };

  // Função para resetar modal
  const resetModal = () => {
    setIsCreateVisible(false);
    setNewTaskTitle('');
    setSelectedCategories([]);
    setSelectedTask(null);
    setTaskContent('');
    setDate(dateFilter);
    setTime(new Date());
  };

  const handleCreateTaskFromEmpty = () => {
    resetModal();
    setDate(dateFilter);
    setTime(new Date());
    setIsCreateVisible(true);
  };

  // Effects
  useEffect(() => {
    if (routineError) {
      Alert.alert('Erro', routineError);
    }
  }, [routineError]);

  useEffect(() => {
    if (categoryError) {
      Alert.alert('Erro', categoryError);
    }
  }, [categoryError]);

  useEffect(() => {
    if (userId) {
      loadUserStats(userId);
    }
  }, [userId, loadUserStats]);

  useEffect(() => {
    const handleLevelUp = async () => {
      if (userId && userStats && currentLevel > 1) {
        await checkAndHandleLevelUp(userId, currentLevel, currentXp, setLevelUpData, setIsLevelUpVisible);
        await saveCurrentLevel(userId, currentLevel);
      }
    };

    handleLevelUp();
  }, [currentLevel, userId, userStats, currentXp]);

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        if (!userId) return;
        
        try {
          setIsLoading(true);
          console.log('=== CARREGAMENTO INICIAL DA AGENDA ===');
          await Promise.all([
            fetchTasks(userId),
            refreshRoutineTasks(userId),
            loadUserStats(userId),
            refreshCategories()
          ]);
          console.log('=== CARREGAMENTO INICIAL CONCLUÍDO ===');
        } catch (error) {
          console.error('Erro no carregamento inicial:', error);
          Alert.alert('Erro', 'Falha ao carregar dados iniciais');
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialData();
    }, [userId])
  );

  useEffect(() => {
    const unified = getAllUnifiedTasks();
    const filtered = filterTasksByDateAndType(unified, dateFilter, selectedTypes);
    setFilteredTasks(filtered);
    console.log(`Filtro local: ${filtered.length} tasks para ${format(dateFilter, 'dd/MM/yyyy')} (sem cancelados)`);
  }, [getAllUnifiedTasks, dateFilter, selectedTypes]);

  const isCurrentlyLoading = isLoading || isSaving || routineLoading || categoryLoading;

  const renderTaskItem = ({ item }: { item: UnifiedTask }) => (
    <SwipeableTaskItem
      item={item}
      onEdit={handleOpenEdit}
      onToggleCompletion={toggleTaskCompletion}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <SafeAreaView style={[{ 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? 30 : 0 
    }]}>
      <LevelUpModal
        visible={isLevelUpVisible}
        currentLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        onClose={() => setIsLevelUpVisible(false)}
        title="Excelente!"
      />

      <LoadingSpinner visible={isCurrentlyLoading} />

      {/* Floating Action Button */}
      <Pressable
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 20,
          borderRadius: 25,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={() => {
          resetModal();
          setIsCreateVisible(true);
        }}
      >
        <LinearGradient
          colors={[...(colors.linearGradient.primary as [string, string, ...string[]])]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            width: 50, 
            height: 50, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            borderRadius: 25
          }}
        >
          <Feather name="plus" strokeWidth={3} size={32} color={colors.onPrimary} />
        </LinearGradient>
      </Pressable>

      {/* Header */}
      <View style={{
        marginTop: 20,
        paddingHorizontal: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ width: 80 }} />
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center'
        }}>
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: '500'
          }}>Agenda</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginRight: 4
        }}>
          <Pressable onPress={goToCurrentWeek}>
            <GradientIcon name="today" size={22} />
          </Pressable>
          <Pressable onPress={handleRefresh}>
            <GradientIcon name="refresh-circle" size={26} />
          </Pressable>
          <Pressable onPress={() => setShowDeleteCategoryModal(true)}>
            <GradientIcon name="folder" size={22} />
          </Pressable>
        </View>
      </View>

      {/* Calendar Widget */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{
          backgroundColor: colors.secondary,
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12
          }}>
            <Text style={{
              color: colors.text,
              fontSize: 16
            }}>
              {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())}
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
            backgroundColor: colors.surface
          }}>
            {getWeekDays(currentWeekStart).map((day, index) => {
              const dayLetter = format(day, 'EEEEE', { locale: ptBR }).toUpperCase();
              return (
                <Text key={index} style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  textAlign: 'center',
                  width: 40
                }}>
                  {dayLetter}
                </Text>
              );
            })}
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12
          }}>
            <Pressable onPress={goToPreviousWeek} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="chevron-back" size={20} color={colors.chevronColor} />
            </Pressable>
            
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              {getWeekDays(currentWeekStart).map((day, index) => {
                const selected = isSelectedDay(day, dateFilter);
                const today = isToday(day);
                const hasTasks = dayHasTasks(day, allUnifiedTasks);
                
                return (
                  <Pressable
                    key={index}
                    onPress={() => onDaySelect(day)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.selected : 'transparent'
                    }}
                  >
                    <Text style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: 14,
                      color: selected ? colors.textSelected : 
                             today ? colors.textToday : 
                             colors.text,
                      fontWeight: selected ? 'bold' : today ? '500' : 'normal'
                    }}>
                      {day.getDate()}
                    </Text>
                    {hasTasks && !selected && (
                      <View style={{
                        width: 4,
                        height: 4,
                        backgroundColor: colors.taskIndicator,
                        borderRadius: 2,
                        position: 'absolute',
                        bottom: 0
                      }} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            
            <Pressable onPress={goToNextWeek} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="chevron-forward" size={20} color={colors.chevronColor} />
            </Pressable>
          </View>
        </View>
      </View>

      <CategoryFilters
        categories={taskCategories}
        selectedTypes={selectedTypes}
        onToggleCategory={(categoryName) =>
          setSelectedTypes((prev) =>
            prev.includes(categoryName) 
              ? prev.filter((c) => c !== categoryName) 
              : [...prev, categoryName]
          )
        }
        onAddNewCategory={() => setIsCategoryModalVisible(true)}
        addButtonText="Nova Categoria"
        showAddButton={true}
      />

      {filteredTasks.length === 0 ? (
        <EmptyState
          image={OUTLINE.fuocoCALENDAR}
          title="Nenhuma tarefa encontrada"
          subtitle="Adicione novas tarefas para organizar seu dia"
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modals */}
      <TaskModal
        isVisible={isCreateVisible}
        onClose={resetModal}
        onSave={handleSaveTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        taskContent={taskContent}
        setTaskContent={setTaskContent}
        date={date}
        time={time}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
        setDate={setDate}
        setTime={setTime}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={taskCategories}
        onAddNewCategory={() => setIsCategoryModalVisible(true)}
      />

      <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryColor={newCategoryColor}
        setNewCategoryColor={setNewCategoryColor}
        onAddCategory={handleAddCategory}
        categories={taskCategories}
      />

      <DeleteCategoryModal
        isVisible={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        categories={taskCategories}
        onDeleteCategory={handleDeleteCategory}
      />
    </SafeAreaView>
  );
}