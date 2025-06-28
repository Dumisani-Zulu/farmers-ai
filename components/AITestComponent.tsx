import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAgricultureAI } from '../hooks/useAgricultureAI';

export const AITestComponent: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    cropAnalysis,
    weatherPrediction,
    seasonalAdvice,
    recommendations,
    analyzeCrop,
    predictWeather,
    getSeasonalAdvice,
    getRecommendations,
    clearError,
    reset,
  } = useAgricultureAI();

  const testCropAnalysis = () => {
    analyzeCrop({
      cropType: 'Tomato',
      location: { latitude: 40.7128, longitude: -74.0060 },
      soilData: {
        ph: 6.5,
        moisture: 45,
        temperature: 22,
      },
    });
  };

  const testWeatherPrediction = () => {
    predictWeather({
      location: { latitude: 40.7128, longitude: -74.0060 },
      cropType: 'Corn',
    });
  };

  const testSeasonalAdvice = () => {
    getSeasonalAdvice('Wheat', { latitude: 40.7128, longitude: -74.0060 });
  };

  const testRecommendations = () => {
    getRecommendations({
      experience: 'Intermediate',
      farmSize: '10 acres',
      cropTypes: ['Corn', 'Soybeans', 'Wheat'],
      location: { latitude: 40.7128, longitude: -74.0060 },
      resources: ['Tractor', 'Irrigation System', 'Greenhouse'],
    });
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">Error: {error}</Text>
        <TouchableOpacity
          onPress={clearError}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Clear Error</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Initializing AI Services...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Agriculture AI Test</Text>
      
      {isLoading && (
        <View className="bg-blue-100 p-4 rounded-lg mb-4">
          <Text className="text-blue-800 text-center">Processing...</Text>
        </View>
      )}

      <View className="space-y-4">
        <TouchableOpacity
          onPress={testCropAnalysis}
          disabled={isLoading}
          className="bg-green-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Test Crop Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testWeatherPrediction}
          disabled={isLoading}
          className="bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Test Weather Prediction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testSeasonalAdvice}
          disabled={isLoading}
          className="bg-orange-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Test Seasonal Advice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testRecommendations}
          disabled={isLoading}
          className="bg-purple-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Test Recommendations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={reset}
          className="bg-gray-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {cropAnalysis && (
        <View className="mt-6 bg-green-50 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Crop Analysis Results:</Text>
          <Text className="mb-2">Health Score: {cropAnalysis.healthScore.toFixed(1)}/100</Text>
          {cropAnalysis.diseases.length > 0 && (
            <View className="mb-2">
              <Text className="font-semibold">Diseases Detected:</Text>
              {cropAnalysis.diseases.map((disease, index) => (
                <Text key={index} className="ml-2">
                  • {disease.name} ({(disease.confidence * 100).toFixed(1)}%)
                </Text>
              ))}
            </View>
          )}
          <Text className="font-semibold">Recommendations:</Text>
          {cropAnalysis.recommendations.map((rec, index) => (
            <Text key={index} className="ml-2">• {rec}</Text>
          ))}
          <Text className="font-semibold mt-2">AI Insights:</Text>
          <Text className="mt-1">{cropAnalysis.aiInsights}</Text>
        </View>
      )}

      {weatherPrediction && (
        <View className="mt-6 bg-blue-50 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Weather Prediction:</Text>
          {weatherPrediction.forecast.slice(0, 3).map((day, index) => (
            <Text key={index} className="mb-1">
              {day.date}: {day.temperature.toFixed(1)}°C, {day.precipitation.toFixed(1)}mm rain
            </Text>
          ))}
          <Text className="font-semibold mt-2">Farming Advice:</Text>
          <Text className="mt-1">{weatherPrediction.farmingAdvice}</Text>
        </View>
      )}

      {seasonalAdvice && (
        <View className="mt-6 bg-orange-50 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Seasonal Advice:</Text>
          <Text>{seasonalAdvice}</Text>
        </View>
      )}

      {recommendations && (
        <View className="mt-6 bg-purple-50 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-2">Personalized Recommendations:</Text>
          <Text>{recommendations}</Text>
        </View>
      )}
    </ScrollView>
  );
};
