import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type HelpItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  label: string;
  onPress: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
};

const HelpItem: React.FC<HelpItemProps> = ({
  icon,
  color = 'white',
  label,
  onPress,
  rightIcon = 'chevron-forward',
  destructive = false,
}) => (
  <Pressable
    className="flex flex-row items-center justify-between px-6 h-[70px] border-b border-neutral-700 bg-zinc-800"
    onPress={onPress}
  >
    <View className="flex flex-row items-center gap-3">
      <View className={`w-8 h-8 rounded-lg items-center justify-center ${destructive ? 'bg-rose-500/20' : 'bg-zinc-700'}`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className={`text-[16px] font-sans ${destructive ? 'text-rose-400' : 'text-gray-300'}`}>
        {label}
      </Text>
    </View>
    <Ionicons name={rightIcon} size={20} color="#a1a1aa" />
  </Pressable>
);

type SectionHeaderProps = {
  title: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View className="px-4 pt-6">
    <Text className="text-neutral-400 font-sans uppercase text-sm tracking-wide">
      {title}
    </Text>
  </View>
);

const AttendanceInfo: React.FC = () => (
  <View className="px-6 mb-6">
    <View className="px-4 py-4 rounded-2xl bg-[#35353a] border border-zinc-700">
      <View className="flex flex-row items-center gap-3 mb-2">
        <View className="w-8 h-8 rounded-lg items-center justify-center bg-zinc-700">
          <Ionicons name="time-outline" size={18} color="white" />
        </View>
        <Text className="text-white text-[16px] font-sans font-medium">Horário de Atendimento</Text>
      </View>
      <Text className="text-zinc-400 text-[14px] font-sans ml-11 leading-5">
        Segunda à Sexta: 9h às 18h (Brasília){'\n'}
        Sábados: 9h às 14h{'\n'}
        Domingos: Emergências apenas
      </Text>
    </View>
  </View>
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

  const handleTiktokPress = () => {
    Linking.openURL('https://tiktok.com/@meuapp');
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
    <SafeAreaView className={`flex-1 ${Platform.OS == 'android' && "py-[30px]"} bg-zinc-800`}>
      {/* Header */}
      <View className="mt-5 px-4 mb-2 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="ml-2 text-white font-sans text-[16px]">Voltar</Text>
        </Pressable>
        <View className="absolute left-0 right-0 items-center">
          <Text className="text-white font-sans text-[15px]">Ajuda & Suporte</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionHeader title="Contato Direto" />
        <HelpItem
          icon="mail-outline"
          label="E-mail"
          onPress={handleEmailPress}
        />
        <HelpItem
          icon="logo-whatsapp"
          label="WhatsApp"
          onPress={handleWhatsappPress}
        />

        <SectionHeader title="Redes Sociais" />
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
          label="TikTok"
          onPress={handleTiktokPress}
        />

        <SectionHeader title="Informações" />
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
          icon="shield-checkmark-outline"
          label="Política de Privacidade"
          onPress={handlePrivacyPress}
        />
        <HelpItem
          icon="reader-outline"
          label="Termos de Uso"
          onPress={handleTermsPress}
        />
        <HelpItem
          icon="globe-outline"
          label="Site Oficial"
          onPress={handleWebsitePress}
        />

        <SectionHeader title="Atendimento" />
        <AttendanceInfo />
      </ScrollView>
    </SafeAreaView>
  );
}