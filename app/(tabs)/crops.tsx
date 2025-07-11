import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, Droplets, TrendingUp, MapPin, CloudRain } from 'lucide-react-native';
import { useCropRecommendations, CropRecommendation } from '@/hooks/useCropRecommendations';
import { useSavedCrops, SavedCrop } from '@/hooks/useSavedCrops';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { CropRecommendationsList } from '@/components/CropRecommendationsList';
import { SavedCropsList } from '@/components/SavedCropsList';
import { CropDetailModal } from '@/components/CropDetailModal';
import { SavedCropDetailModal } from '@/components/SavedCropDetailModal';
import { LocationSearchModal } from '@/components/LocationSearchModal';

export default function CropsScreen() {
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [selectedSavedCrop, setSelectedSavedCrop] = useState<SavedCrop | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  
  // Use the crop recommendations hook
  const {
    recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    getRecommendations: refreshRecommendations,
  } = useCropRecommendations();

  // Use the saved crops hook
  const {
    savedCrops,
    isLoading: savedCropsLoading,
    error: savedCropsError,
    saveCrop,
    removeCrop,
    updateCropStatus,
  } = useSavedCrops();

  // Use the global location/weather context
  const {
    currentLocation,
    weatherData,
    isLoading: locationLoading,
    error: locationError,
    updateLocation,
    getCurrentLocation,
  } = useLocationWeather();

  const isLoading = recommendationsLoading || locationLoading || savedCropsLoading;
  const error = recommendationsError || locationError || savedCropsError;

  // Initialize location and trigger recommendations when weather data is available
  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      getCurrentLocation();
    }
  }, [currentLocation, locationLoading, getCurrentLocation]);

  // Trigger AI recommendations when weather data becomes available
  useEffect(() => {
    if (weatherData && showRecommendations && !recommendationsLoading && recommendations.length === 0) {
      console.log('🌱 Weather data available, triggering AI crop recommendations...');
      const getAIRecommendations = async () => {
        try {
          await refreshRecommendations(weatherData, {
            maxRecommendations: 8,
            minSuitabilityScore: 40,
            experienceLevel: 'intermediate',
            farmSize: 'medium',
            marketFocus: 'local',
            language: 'English',
          });
        } catch (error) {
          console.error('Failed to get AI recommendations:', error);
        }
      };
      
      getAIRecommendations();
    }
  }, [weatherData, showRecommendations, recommendationsLoading, recommendations.length, refreshRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (showRecommendations && weatherData) {
        await refreshRecommendations(weatherData, {
          maxRecommendations: 8,
          minSuitabilityScore: 40,
          experienceLevel: 'intermediate',
          farmSize: 'medium',
          marketFocus: 'local',
          language: 'English',
        });
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

  const handleSavedCropPress = (crop: SavedCrop) => {
    setSelectedSavedCrop(crop);
  };

  const handleAddCrop = async (crop: CropRecommendation) => {
    try {
      await saveCrop(crop);
      Alert.alert('Success', `${crop.name} has been added to your crops!`);
      setSelectedCrop(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save crop';
      Alert.alert('Error', message);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    try {
      await removeCrop(cropId);
      Alert.alert('Success', 'Crop removed from your collection');
    } catch {
      Alert.alert('Error', 'Failed to remove crop');
    }
  };

  const handleUpdateCropStatus = async (cropId: string, status: SavedCrop['status'], additionalData?: Partial<SavedCrop>) => {
    try {
      await updateCropStatus(cropId, status, additionalData);
    } catch {
      Alert.alert('Error', 'Failed to update crop status');
    }
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
                : `${savedCrops.length} crops being tracked`
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
                city: currentLocation.city,
                region: currentLocation.region,
                country: currentLocation.country,
                address: currentLocation.address
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
                  <Text className="text-xs text-gray-600 ml-1">Active Crops</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900">{savedCrops.length}</Text>
                <Text className="text-xs text-gray-500">total saved</Text>
              </View>
              <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <Droplets size={16} color="#3b82f6" />
                  <Text className="text-xs text-gray-600 ml-1">Growing</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  {savedCrops.filter(crop => crop.status === 'growing').length}
                </Text>
                <Text className="text-xs text-gray-500">crops</Text>
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

            {/* Saved Crops List */}
            <SavedCropsList
              savedCrops={savedCrops}
              isLoading={savedCropsLoading}
              error={savedCropsError}
              onCropPress={handleSavedCropPress}
              onUpdateStatus={handleUpdateCropStatus}
              onDeleteCrop={handleDeleteCrop}
            />
          </View>
        )}
      </ScrollView>

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

      {/* Saved Crop Detail Modal */}
      <SavedCropDetailModal
        crop={selectedSavedCrop}
        isVisible={selectedSavedCrop !== null}
        onClose={() => setSelectedSavedCrop(null)}
        onUpdateStatus={handleUpdateCropStatus}
        onDeleteCrop={handleDeleteCrop}
      />
    </SafeAreaView>
  );
}
