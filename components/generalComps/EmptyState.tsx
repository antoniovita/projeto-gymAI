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
          <Image style={{width: 160, height: 160}} source={image} />
        </View>
        <Text className="text-neutral-400 text-xl mt-3 font-medium font-sans mb-2 text-center">
          {title}
        </Text>
        <Text
          className="text-neutral-400 text-sm font-sans text-center"
          style={{ maxWidth: 230 }}
        >
          {subtitle || 'Crie novas tarefas para organizar sua rotina'}
        </Text>
      </View>
    </View>
  );
};