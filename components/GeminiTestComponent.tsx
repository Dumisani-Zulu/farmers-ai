import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { geminiAI } from '../lib/gemini-ai';

export const GeminiTestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [apiStatus, setApiStatus] = useState<{ initialized: boolean; hasApiKey: boolean } | null>(null);

  const checkStatus = () => {
    const status = geminiAI.getStatus();
    setApiStatus(status);
    Alert.alert(
      'Gemini AI Status',
      `Initialized: ${status.initialized}\nHas API Key: ${status.hasApiKey}\nReady: ${geminiAI.isReady()}`
    );
  };

  const initializeAI = async () => {
    setIsLoading(true);
    try {
      await geminiAI.initialize();
      Alert.alert('Success', 'Gemini AI initialized successfully!');
      setApiStatus(geminiAI.getStatus());
    } catch (error) {
      Alert.alert('Error', `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCropAnalysis = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await geminiAI.generateCropAnalysis({
        cropType: 'Tomatoes',
        location: { latitude: 40.7128, longitude: -74.0060 },
        soilData: { ph: 6.5, moisture: 45, temperature: 22 },
        symptoms: ['yellowing leaves', 'wilting'],
      });
      setResponse(result);
    } catch (error) {
      Alert.alert('Error', `Crop analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSeasonalAdvice = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await geminiAI.generateSeasonalAdvice('Corn', { latitude: 41.8781, longitude: -87.6298 });
      setResponse(result);
    } catch (error) {
      Alert.alert('Error', `Seasonal advice failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWeatherAdvice = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const mockForecast = [
        { date: '2025-06-28', temperature: 25, humidity: 60, precipitation: 2 },
        { date: '2025-06-29', temperature: 28, humidity: 55, precipitation: 0 },
        { date: '2025-06-30', temperature: 22, humidity: 70, precipitation: 8 },
      ];
      const result = await geminiAI.generateWeatherBasedAdvice(mockForecast, 'Wheat');
      setResponse(result);
    } catch (error) {
      Alert.alert('Error', `Weather advice failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await geminiAI.generateText(customPrompt);
      setResponse(result);
    } catch (error) {
      Alert.alert('Error', `Custom prompt failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPestManagement = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await geminiAI.generatePestDiseaseManagement(
        ['small holes in leaves', 'black spots', 'stunted growth'],
        'Soybeans',
        { latitude: 40.7128, longitude: -74.0060 }
      );
      setResponse(result);
    } catch (error) {
      Alert.alert('Error', `Pest management failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Gemini AI Test</Text>
      
      {/* Status Section */}
      <View className="mb-6 p-4 bg-gray-100 rounded-lg">
        <Text className="text-lg font-semibold mb-2">API Status</Text>
        {apiStatus && (
          <View>
            <Text>Initialized: {apiStatus.initialized ? '✅' : '❌'}</Text>
            <Text>Has API Key: {apiStatus.hasApiKey ? '✅' : '❌'}</Text>
            <Text>Ready: {geminiAI.isReady() ? '✅' : '❌'}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={checkStatus}
          className="mt-2 bg-blue-500 p-2 rounded-lg"
        >
          <Text className="text-white text-center">Check Status</Text>
        </TouchableOpacity>
      </View>

      {/* Initialize Button */}
      <TouchableOpacity
        onPress={initializeAI}
        disabled={isLoading}
        className="mb-4 bg-green-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Initialize Gemini AI</Text>
      </TouchableOpacity>

      {isLoading && (
        <View className="bg-blue-100 p-4 rounded-lg mb-4">
          <Text className="text-blue-800 text-center">Processing... 🤖</Text>
        </View>
      )}

      {/* Test Buttons */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={testCropAnalysis}
          disabled={isLoading}
          className="bg-green-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Test Crop Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testSeasonalAdvice}
          disabled={isLoading}
          className="bg-orange-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Test Seasonal Advice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testWeatherAdvice}
          disabled={isLoading}
          className="bg-blue-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Test Weather Advice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testPestManagement}
          disabled={isLoading}
          className="bg-red-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Test Pest Management</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Prompt Section */}
      <View className="mt-6 p-4 bg-gray-50 rounded-lg">
        <Text className="text-lg font-semibold mb-2">Custom Prompt</Text>
        <TextInput
          value={customPrompt}
          onChangeText={setCustomPrompt}
          placeholder="Enter your farming question..."
          multiline
          numberOfLines={3}
          className="border border-gray-300 p-3 rounded-lg mb-3 bg-white"
        />
        <TouchableOpacity
          onPress={testCustomPrompt}
          disabled={isLoading || !customPrompt.trim()}
          className="bg-purple-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Ask Gemini AI</Text>
        </TouchableOpacity>
      </View>

      {/* Response Section */}
      {response && (
        <View className="mt-6 p-4 bg-green-50 rounded-lg">
          <Text className="text-lg font-bold mb-2">AI Response:</Text>
          <ScrollView className="max-h-96">
            <Text className="text-sm leading-6">{response}</Text>
          </ScrollView>
        </View>
      )}

      <View className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <Text className="text-sm text-gray-600">
          💡 Make sure your GOOGLE_AI_API_KEY is set in the .env file. 
          You can get one from https://makersuite.google.com/app/apikey
        </Text>
      </View>
    </ScrollView>
  );
};
