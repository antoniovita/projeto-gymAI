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

  const SupportItem = ({ icon, title, subtitle, onPress, iconColor = '#60a5fa' }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-zinc-800 rounded-xl p-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View 
          className="w-10 h-10 rounded-lg items-center justify-center mr-4"
          style={{ backgroundColor: iconColor + '20' }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-sans text-[16px] font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-zinc-400 font-sans text-[12px] mt-1">{subtitle}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#71717a" />
      </View>
    </TouchableOpacity>
  );

  const SocialMediaSection = () => (
    <View className="bg-zinc-800 rounded-xl p-4 mb-6">
      <View className="flex-row justify-around">
        <TouchableOpacity 
          onPress={handleInstagramPress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#E4405F20' }}>
            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
          </View>
          <Text className="text-zinc-300 font-sans text-[12px]">Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleTwitterPress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#1DA1F220' }}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </View>
          <Text className="text-zinc-300 font-sans text-[12px]">Twitter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLinkedInPress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#0077B520' }}>
            <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
          </View>
          <Text className="text-zinc-300 font-sans text-[12px]">LinkedIn</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleWebsitePress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#10b98120' }}>
            <Ionicons name="globe-outline" size={24} color="#10b981" />
          </View>
          <Text className="text-zinc-300 font-sans text-[12px]">Website</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* Header */}
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

      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Contact Options */}
        <View className="mt-8 mb-6">
          <Text className="text-zinc-400 font-sans uppercase text-xs mb-2 ml-1">
            CONTATO DIRETO
          </Text>
          
          <SupportItem
            icon="mail"
            title="E-mail"
            subtitle=" Contate-nos • Resposta em até 24h"
            onPress={handleEmailPress}
            iconColor="#60a5fa"
          />
        </View>

        {/* Social Media */}
        <View className="mb-6">
          <Text className="text-zinc-400 font-sans uppercase text-xs mb-2 ml-1">
            REDES SOCIAIS
          </Text>
          <SocialMediaSection />
        </View>

        {/* Additional Info */}
        <View className="mb-6">
          <Text className="text-zinc-400 font-sans uppercase text-xs mb-2 ml-1">
            INFORMAÇÕES ADICIONAIS
          </Text>
          
          <View className="bg-zinc-800 rounded-xl p-4">
            <View className="flex-row items-start mb-4">
              <Ionicons name="document-text" size={20} color="#f59e0b" style={{ marginTop: 2, marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-white font-sans text-[16px] font-medium">Documentação</Text>
                <Text className="text-zinc-400 font-sans text-[12px] mt-1">
                  Termos de uso, política de privacidade e FAQ disponíveis no aplicativo
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="time" size={20} color="#8b5cf6" style={{ marginTop: 2, marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-white font-sans text-[16px] font-medium">Horário de Atendimento</Text>
                <Text className="text-zinc-400 font-sans text-[12px] mt-1">
                  Segunda à Sexta: 9h às 18h (Brasília)
                </Text>
              </View>
            </View>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}