import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IrrigationResult {
  dailyWaterNeed: number;
  weeklyWaterNeed: number;
  irrigationFrequency: string;
  recommendedDuration: string;
}

export default function IrrigationCalculator() {
  const [cropType, setCropType] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [results, setResults] = useState<IrrigationResult | null>(null);

  const cropTypes = ['Maize', 'Wheat', 'Rice', 'Tomatoes', 'Potatoes', 'Beans'];
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty'];

  const calculateIrrigation = () => {
    if (!cropType || !fieldArea || !soilType || !temperature) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const area = parseFloat(fieldArea);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity) || 50;

    // Simple calculation logic (in real app, this would be more sophisticated)
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

    setResults({
      dailyWaterNeed,
      weeklyWaterNeed,
      irrigationFrequency: frequency,
      recommendedDuration: duration
    });
  };

  const resetCalculator = () => {
    setCropType('');
    setFieldArea('');
    setSoilType('');
    setTemperature('');
    setHumidity('');
    setResults(null);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Irrigation Calculator</Text>
          <Text className="text-gray-600">
            Calculate optimal water requirements for your crops
          </Text>
        </View>

        <View className="space-y-4 mb-6">
          {/* Crop Type */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Crop Type *</Text>
            <View className="flex-row flex-wrap gap-2">
              {cropTypes.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  onPress={() => setCropType(crop)}
                  className={`px-4 py-2 rounded-full border ${
                    cropType === crop
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`${
                      cropType === crop ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {crop}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
            className="flex-1 bg-blue-500 rounded-lg p-4 items-center"
          >
            <Ionicons name="calculator-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Calculate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetCalculator}
            className="flex-1 bg-gray-500 rounded-lg p-4 items-center"
          >
            <Ionicons name="refresh-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Reset</Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Irrigation Requirements</Text>
            
            <View className="space-y-3">
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

            <View className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <Text className="text-sm text-yellow-800">
                💡 These calculations are estimates. Consider local weather conditions, 
                crop growth stage, and soil moisture levels for optimal irrigation.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
