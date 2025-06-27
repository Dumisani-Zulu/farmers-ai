import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, Calendar, Droplets, TrendingUp } from 'lucide-react-native';

interface CropData {
  id: string;
  name: string;
  variety: string;
  plantedDate: string;
  expectedHarvest: string;
  stage: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  nextAction: string;
  image?: string;
}

const mockCrops: CropData[] = [
  {
    id: '1',
    name: 'Maize',
    variety: 'Hybrid 614',
    plantedDate: '2025-03-15',
    expectedHarvest: '2025-07-20',
    stage: 'Flowering',
    health: 'excellent',
    nextAction: 'Apply fertilizer in 3 days',
  },
  {
    id: '2',
    name: 'Tomatoes',
    variety: 'Roma',
    plantedDate: '2025-04-01',
    expectedHarvest: '2025-07-15',
    stage: 'Fruit Development',
    health: 'good',
    nextAction: 'Check for pests',
  },
  {
    id: '3',
    name: 'Beans',
    variety: 'Common Bean',
    plantedDate: '2025-04-10',
    expectedHarvest: '2025-07-05',
    stage: 'Vegetative',
    health: 'fair',
    nextAction: 'Increase watering',
  },
];

const getHealthColor = (health: string) => {
  switch (health) {
    case 'excellent': return '#10b981';
    case 'good': return '#3b82f6';
    case 'fair': return '#f59e0b';
    case 'poor': return '#ef4444';
    default: return '#6b7280';
  }
};

const CropCard = ({ crop }: { crop: CropData }) => (
  <TouchableOpacity className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
    <View className="flex-row justify-between items-start mb-3">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{crop.name}</Text>
        <Text className="text-sm text-gray-600">{crop.variety}</Text>
      </View>
      <View 
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: `${getHealthColor(crop.health)}20` }}
      >
        <Text 
          className="text-xs font-medium capitalize"
          style={{ color: getHealthColor(crop.health) }}
        >
          {crop.health}
        </Text>
      </View>
    </View>

    <View className="flex-row justify-between mb-3">
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Calendar size={14} color="#6b7280" />
          <Text className="text-xs text-gray-600 ml-1">Planted</Text>
        </View>
        <Text className="text-sm font-medium">{crop.plantedDate}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Sprout size={14} color="#6b7280" />
          <Text className="text-xs text-gray-600 ml-1">Stage</Text>
        </View>
        <Text className="text-sm font-medium">{crop.stage}</Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
      <View className="flex-1">
        <Text className="text-xs text-gray-600 mb-1">Next Action</Text>
        <Text className="text-sm font-medium text-green-600">{crop.nextAction}</Text>
      </View>
      <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
        <Text className="text-white text-xs font-medium">View Details</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function CropsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">My Crops</Text>
        <Text className="text-sm text-gray-600 mt-1">{mockCrops.length} crops being tracked</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Quick Stats */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#10b981" />
              <Text className="text-xs text-gray-600 ml-1">Growth Rate</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">+12%</Text>
            <Text className="text-xs text-gray-500">vs last season</Text>
          </View>
          <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Droplets size={16} color="#3b82f6" />
              <Text className="text-xs text-gray-600 ml-1">Water Usage</Text>
            </View>
            <Text className="text-lg font-bold text-gray-900">240L</Text>
            <Text className="text-xs text-gray-500">today</Text>
          </View>
        </View>

        {/* Add New Crop Button */}
        <TouchableOpacity className="bg-green-600 rounded-xl p-4 mb-6 flex-row items-center justify-center">
          <Sprout size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add New Crop</Text>
        </TouchableOpacity>

        {/* Crops List */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-4">Current Crops</Text>
          {mockCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
