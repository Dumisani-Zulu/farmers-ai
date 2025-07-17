import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

export default function ToolCard({ title, description, icon, color, onPress }: ToolCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
    >
      <View className="flex-row items-center">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: color + '20' }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
          <Text className="text-gray-600 text-sm">{description}</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
