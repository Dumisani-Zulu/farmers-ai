import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Sun, Cloud, Droplets, Thermometer, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';

interface SeasonAdvice {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'planting' | 'harvesting' | 'maintenance' | 'weather';
  daysLeft?: number;
  completed?: boolean;
}

const mockAdvice: SeasonAdvice[] = [
  {
    id: '1',
    title: 'Plant Winter Vegetables',
    description: 'Optimal time to plant cabbage, lettuce, and spinach. Soil temperature is perfect.',
    priority: 'high',
    category: 'planting',
    daysLeft: 7,
    completed: false,
  },
  {
    id: '2',
    title: 'Harvest Summer Crops',
    description: 'Tomatoes and peppers are ready for harvest. Pick them before the first frost.',
    priority: 'high',
    category: 'harvesting',
    daysLeft: 3,
    completed: false,
  },
  {
    id: '3',
    title: 'Prepare Irrigation System',
    description: 'Check and maintain irrigation system for the dry season ahead.',
    priority: 'medium',
    category: 'maintenance',
    daysLeft: 14,
    completed: false,
  },
  {
    id: '4',
    title: 'Apply Mulch',
    description: 'Add organic mulch around plants to retain moisture and suppress weeds.',
    priority: 'medium',
    category: 'maintenance',
    daysLeft: 10,
    completed: true,
  },
];

const weatherForecast = {
  temperature: { min: 18, max: 28 },
  humidity: 65,
  rainfall: 'Light showers expected',
  season: 'Late Summer',
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'planting': return <Sun size={16} color="#10b981" />;
    case 'harvesting': return <CheckCircle size={16} color="#f59e0b" />;
    case 'maintenance': return <Clock size={16} color="#3b82f6" />;
    case 'weather': return <Cloud size={16} color="#6b7280" />;
    default: return <Calendar size={16} color="#6b7280" />;
  }
};

const AdviceCard = ({ advice }: { advice: SeasonAdvice }) => (
  <TouchableOpacity 
    className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${advice.completed ? 'border-green-200 opacity-60' : 'border-gray-100'}`}
  >
    <View className="flex-row justify-between items-start mb-2">
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          {getCategoryIcon(advice.category)}
          <Text className={`text-lg font-semibold ml-2 ${advice.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {advice.title}
          </Text>
          {advice.completed && <CheckCircle size={16} color="#10b981" className="ml-2" />}
        </View>
        <Text className={`text-sm ${advice.completed ? 'text-gray-400' : 'text-gray-600'}`}>
          {advice.description}
        </Text>
      </View>
    </View>

    <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
      <View className="flex-row items-center">
        <View 
          className="px-2 py-1 rounded-full mr-3"
          style={{ backgroundColor: `${getPriorityColor(advice.priority)}20` }}
        >
          <Text 
            className="text-xs font-medium capitalize"
            style={{ color: getPriorityColor(advice.priority) }}
          >
            {advice.priority}
          </Text>
        </View>
        {advice.daysLeft && !advice.completed && (
          <View className="flex-row items-center">
            <Clock size={12} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {advice.daysLeft} days left
            </Text>
          </View>
        )}
      </View>
      {!advice.completed && (
        <TouchableOpacity className="bg-green-600 px-3 py-1 rounded-lg">
          <Text className="text-white text-xs font-medium">Mark Done</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

export default function SeasonAdviceScreen() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredAdvice = mockAdvice.filter(advice => {
    if (filter === 'pending') return !advice.completed;
    if (filter === 'completed') return advice.completed;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Season Advice</Text>
        <Text className="text-sm text-gray-600 mt-1">Current: {weatherForecast.season}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Current Season Overview */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Current Conditions</Text>
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center mb-1">
                <Thermometer size={14} color="#ef4444" />
                <Text className="text-xs text-gray-600 ml-1">Temperature</Text>
              </View>
              <Text className="text-sm font-medium">{weatherForecast.temperature.min}° - {weatherForecast.temperature.max}°C</Text>
            </View>
            <View className="flex-1 ml-2">
              <View className="flex-row items-center mb-1">
                <Droplets size={14} color="#3b82f6" />
                <Text className="text-xs text-gray-600 ml-1">Humidity</Text>
              </View>
              <Text className="text-sm font-medium">{weatherForecast.humidity}%</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Cloud size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">{weatherForecast.rainfall}</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row mb-4">
          {['all', 'pending', 'completed'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              onPress={() => setFilter(filterType as any)}
              className={`px-4 py-2 rounded-lg mr-2 ${
                filter === filterType ? 'bg-green-600' : 'bg-white border border-gray-200'
              }`}
            >
              <Text className={`text-sm font-medium capitalize ${
                filter === filterType ? 'text-white' : 'text-gray-700'
              }`}>
                {filterType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgent Tasks */}
        {filter !== 'completed' && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">Urgent Tasks</Text>
            </View>
            {mockAdvice
              .filter(advice => advice.priority === 'high' && !advice.completed && (advice.daysLeft || 0) <= 7)
              .map(advice => (
                <AdviceCard key={advice.id} advice={advice} />
              ))}
          </View>
        )}

        {/* All Advice */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {filter === 'all' ? 'All Recommendations' : 
             filter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
          </Text>
          {filteredAdvice.map(advice => (
            <AdviceCard key={advice.id} advice={advice} />
          ))}
        </View>

        {filteredAdvice.length === 0 && (
          <View className="bg-white rounded-xl p-8 items-center">
            <CheckCircle size={48} color="#10b981" />
            <Text className="text-lg font-semibold text-gray-900 mt-4">All caught up!</Text>
            <Text className="text-sm text-gray-600 text-center mt-2">
              No {filter === 'all' ? 'recommendations' : filter + ' tasks'} at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
