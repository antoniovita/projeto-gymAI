import React, { useEffect, useRef } from 'react';
import {
Modal,
View,
Text,
TextInput,
TouchableOpacity,
Alert,
Animated,
} from 'react-native';
import { Category } from '../../api/model/Category';
const colorOptions = [
'#EF4444', // Vermelho
'#F97316', // Laranja
'#EAB308', // Amarelo
'#10B981', // Verde
'#3B82F6', // Azul
'#6366F1', // Índigo
'#8B5CF6', // Roxo
'#EC4899', // Rosa
'#F43F5E', // Rosa escuro
'#6B7280', // Cinza
'#FF6B6B', // Coral
'#4ECDC4', // Turquesa
];
interface CategoryModalProps {
isVisible: boolean;
onClose: () => void;
newCategoryName: string;
setNewCategoryName: (name: string) => void;
newCategoryColor: string;
setNewCategoryColor: (color: string) => void;
onAddCategory: () => void;
categories: Category[];
}
const CategoryModal: React.FC<CategoryModalProps> = ({
isVisible,
onClose,
newCategoryName,
setNewCategoryName,
newCategoryColor,
setNewCategoryColor,
onAddCategory,
categories,
}) => {
const scaleValue = useRef(new Animated.Value(0)).current;

useEffect(() => {
if (isVisible) {
scaleValue.setValue(0);
Animated.spring(scaleValue, {
toValue: 1,
useNativeDriver: true,
tension: 50,
friction: 8,
}).start();
}
}, [isVisible]);

const handleClose = () => {
Animated.timing(scaleValue, {
toValue: 0,
duration: 200,
useNativeDriver: true,
}).start(() => {
onClose();
});
};
const handleAddCategory = () => {
if (!newCategoryName.trim()) {
Alert.alert('Erro', 'O nome da categoria não pode ser vazio.');
return;
 }
if (categories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
Alert.alert('Erro', 'Essa categoria já existe.');
return;
 }
Animated.timing(scaleValue, {
toValue: 0,
duration: 200,
useNativeDriver: true,
}).start(() => {
onAddCategory();
});
 };
return (
<Modal
transparent
animationType="fade"
visible={isVisible}
onRequestClose={handleClose}
>
<View className="flex-1 justify-center items-center bg-black/50 px-8">
<Animated.View 
style={{ transform: [{ scale: scaleValue }] }}
className="bg-zinc-800 p-6 rounded-2xl w-full"
>
<TextInput
placeholder="Nome da categoria"
placeholderTextColor="#a1a1aa"
value={newCategoryName}
onChangeText={setNewCategoryName}
className="text-white font-poppins pb-4 text-lg max-w-[300px] rounded mb-4"
/>
<View className="flex flex-row flex-wrap gap-2 mb-4">
{colorOptions.map((color) => (
<TouchableOpacity
key={color}
onPress={() => setNewCategoryColor(color)}
style={{
backgroundColor: color,
width: 40,
height: 40,
borderRadius: 20,
borderWidth: newCategoryColor === color ? 3 : 1,
borderColor: newCategoryColor === color ? '#fff' : '#333',
 }}
/>
 ))}
</View>
<TouchableOpacity
onPress={handleAddCategory}
className="bg-[#ffa41f] p-3 mt-3 rounded-xl items-center"
>
<Text className="text-black font-semibold font-poppins">Adicionar Categoria</Text>
</TouchableOpacity>
<TouchableOpacity
onPress={handleClose}
className="mt-4 p-2"
>
<Text className="text-neutral-400 text-center font-poppins">Cancelar</Text>
</TouchableOpacity>
</Animated.View>
</View>
</Modal>
 );
};
export default CategoryModal;