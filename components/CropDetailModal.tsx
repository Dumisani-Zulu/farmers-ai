import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { 
  X,
  Calendar, 
  Sprout, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  MapPin,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react-native';
import { CropRecommendation, WeatherData } from '@/hooks/useCropRecommendations';

interface CropDetailModalProps {
  crop: CropRecommendation | null;
  weatherData: WeatherData | null;
  isVisible: boolean;
  onClose: () => void;
  onPlantNow?: (crop: CropRecommendation) => void;
}

export const CropDetailModal = ({ 
  crop, 
  weatherData, 
  isVisible, 
  onClose, 
  onPlantNow 
}: CropDetailModalProps) => {
  if (!crop) return null;

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const handlePlantNow = () => {
    onPlantNow?.(crop);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{crop.name}</Text>
              <Text className="text-sm text-gray-600">{crop.variety}</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Suitability Score */}
          <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <TrendingUp size={20} color={getSuitabilityColor(crop.suitabilityScore)} />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  {getSuitabilityLabel(crop.suitabilityScore)}
                </Text>
              </View>
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${getSuitabilityColor(crop.suitabilityScore)}20` }}
              >
                <Text 
                  className="text-sm font-bold"
                  style={{ color: getSuitabilityColor(crop.suitabilityScore) }}
                >
                  {crop.suitabilityScore}%
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600">
              Based on current weather conditions and 14-day forecast analysis
            </Text>
          </View>

          {/* Timeline */}
          <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Timeline</Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Calendar size={16} color="#3b82f6" />
                <View className="ml-3">
                  <Text className="text-sm font-medium text-gray-900">Planting Window</Text>
                  <Text className="text-sm text-gray-600">{crop.plantingWindow}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Sprout size={16} color="#10b981" />
                <View className="ml-3">
                  <Text className="text-sm font-medium text-gray-900">Expected Harvest</Text>
                  <Text className="text-sm text-gray-600">{crop.expectedHarvest}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reasons */}
          {crop.reasons && crop.reasons.length > 0 && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Why This Crop is Perfect</Text>
              <View className="space-y-2">
                {crop.reasons.map((reason, index) => (
                  <View key={index} className="flex-row items-start">
                    <CheckCircle size={16} color="#10b981" style={{ marginTop: 2 }} />
                    <Text className="text-sm text-gray-700 ml-3 flex-1">{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Warnings */}
          {crop.warnings && crop.warnings.length > 0 && (
            <View className="bg-amber-50 mx-4 mt-4 rounded-xl p-4 border border-amber-200">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={20} color="#f59e0b" />
                <Text className="text-lg font-semibold text-amber-800 ml-2">Important Considerations</Text>
              </View>
              <View className="space-y-2">
                {crop.warnings.map((warning, index) => (
                  <View key={index} className="flex-row items-start">
                    <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: 2 }} />
                    <Text className="text-sm text-amber-700 ml-3 flex-1">{warning}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Planting Tips */}
          {crop.plantingTips && crop.plantingTips.length > 0 && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={20} color="#3b82f6" />
                <Text className="text-lg font-semibold text-gray-900 ml-2">Expert Planting Tips</Text>
              </View>
              <View className="space-y-2">
                {crop.plantingTips.map((tip, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5" />
                    <Text className="text-sm text-gray-700 ml-3 flex-1">{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Weather Context */}
          {weatherData && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Current Weather Context</Text>
              <View className="grid grid-cols-2 gap-3">
                <View className="flex-row items-center">
                  <Thermometer size={16} color="#ef4444" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-600">Temperature</Text>
                    <Text className="text-sm font-medium text-gray-900">{weatherData.current.temperature}°C</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Droplets size={16} color="#3b82f6" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-600">Humidity</Text>
                    <Text className="text-sm font-medium text-gray-900">{weatherData.current.humidity}%</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Wind size={16} color="#6b7280" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-600">Wind Speed</Text>
                    <Text className="text-sm font-medium text-gray-900">{weatherData.current.windSpeed} mph</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={16} color="#6b7280" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-600">Condition</Text>
                    <Text className="text-sm font-medium text-gray-900">{weatherData.current.condition}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Bottom spacing */}
          <View className="h-20" />
        </ScrollView>

        {/* Action Buttons */}
        <View className="bg-white px-4 py-4 border-t border-gray-200">
          <TouchableOpacity 
            className="bg-green-600 rounded-xl py-4 px-6 mb-2"
            onPress={handlePlantNow}
          >
            <Text className="text-white text-center font-semibold text-base">
              Add to My Crops
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-gray-100 rounded-xl py-3 px-6"
            onPress={onClose}
          >
            <Text className="text-gray-700 text-center font-medium">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CropDetailModal;
