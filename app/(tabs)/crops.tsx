import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, Calendar, Droplets, TrendingUp, MapPin, CloudRain } from 'lucide-react-native';
import { useWeatherBasedCropRecommendations, CropRecommendation } from '@/hooks/useWeatherBasedCropRecommendations';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { CropRecommendationsList } from '@/components/CropRecommendationsList';
import { CropDetailModal } from '@/components/CropDetailModal';
import { LocationSearchModal } from '@/components/LocationSearchModal';
import { GeminiDebugComponent } from '@/components/GeminiDebugComponent';

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
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Use the new weather-based recommendations hook
  const {
    recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refreshRecommendations,
  } = useWeatherBasedCropRecommendations();

  // Use the global location/weather context
  const {
    currentLocation,
    weatherData,
    isLoading: locationLoading,
    error: locationError,
    updateLocation,
    getCurrentLocation,
  } = useLocationWeather();

  const isLoading = recommendationsLoading || locationLoading;
  const error = recommendationsError || locationError;

  // Initialize location on mount if not already set
  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      getCurrentLocation();
    }
  }, [currentLocation, locationLoading, getCurrentLocation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (showRecommendations) {
        await refreshRecommendations();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCropPress = (crop: CropRecommendation) => {
    setSelectedCrop(crop);
  };

  const handleAddCrop = (crop: CropRecommendation) => {
    Alert.alert(
      'Add Crop',
      `Would you like to add ${crop.name} (${crop.variety}) to your crops?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            // Here you would typically add the crop to your database
            Alert.alert('Success', `${crop.name} has been added to your crops!`);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Crops</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {showRecommendations 
                ? 'Weather-based crop recommendations' 
                : `${mockCrops.length} crops being tracked`
              }
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowLocationSearch(true)}
            className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg mr-2"
          >
            <MapPin size={16} color="#10b981" />
            <Text className="text-green-700 text-sm font-medium ml-1">
              {currentLocation?.city || 'Location'}
            </Text>
          </TouchableOpacity>
          
          {/* Debug Button - Temporary */}
          <TouchableOpacity
            onPress={() => setShowDebug(true)}
            className="bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Text className="text-blue-700 text-xs font-medium">Debug AI</Text>
          </TouchableOpacity>
        </View>
        
        {/* Weather Summary */}
        {weatherData && (
          <View className="mt-3 p-3 bg-blue-50 rounded-lg">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <CloudRain size={16} color="#3b82f6" />
                <Text className="text-blue-700 text-sm font-medium ml-1">
                  {weatherData.current.temperature}°C, {weatherData.current.description}
                </Text>
              </View>
              <Text className="text-blue-600 text-xs">
                {weatherData.current.humidity}% humidity
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Toggle between recommendations and current crops */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 px-3 rounded-md ${showRecommendations ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setShowRecommendations(true)}
          >
            <Text className={`text-center text-sm font-medium ${showRecommendations ? 'text-green-700' : 'text-gray-600'}`}>
              Recommendations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-3 rounded-md ${!showRecommendations ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setShowRecommendations(false)}
          >
            <Text className={`text-center text-sm font-medium ${!showRecommendations ? 'text-green-700' : 'text-gray-600'}`}>
              My Crops
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {showRecommendations ? (
          <View className="py-4">
            <CropRecommendationsList
              recommendations={recommendations}
              weatherData={weatherData}
              location={currentLocation ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                name: currentLocation.city || currentLocation.address || `${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`
              } : null}
              isLoading={isLoading}
              error={error}
              onRefresh={refreshRecommendations}
              onCropPress={handleCropPress}
            />
          </View>
        ) : (
          <View className="px-4 py-4">
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
            <TouchableOpacity 
              className="bg-green-600 rounded-xl p-4 mb-6 flex-row items-center justify-center"
              onPress={() => setShowRecommendations(true)}
            >
              <Sprout size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Get Crop Recommendations</Text>
            </TouchableOpacity>

            {/* Current Crops List */}
            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Current Crops</Text>
              {mockCrops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Debug Modal - Temporary */}
      {showDebug && (
        <View className="absolute inset-0 bg-white z-50">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">AI Debug</Text>
            <TouchableOpacity onPress={() => setShowDebug(false)}>
              <Text className="text-blue-600 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
          <GeminiDebugComponent />
        </View>
      )}

      {/* Location Search Modal */}
      <LocationSearchModal
        isVisible={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onLocationSelect={(location) => {
          updateLocation(location);
          setShowLocationSearch(false);
        }}
        title="Select Location for Crop Recommendations"
      />

      {/* Crop Detail Modal */}
      <CropDetailModal
        crop={selectedCrop}
        weatherData={weatherData}
        isVisible={selectedCrop !== null}
        onClose={() => setSelectedCrop(null)}
        onPlantNow={handleAddCrop}
      />
    </SafeAreaView>
  );
}
