import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HelpScreen() {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:suporte@meuapp.com?subject=Ajuda');
  };

  const handleWhatsappPress = () => {
    Linking.openURL('https://wa.me/5599999999999'); // substitua pelo número do suporte
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <View className="mt-[20px] flex flex-row items-center px-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-sans text-[16px] ml-1">Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 mt-6 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-white font-sans text-[24px] font-bold mb-4">Ajuda & Suporte</Text>

        <Text className="text-zinc-300 font-sans text-[16px] mb-4">
          Se você estiver enfrentando problemas com o aplicativo ou tiver dúvidas, entre em contato
          com nossa equipe de suporte. Estamos aqui para ajudar!
        </Text>

        <Text className="text-white font-sans text-[18px] mt-4 mb-2">📧 E-mail</Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text className="text-[#60a5fa] font-sans text-[16px]">suporte@meuapp.com</Text>
        </TouchableOpacity>

        <Text className="text-white font-sans text-[18px] mt-6 mb-2">📱 WhatsApp</Text>
        <TouchableOpacity onPress={handleWhatsappPress}>
          <Text className="text-[#60a5fa] font-sans text-[16px]">Fale conosco no WhatsApp</Text>
        </TouchableOpacity>

        <Text className="text-white font-sans text-[18px] mt-6 mb-2">📄 Outras dúvidas</Text>
        <Text className="text-zinc-300 font-sans text-[16px]">
          Para saber mais sobre termos, política de privacidade ou como usamos seus dados, acesse as configurações do aplicativo ou nosso site oficial.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
