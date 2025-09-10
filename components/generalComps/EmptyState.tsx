import {
  View,
  Text,
  Image,
  ImageSourcePropType
} from 'react-native';

interface EmptyStateProps {
  image: ImageSourcePropType;
  title?: string;
  subtitle?: string;
}

export const EmptyState = ({
  image,
  title,
  subtitle
}: EmptyStateProps) => {

  return (
    <View 
      className="absolute inset-0 justify-center items-center px-8"
      style={{ zIndex: -200 }}
    >
      <View className="items-center mt-[200px]">
        <View className="items-center">
          <Image style={{width: 130, height: 130}} source={image} />
        </View>
        <Text className="text-neutral-400 text-md font-medium mb-1 font-poppins text-center">
          {title}
        </Text>
        <Text
          className="text-neutral-500 text-[11px] max-w-[180px] font-poppins text-center"
        >
          {subtitle || 'Crie novas tarefas para organizar sua rotina'}
        </Text>
      </View>
    </View>
  );
};