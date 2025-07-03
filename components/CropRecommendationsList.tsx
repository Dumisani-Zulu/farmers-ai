import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  Sprout, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Thermometer,
  Droplets,
  MapPin
} from 'lucide-react-native';
import { CropRecommendation } from '@/hooks/useWeatherBasedCropRecommendations';
import { WeatherData } from '@/contexts/LocationWeatherContext';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
}

interface CropRecommendationCardProps {
  recommendation: CropRecommendation;
  onPress?: () => void;
}

const CropRecommendationCard = ({ recommendation, onPress }: CropRecommendationCardProps) => {
  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{recommendation.name}</Text>
          <Text className="text-sm text-gray-600">{recommendation.variety}</Text>
        </View>
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getSuitabilityColor(recommendation.suitabilityScore)}20` }}
        >
          <Text 
            className="text-xs font-medium"
            style={{ color: getSuitabilityColor(recommendation.suitabilityScore) }}
          >
            {getSuitabilityLabel(recommendation.suitabilityScore)} ({recommendation.suitabilityScore}%)
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">Planting Window</Text>
          </View>
          <Text className="text-sm font-medium">{recommendation.plantingWindow}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Sprout size={14} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">Expected Harvest</Text>
          </View>
          <Text className="text-sm font-medium">{recommendation.expectedHarvest}</Text>
        </View>
      </View>

      {recommendation.reasons && recommendation.reasons.length > 0 && (
        <View className="mb-3">
          <Text className="text-xs text-gray-600 mb-2 font-medium">Why this crop is suitable:</Text>
          {recommendation.reasons.slice(0, 2).map((reason, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <CheckCircle size={12} color="#10b981" style={{ marginTop: 2 }} />
              <Text className="text-xs text-gray-700 ml-2 flex-1">{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {recommendation.warnings && recommendation.warnings.length > 0 && (
        <View className="mb-3">
          <Text className="text-xs text-amber-600 mb-2 font-medium">Considerations:</Text>
          {recommendation.warnings.slice(0, 1).map((warning, index) => (
            <View key={index} className="flex-row items-start mb-1">
              <AlertTriangle size={12} color="#f59e0b" style={{ marginTop: 2 }} />
              <Text className="text-xs text-amber-700 ml-2 flex-1">{warning}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-500">Tap for more details</Text>
        <TouchableOpacity className="bg-green-600 px-3 py-1.5 rounded-lg">
          <Text className="text-white text-xs font-medium">Plant Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

interface WeatherSummaryCardProps {
  weatherData: WeatherData;
  location: LocationData;
}

const WeatherSummaryCard = ({ weatherData, location }: WeatherSummaryCardProps) => {
  const next7Days = weatherData.forecast.slice(0, 7);
  const avgTemp = next7Days.reduce((acc, day) => acc + (day.temperature.min + day.temperature.max) / 2, 0) / 7;
  const totalRainfall = next7Days.reduce((acc, day) => acc + day.precipitation, 0);

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <MapPin size={16} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 ml-2">Weather Overview</Text>
      </View>
      
      <Text className="text-sm text-gray-600 mb-3">
        {location.city || location.address || 'Unknown location'}
        {location.region && `, ${location.region}`}
        {location.country && `, ${location.country}`}
      </Text>
      
      <View className="flex-row justify-between mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Thermometer size={14} color="#ef4444" />
            <Text className="text-xs text-gray-600 ml-1">Avg Temperature (7 days)</Text>
          </View>
          <Text className="text-sm font-medium">{Math.round(avgTemp)}°C</Text>
        </View>
        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <Droplets size={14} color="#3b82f6" />
            <Text className="text-xs text-gray-600 ml-1">Expected Rainfall</Text>
          </View>
          <Text className="text-sm font-medium">{totalRainfall.toFixed(1)}mm</Text>
        </View>
      </View>
      
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-xs text-gray-600 mb-1">Current Conditions</Text>
        <Text className="text-sm font-medium text-gray-900">
          {weatherData.current.temperature}°C, {weatherData.current.humidity}% humidity, {weatherData.current.description}
        </Text>
      </View>
    </View>
  );
};

interface CropRecommendationsListProps {
  recommendations: CropRecommendation[];
  weatherData: WeatherData | null;
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCropPress?: (crop: CropRecommendation) => void;
}

export const CropRecommendationsList = ({
  recommendations,
  weatherData,
  location,
  isLoading,
  error,
  onRefresh,
  onCropPress,
}: CropRecommendationsListProps) => {
  if (isLoading) {
    return (
      <View className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-center">
          <TrendingUp size={20} color="#6b7280" />
          <Text className="text-lg font-medium text-gray-600 ml-2">
            Analyzing weather conditions...
          </Text>
        </View>
        <Text className="text-sm text-gray-500 text-center mt-2">
          Getting personalized crop recommendations based on your local weather forecast
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-center mb-3">
          <AlertTriangle size={20} color="#ef4444" />
          <Text className="text-lg font-medium text-red-600 ml-2">
            Unable to load recommendations
          </Text>
        </View>
        <Text className="text-sm text-gray-600 text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity 
          className="bg-green-600 rounded-lg py-3 px-4"
          onPress={onRefresh}
        >
          <Text className="text-white font-medium text-center">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weatherData || !location || recommendations.length === 0) {
    return (
      <View className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-center mb-3">
          <Sprout size={20} color="#6b7280" />
          <Text className="text-lg font-medium text-gray-600 ml-2">
            No recommendations available
          </Text>
        </View>
        <Text className="text-sm text-gray-500 text-center mb-4">
          We need weather data to provide crop recommendations
        </Text>
        <TouchableOpacity 
          className="bg-green-600 rounded-lg py-3 px-4"
          onPress={onRefresh}
        >
          <Text className="text-white font-medium text-center">Get Recommendations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="px-4">
      {/* Weather Summary */}
      <WeatherSummaryCard weatherData={weatherData} location={location} />
      
      {/* Recommendations Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">Recommended Crops</Text>
          <Text className="text-sm text-gray-600">
            Based on 14-day weather forecast • {recommendations.length} recommendations
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-green-100 rounded-lg px-3 py-2"
          onPress={onRefresh}
        >
          <Text className="text-green-700 text-xs font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {/* Recommendations List */}
      {recommendations.map((recommendation) => (
        <CropRecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onPress={() => onCropPress?.(recommendation)}
        />
      ))}
    </View>
  );
};

export default CropRecommendationsList;
