import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const labels = ['Boas-vindas', 'Seus dados', 'Escolha do plano'];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <View className="px-6 py-4">
      <View className="flex-row items-center mb-3">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <React.Fragment key={idx}>
              <View
                className={`w-8 h-8 rounded-full border-2 items-center justify-center 
                  ${done ? 'bg-[#ff7a7f] border-[#ff7a7f]' : active ? 'bg-white border-white' : 'bg-transparent border-neutral-500'}`}
              >
                {done ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text className={`text-sm font-sans ${active ? 'text-black' : 'text-neutral-500'}`}>{idx + 1}</Text>
                )}
              </View>
              {idx < totalSteps - 1 && (
                <View className={`flex-1 h-0.5 mx-2 ${done ? 'bg-[#ff7a7f]' : 'bg-neutral-600'}`} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <Text className="text-white text-center text-sm font-sans opacity-90">
        {labels[currentStep]} ({currentStep + 1}/{totalSteps})
      </Text>
    </View>
  );
}

