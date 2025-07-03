import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { geminiAI } from '@/lib/gemini-ai';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';

export const GeminiDebugComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { weatherData, currentLocation } = useLocationWeather();

  const testGeminiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Gemini AI connection...\n');

    try {
      // Test basic initialization
      setTestResult(prev => prev + '🚀 Initializing Gemini AI...\n');
      await geminiAI.initialize();
      setTestResult(prev => prev + '✅ Gemini AI initialized successfully\n\n');

      // Test basic text generation
      setTestResult(prev => prev + '🔤 Testing basic text generation...\n');
      const basicTest = await geminiAI.generateText('Say "Hello farmers!" in a friendly way.');
      setTestResult(prev => prev + `📝 Basic test result: ${basicTest}\n\n`);

      // Test crop recommendations if we have weather data
      if (weatherData && currentLocation) {
        setTestResult(prev => prev + '🌱 Testing crop recommendations...\n');
        setTestResult(prev => prev + `📍 Location: ${currentLocation.city || 'Unknown'}\n`);
        setTestResult(prev => prev + `🌡️ Temperature: ${weatherData.current.temperature}°C\n`);
        setTestResult(prev => prev + `💧 Humidity: ${weatherData.current.humidity}%\n\n`);

        const cropRecommendations = await geminiAI.generateCropRecommendations(weatherData);
        
        // Try to extract just the first recommendation for display
        const jsonStart = cropRecommendations.indexOf('{');
        const jsonEnd = cropRecommendations.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd > 0) {
          const jsonStr = cropRecommendations.substring(jsonStart, jsonEnd);
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.recommendations && parsed.recommendations.length > 0) {
            const firstCrop = parsed.recommendations[0];
            setTestResult(prev => prev + '🎉 Crop recommendations working!\n');
            setTestResult(prev => prev + `🌾 First recommendation: ${firstCrop.name} (${firstCrop.variety})\n`);
            setTestResult(prev => prev + `📊 Suitability: ${firstCrop.suitabilityScore}%\n`);
            setTestResult(prev => prev + `📅 Planting: ${firstCrop.plantingWindow}\n`);
            setTestResult(prev => prev + `🌱 Harvest: ${firstCrop.expectedHarvest}\n`);
          } else {
            setTestResult(prev => prev + '❌ No recommendations in response\n');
          }
        } else {
          setTestResult(prev => prev + '❌ Could not parse crop recommendations\n');
        }
      } else {
        setTestResult(prev => prev + '⚠️ No weather data available for crop recommendations\n');
        setTestResult(prev => prev + 'Please search for a location first.\n');
      }

      setTestResult(prev => prev + '\n✅ All tests completed successfully!');

    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Test failed: ${error.message}\n`);
      
      if (error.message.includes('API key')) {
        setTestResult(prev => prev + '\n💡 This means the API key is not properly configured.\n');
        setTestResult(prev => prev + '💡 Check that googleAiApiKey is set in app.json extra config.\n');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResult('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">Gemini AI Debug Tool</Text>
        
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            onPress={testGeminiConnection}
            disabled={isLoading}
            className="flex-1 bg-blue-600 rounded-lg py-3 px-4"
          >
            <Text className="text-white font-medium text-center">
              {isLoading ? 'Testing...' : 'Test Gemini AI'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={clearResults}
            className="bg-gray-600 rounded-lg py-3 px-4"
          >
            <Text className="text-white font-medium text-center">Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 bg-gray-50 rounded-lg p-3" style={{ height: 400 }}>
          <Text className="text-sm font-mono text-gray-800">
            {testResult || 'Press "Test Gemini AI" to start testing...'}
          </Text>
        </ScrollView>

        <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <Text className="text-xs text-yellow-800">
            Debug Info: Weather data available: {weatherData ? 'Yes' : 'No'} | 
            Location available: {currentLocation ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
