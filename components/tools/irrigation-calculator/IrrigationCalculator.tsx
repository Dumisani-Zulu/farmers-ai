import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IrrigationAIService, IrrigationInput } from '../../../ai/tools';
import { useLocation } from '../../../hooks/useLocation';

interface IrrigationResult {
  dailyWaterNeed: number;
  weeklyWaterNeed: number;
  irrigationFrequency: string;
  recommendedDuration: string;
  confidence?: number;
  analysis?: {
    cropWaterRequirement: string;
    soilAnalysis: string;
    weatherImpact: string;
    seasonalConsiderations: string;
    costEstimation?: string;
    sustainabilityTips: string[];
    riskFactors: string[];
    optimizationSuggestions: string[];
  };
  schedule?: {
    morningSession?: string;
    eveningSession?: string;
    weeklyPattern: string[];
  };
  monitoring?: {
    soilMoistureThreshold: string;
    plantStressIndicators: string[];
    adjustmentTriggers: string[];
  };
}

export default function IrrigationCalculator() {
  const [cropType, setCropType] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [results, setResults] = useState<IrrigationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentLocation } = useLocation();
  const irrigationAI = new IrrigationAIService();

  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty'];

  const calculateIrrigation = async () => {
    if (!cropType || !fieldArea || !soilType || !temperature) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (useAI) {
        // Use AI-powered calculation
        const input: IrrigationInput = {
          cropType,
          fieldArea: parseFloat(fieldArea),
          soilType,
          temperature: parseFloat(temperature),
          humidity: humidity ? parseFloat(humidity) : undefined,
          location: currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            region: currentLocation.city || currentLocation.region
          } : undefined
        };

        const recommendation = await irrigationAI.calculateIrrigationRecommendation(input);
        setResults(recommendation);
      } else {
        // Use simple calculation (existing logic)
        const simpleResult = calculateSimpleIrrigation();
        setResults(simpleResult);
      }
    } catch (error) {
      console.error('Error calculating irrigation:', error);
      setError('Failed to calculate irrigation requirements');
      Alert.alert(
        'Calculation Error', 
        'Failed to calculate irrigation requirements. Please try again or use simple mode.',
        [
          { text: 'Try Simple Mode', onPress: () => setUseAI(false) },
          { text: 'Retry', onPress: calculateIrrigation },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSimpleIrrigation = (): IrrigationResult => {
    const area = parseFloat(fieldArea);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity) || 50;

    // Simple calculation logic
    let baseWaterNeed = 25; // liters per square meter per day

    // Adjust based on crop type
    switch (cropType) {
      case 'Rice':
        baseWaterNeed = 40;
        break;
      case 'Tomatoes':
        baseWaterNeed = 30;
        break;
      case 'Potatoes':
        baseWaterNeed = 20;
        break;
      case 'Maize':
        baseWaterNeed = 25;
        break;
      case 'Wheat':
        baseWaterNeed = 22;
        break;
      case 'Beans':
        baseWaterNeed = 18;
        break;
    }

    // Adjust based on temperature
    if (temp > 30) baseWaterNeed *= 1.3;
    else if (temp > 25) baseWaterNeed *= 1.1;
    else if (temp < 15) baseWaterNeed *= 0.8;

    // Adjust based on humidity
    if (hum < 40) baseWaterNeed *= 1.2;
    else if (hum > 70) baseWaterNeed *= 0.9;

    // Adjust based on soil type
    switch (soilType) {
      case 'Sandy':
        baseWaterNeed *= 1.2;
        break;
      case 'Clay':
        baseWaterNeed *= 0.9;
        break;
      case 'Silty':
        baseWaterNeed *= 1.1;
        break;
    }

    const dailyWaterNeed = Math.round(baseWaterNeed * area);
    const weeklyWaterNeed = dailyWaterNeed * 7;

    let frequency = 'Daily';
    let duration = '20-30 minutes';

    if (soilType === 'Clay') {
      frequency = 'Every 2-3 days';
      duration = '45-60 minutes';
    } else if (soilType === 'Sandy') {
      frequency = 'Daily or twice daily';
      duration = '15-20 minutes';
    }

    return {
      dailyWaterNeed,
      weeklyWaterNeed,
      irrigationFrequency: frequency,
      recommendedDuration: duration
    };
  };

  const resetCalculator = () => {
    setCropType('');
    setFieldArea('');
    setSoilType('');
    setTemperature('');
    setHumidity('');
    setResults(null);
    setError(null);
    setUseAI(true);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Irrigation Calculator</Text>
          <Text className="text-gray-600">
            Calculate optimal water requirements for your crops using AI
          </Text>
        </View>

        {/* AI Toggle */}
        <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <View className="flex-1">
            <Text className="text-gray-900 font-medium">AI-Powered Analysis</Text>
            <Text className="text-gray-600 text-sm">Get comprehensive irrigation insights</Text>
          </View>
          <TouchableOpacity
            onPress={() => setUseAI(!useAI)}
            className={`w-12 h-6 rounded-full ${useAI ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <View className={`w-5 h-5 rounded-full bg-white mt-0.5 ${useAI ? 'ml-6' : 'ml-0.5'}`} />
          </TouchableOpacity>
        </View>

        {error && (
          <View className="mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-800">{error}</Text>
          </View>
        )}

        <View className="space-y-4 mb-6">
          {/* Crop Type */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Crop Type *</Text>
            <TextInput
              value={cropType}
              onChangeText={setCropType}
              placeholder="Enter crop type (e.g., Maize, Tomatoes, Rice)"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Field Area */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Field Area (m²) *</Text>
            <TextInput
              value={fieldArea}
              onChangeText={setFieldArea}
              placeholder="Enter field area in square meters"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Soil Type */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Soil Type *</Text>
            <View className="flex-row flex-wrap gap-2">
              {soilTypes.map((soil) => (
                <TouchableOpacity
                  key={soil}
                  onPress={() => setSoilType(soil)}
                  className={`px-4 py-2 rounded-full border ${
                    soilType === soil
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`${
                      soilType === soil ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {soil}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Temperature */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Average Temperature (°C) *</Text>
            <TextInput
              value={temperature}
              onChangeText={setTemperature}
              placeholder="Enter average daily temperature"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Humidity */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Humidity (%) - Optional</Text>
            <TextInput
              value={humidity}
              onChangeText={setHumidity}
              placeholder="Enter humidity percentage (default: 50%)"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>
        </View>

        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={calculateIrrigation}
            disabled={isLoading}
            className={`flex-1 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'} rounded-lg px-4 py-2 items-center`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="calculator-outline" size={24} color="white" />
            )}
            <Text className="text-white font-medium mt-1">
              {isLoading ? 'Calculating...' : 'Calculate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetCalculator}
            className="flex-1 bg-gray-500 rounded-lg px-4 py-2 items-center"
          >
            <Ionicons name="refresh-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Reset</Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View className="bg-blue-50 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Irrigation Requirements</Text>
              {results.confidence && (
                <View className="bg-green-100 px-2 py-1 rounded">
                  <Text className="text-green-800 text-sm font-medium">
                    {Math.round(results.confidence * 100)}% confidence
                  </Text>
                </View>
              )}
            </View>
            
            <View className="space-y-3 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Daily Water Need:</Text>
                <Text className="font-bold text-blue-600">{results.dailyWaterNeed} L</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Weekly Water Need:</Text>
                <Text className="font-bold text-blue-600">{results.weeklyWaterNeed} L</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Irrigation Frequency:</Text>
                <Text className="font-medium text-gray-900">{results.irrigationFrequency}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Recommended Duration:</Text>
                <Text className="font-medium text-gray-900">{results.recommendedDuration}</Text>
              </View>
            </View>

            {/* AI Analysis Section */}
            {results.analysis && (
              <View className="border-t border-gray-200 pt-4">
                <Text className="text-lg font-bold text-gray-900 mb-3">AI Analysis</Text>
                
                <View className="space-y-3">
                  <View>
                    <Text className="font-medium text-gray-800">Crop Water Requirement:</Text>
                    <Text className="text-gray-600 text-sm">{results.analysis.cropWaterRequirement}</Text>
                  </View>
                  
                  <View>
                    <Text className="font-medium text-gray-800">Soil Analysis:</Text>
                    <Text className="text-gray-600 text-sm">{results.analysis.soilAnalysis}</Text>
                  </View>
                  
                  <View>
                    <Text className="font-medium text-gray-800">Weather Impact:</Text>
                    <Text className="text-gray-600 text-sm">{results.analysis.weatherImpact}</Text>
                  </View>

                  {results.analysis.sustainabilityTips && results.analysis.sustainabilityTips.length > 0 && (
                    <View>
                      <Text className="font-medium text-gray-800">Sustainability Tips:</Text>
                      {results.analysis.sustainabilityTips.map((tip, index) => (
                        <Text key={index} className="text-gray-600 text-sm">• {tip}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Schedule Section */}
            {results.schedule && (
              <View className="border-t border-gray-200 pt-4 mt-4">
                <Text className="text-lg font-bold text-gray-900 mb-3">Irrigation Schedule</Text>
                
                {results.schedule.morningSession && (
                  <View className="mb-2">
                    <Text className="font-medium text-gray-800">Morning Session:</Text>
                    <Text className="text-gray-600 text-sm">{results.schedule.morningSession}</Text>
                  </View>
                )}
                
                {results.schedule.eveningSession && (
                  <View className="mb-2">
                    <Text className="font-medium text-gray-800">Evening Session:</Text>
                    <Text className="text-gray-600 text-sm">{results.schedule.eveningSession}</Text>
                  </View>
                )}
                
                <View>
                  <Text className="font-medium text-gray-800">Weekly Pattern:</Text>
                  <Text className="text-gray-600 text-sm">
                    {results.schedule.weeklyPattern && results.schedule.weeklyPattern.length > 0 
                      ? results.schedule.weeklyPattern.join(', ')
                      : 'Daily'
                    }
                  </Text>
                </View>
              </View>
            )}

            <View className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <Text className="text-sm text-yellow-800">
                💡 {useAI ? 'AI-powered comprehensive analysis' : 'Basic calculation'}. 
                Consider local weather conditions, crop growth stage, and soil moisture levels for optimal irrigation.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
