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

type HelpItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  label: string;
  onPress: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

const HelpItem: React.FC<HelpItemProps> = ({
  icon,
  color = 'white',
  label,
  onPress,
  rightIcon = 'chevron-forward',
}) => (
  <TouchableOpacity
    className="flex flex-row items-center justify-between py-7 border-b border-zinc-700"
    onPress={onPress}
  >
    <View className="flex flex-row items-center gap-3">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-white text-[16px] font-sans">{label}</Text>
    </View>
    <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
  </TouchableOpacity>
);

export default function HelpScreen() {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:suporte@meuapp.com?subject=Ajuda - Aplicativo');
  };

  const handleWhatsappPress = () => {
    Linking.openURL('https://wa.me/5511999999999?text=Olá, preciso de ajuda com o aplicativo');
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://instagram.com/meuapp');
  };

  const handleTwitterPress = () => {
    Linking.openURL('https://twitter.com/meuapp');
  };

  const handleLinkedInPress = () => {
    Linking.openURL('https://linkedin.com/company/meuapp');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://meuapp.com/suporte');
  };

  const handleFAQPress = () => {
    console.log('FAQ pressed');
  };

  const handleDocumentationPress = () => {
    console.log('Documentation pressed');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy policy pressed');
  };

  const handleTermsPress = () => {
    console.log('Terms of use pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
            <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="flex-row items-center py-2"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-sans text-[16px] ml-1">Voltar</Text>
        </TouchableOpacity>
        
        <Text className="text-white font-sans text-[15px] font-semibold">Ajuda & Suporte</Text>
        
        <View style={{ width: 70 }} />
      </View>

      <ScrollView className="flex-1 mt-10 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-zinc-400 uppercase font-sans text-xs mb-2">Contato Direto</Text>
        <HelpItem
          icon="mail-outline"
          color="#ffff"
          label="E-mail"
          onPress={handleEmailPress}
        />

        <Text className="text-zinc-400 font-sans uppercase text-xs mt-6 mb-2">Redes Sociais</Text>
        <HelpItem
          icon="logo-instagram"
          color="#ff7a7f"
          label="Instagram"
          onPress={handleInstagramPress}
        />
        <HelpItem
          icon="logo-twitter"
          color="#ff7a7f"
          label="Twitter"
          onPress={handleTwitterPress}
        />
        <HelpItem
          icon="logo-linkedin"
          color="#ff7a7f"
          label="LinkedIn"
          onPress={handleLinkedInPress}
        />
        <HelpItem
          icon="logo-tiktok"
          color="#ff7a7f"
          label="Tiktok"
          onPress={handleWebsitePress}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Informações</Text>
        <HelpItem
          icon="help-circle-outline"
          label="Perguntas Frequentes"
          onPress={handleFAQPress}
        />
        <HelpItem
          icon="document-text-outline"
          label="Documentação"
          onPress={handleDocumentationPress}
        />
        <HelpItem
          icon="shield-outline"
          label="Política de Privacidade"
          onPress={handlePrivacyPress}
        />
        <HelpItem
          icon="reader-outline"
          label="Termos de Uso"
          onPress={handleTermsPress}
        />

        <Text className="text-zinc-400 uppercase text-xs mt-6 mb-2">Atendimento</Text>
        <View className="py-4 border-b border-zinc-700">
          <View className="flex flex-row items-center gap-3">
            <Ionicons name="time-outline" size={20} color="#ffff" />
            <Text className="text-white text-[16px] font-sans">Horário de Atendimento</Text>
          </View>
          <Text className="text-zinc-400 text-[12px] font-sans mt-2 ml-8">
            Segunda à Sexta: 9h às 18h (Brasília)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}