import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { UnifiedTask } from '../agendaHelpers';
import { useTheme } from 'hooks/useTheme';

interface SwipeableTaskItemProps {
  item: UnifiedTask;
  onEdit: (task: UnifiedTask) => void;
  onToggleCompletion: (
    taskId: string,
    completed: 0 | 1,
    isRoutine?: boolean,
    routineId?: string,
    targetDate?: string
  ) => void;
  onDelete: (
    taskId: string,
    date: string,
    isRoutine?: boolean,
    routineId?: string
  ) => void;
}

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  item,
  onEdit,
  onToggleCompletion,
  onDelete
}) => {
  let swipeableRow: any;
  
  // Add theme hook
  const theme = useTheme();

  const closeSwipeable = () => {
    swipeableRow?.close();
  };

  const renderLeftActions = () => (
    <TouchableOpacity
      onPress={() => {
        closeSwipeable();
        onDelete(item.id, item.datetime.split("T")[0], item.isRoutine, item.routineId);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.deleteAction,
        width: 100,
        height: '100%',
      }}
    >
      <Ionicons name="trash" size={25} color={theme.colors.deleteActionIcon} />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={(ref: any) => { swipeableRow = ref; }}
        renderLeftActions={renderLeftActions}
        leftThreshold={40}
        friction={1}
        overshootLeft={false}
      >
        <View style={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingHorizontal: 24,
          height: 90,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Pressable 
              style={{
                flexDirection: 'column',
                gap: 4,
                marginTop: 4,
              }}
              onPress={() => onEdit(item)}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontFamily: 'Poppins',
                  maxWidth: 260,
                  color: item.completed ? theme.colors.textMuted : theme.colors.itemTitle,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                }} 
                numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.isRoutine && (
                  <View style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: theme.colors.onPrimary,
                      fontSize: 10,
                      fontFamily: 'Poppins',
                    }}>
                      rotina
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{
                color: theme.colors.textExpenseDate,
                fontSize: 14,
                marginTop: 4,
                fontFamily: 'Poppins',
              }}>
                {format(new Date(item.datetime), 'dd/MM/yyyy')} - {format(new Date(item.datetime), 'HH:mm')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onToggleCompletion(
                item.id,
                item.completed,
                item.isRoutine,
                item.routineId,
                item.targetDate
              )}
              style={{
                width: 25,
                height: 25,
                marginTop: 16,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: item.completed ? theme.colors.taskIndicator : 'transparent',
                borderWidth: item.completed ? 0 : 2,
                borderColor: item.completed ? 'transparent' : theme.colors.border,
              }}
            >
              {item.completed ? (
                <Ionicons 
                  name="checkmark" 
                  size={20} 
                  color={theme.colors.onPrimary} 
                />
              ) : null}
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

export default SwipeableTaskItem;