import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { UnifiedTask } from '../agendaHelpers';

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
        backgroundColor: "#fa4343",
        width: 100,
        height: '100%',
      }}
    >
      <Ionicons name="trash" size={25} color="white" />
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
        <View className="w-full flex flex-col justify-center px-6 h-[90px] pb-4 border-b border-neutral-700 bg-zinc-800">
          <View className="flex flex-row justify-between">
            <Pressable className="flex flex-col gap-1 mt-1" onPress={() => onEdit(item)}>
              <View className="flex flex-row items-center gap-2">
                <Text className={`text-xl font-poppins font-medium max-w-[260px] line-clamp-1 ${
                  item.completed ? 'line-through text-neutral-500' : 'text-gray-300'
                }`}>
                  {item.title}
                </Text>
                {item.isRoutine && (
                  <View className="bg-[#ffa41f] px-2 py-0.5 rounded-full">
                    <Text className="text-black text-[10px] font-poppins">rotina</Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-400 text-sm mt-1 font-poppins">
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
              className={`w-[25px] h-[25px] mt-4 rounded-lg ${
                item.completed ? 'bg-[#ffa41f]' : 'border-2 border-neutral-600'
              }`}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              {item.completed ? <Ionicons name="checkmark" size={20} color="black" /> : null}
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

export default SwipeableTaskItem;