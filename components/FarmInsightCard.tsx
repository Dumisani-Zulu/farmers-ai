import { View, Text } from 'react-native';
import { ReactNode } from 'react';

interface FarmInsightCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  recommendation: string;
  status: 'good' | 'warning' | 'alert';
}

export default function FarmInsightCard({
  icon,
  title,
  description,
  recommendation,
  status,
}: FarmInsightCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'alert':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <View className={`rounded-xl p-4 border ${getStatusColor()} mb-3`}>
      <View className="flex-row items-center mb-3">
        <View className="mr-3">
          {icon}
        </View>
        <Text className={`text-lg font-inter-bold ${getStatusTextColor()}`}>
          {title}
        </Text>
      </View>
      
      <Text className="text-gray-700 font-inter mb-2 leading-5">
        {description}
      </Text>
      
      <View className="bg-white/70 rounded-lg p-3 mt-2">
        <Text className="text-sm font-inter-medium text-gray-600 mb-1">
          Recommendation:
        </Text>
        <Text className="text-sm font-inter text-gray-800 leading-4">
          {recommendation}
        </Text>
      </View>
    </View>
  );
}