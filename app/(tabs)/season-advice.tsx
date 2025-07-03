import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Sun, Cloud, Droplets, Thermometer, AlertTriangle, CheckCircle, Clock, MapPin, RefreshCw } from 'lucide-react-native';
import { useSeasonAdvice, SeasonAdvice } from '@/hooks/useSeasonAdvice';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';

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
    case 'irrigation': return <Droplets size={16} color="#3b82f6" />;
    case 'pest_control': return <AlertTriangle size={16} color="#ef4444" />;
    default: return <Calendar size={16} color="#6b7280" />;
  }
};

const AdviceCard = ({ advice, onMarkCompleted }: { advice: SeasonAdvice; onMarkCompleted: (id: string) => void }) => (
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
        <TouchableOpacity 
          className="bg-green-600 px-3 py-1 rounded-lg"
          onPress={() => onMarkCompleted(advice.id)}
        >
          <Text className="text-white text-xs font-medium">Mark Done</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

export default function SeasonAdviceScreen() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const { weatherData, currentLocation, isLoading: locationLoading } = useLocationWeather();
  const { 
    advice, 
    isLoading: adviceLoading, 
    error, 
    currentSeason, 
    refreshAdvice, 
    markCompleted 
  } = useSeasonAdvice();

  const isLoading = locationLoading || adviceLoading;

  const filteredAdvice = advice.filter((adviceItem: SeasonAdvice) => {
    if (filter === 'pending') return !adviceItem.completed;
    if (filter === 'completed') return adviceItem.completed;
    return true;
  });

  const urgentAdvice = advice.filter((adviceItem: SeasonAdvice) => 
    adviceItem.priority === 'high' && !adviceItem.completed && (adviceItem.daysLeft || 0) <= 7
  );

  const onRefresh = useCallback(async () => {
    try {
      await refreshAdvice();
    } catch (error) {
      console.error('Failed to refresh advice:', error);
    }
  }, [refreshAdvice]);

  const handleMarkCompleted = useCallback((adviceId: string) => {
    markCompleted(adviceId);
  }, [markCompleted]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Season Advice</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Current: {currentSeason}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            className="bg-green-600 px-4 py-2 rounded-lg"
            disabled={isLoading}
          >
            <RefreshCw size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh}
            colors={['#16a34a']}
          />
        }
      >
        {/* Loading State */}
        {isLoading && (
          <View className="bg-white rounded-xl p-6 mb-4 items-center">
            <RefreshCw size={24} color="#16a34a" className="mb-2" />
            <Text className="text-gray-600">Loading seasonal advice...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color="#dc2626" />
              <Text className="text-red-800 font-semibold ml-2">Error Loading Advice</Text>
            </View>
            <Text className="text-red-700 text-sm">{error}</Text>
            <TouchableOpacity 
              onPress={onRefresh}
              className="bg-red-600 px-3 py-2 rounded-lg mt-3 self-start"
            >
              <Text className="text-white text-sm font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Season Overview */}
        {weatherData && !isLoading && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Current Conditions</Text>
              {currentLocation && (
                <View className="flex-row items-center">
                  <MapPin size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {currentLocation.city || currentLocation.address || 'Unknown location'}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                  <Thermometer size={14} color="#ef4444" />
                  <Text className="text-xs text-gray-600 ml-1">Temperature</Text>
                </View>
                <Text className="text-sm font-medium">
                  {weatherData.current.temperature}°C
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row items-center mb-1">
                  <Droplets size={14} color="#3b82f6" />
                  <Text className="text-xs text-gray-600 ml-1">Humidity</Text>
                </View>
                <Text className="text-sm font-medium">{weatherData.current.humidity}%</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Cloud size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {weatherData.current.description}
              </Text>
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        <View className="flex-row mb-4">
          {(['all', 'pending', 'completed'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              onPress={() => setFilter(filterType)}
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
        {filter !== 'completed' && urgentAdvice.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">Urgent Tasks</Text>
            </View>
            {urgentAdvice.map((adviceItem: SeasonAdvice) => (
              <AdviceCard 
                key={adviceItem.id} 
                advice={adviceItem} 
                onMarkCompleted={handleMarkCompleted}
              />
            ))}
          </View>
        )}

        {/* All Advice */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {filter === 'all' ? 'All Recommendations' : 
             filter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
          </Text>
          {filteredAdvice.map((adviceItem: SeasonAdvice) => (
            <AdviceCard 
              key={adviceItem.id} 
              advice={adviceItem} 
              onMarkCompleted={handleMarkCompleted}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredAdvice.length === 0 && !isLoading && (
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
