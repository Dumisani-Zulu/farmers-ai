/**
 * Soil Analysis UI Component
 * 
 * This component provides the user interface for soil health analysis,
 * allowing farmers to input soil test data and get AI-powered recommendations.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { soilAnalysisAI, SoilAnalysisRequest, SoilAnalysisResponse } from '../ai/tools/soil-analysis';

interface SoilAnalysisProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onAnalysisComplete?: (result: SoilAnalysisResponse) => void;
}

export const SoilAnalysisTool: React.FC<SoilAnalysisProps> = ({ 
  userLocation, 
  onAnalysisComplete 
}) => {
  const [formData, setFormData] = useState<Partial<SoilAnalysisRequest>>({
    location: userLocation || { latitude: 0, longitude: 0 },
    cropType: '',
    testResults: {
      pH: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      organicMatter: 0,
      moisture: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SoilAnalysisResponse | null>(null);

  const handleInputChange = (field: keyof SoilAnalysisRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestResultChange = (nutrient: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults!,
        [nutrient]: parseFloat(value) || 0
      }
    }));
  };

  const analyzeSoil = async () => {
    if (!formData.cropType) {
      Alert.alert('Error', 'Please specify the crop type');
      return;
    }

    setLoading(true);
    try {
      const request = formData as SoilAnalysisRequest;
      const result = await soilAnalysisAI.analyzeSoil(request);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze soil. Please try again.');
      console.error('Soil analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Soil Analysis Input
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Crop Type *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Maize, Wheat, Vegetables"
          value={formData.cropType || ''}
          onChangeText={(text) => handleInputChange('cropType', text)}
        />
      </View>

      <Text className="text-md font-medium text-gray-700 mb-3">
        Soil Test Results (optional)
      </Text>

      <View className="grid grid-cols-2 gap-4 mb-4">
        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">pH Level</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0.0 - 14.0"
            value={formData.testResults?.pH?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('pH', text)}
            keyboardType="decimal-pad"
          />
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">Nitrogen (ppm)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0"
            value={formData.testResults?.nitrogen?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('nitrogen', text)}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">Phosphorus (ppm)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0"
            value={formData.testResults?.phosphorus?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('phosphorus', text)}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">Potassium (ppm)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0"
            value={formData.testResults?.potassium?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('potassium', text)}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">Organic Matter (%)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0-100"
            value={formData.testResults?.organicMatter?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('organicMatter', text)}
            keyboardType="decimal-pad"
          />
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600 mb-1">Moisture (%)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0-100"
            value={formData.testResults?.moisture?.toString() || ''}
            onChangeText={(text) => handleTestResultChange('moisture', text)}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-brown-600'}`}
        onPress={analyzeSoil}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Analyzing...' : 'Analyze Soil'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Soil Analysis Results
        </Text>
        
        {/* Overall Health */}
        <View className="mb-6 bg-gray-50 rounded-lg p-3">
          <Text className="text-md font-medium text-gray-700 mb-2">
            Overall Soil Health
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-bold ${
              analysis.soilHealth.overall === 'excellent' ? 'text-green-600' :
              analysis.soilHealth.overall === 'good' ? 'text-blue-600' :
              analysis.soilHealth.overall === 'fair' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {analysis.soilHealth.overall.toUpperCase()}
            </Text>
            <Text className="text-lg font-semibold text-gray-700">
              {Math.round(analysis.soilHealth.score * 100)}/100
            </Text>
          </View>
        </View>

        {/* pH Analysis */}
        <View className="mb-4 bg-blue-50 rounded-lg p-3">
          <Text className="font-medium text-blue-800 mb-1">pH Level</Text>
          <Text className="text-sm text-blue-700">
            Value: {analysis.soilHealth.factors.ph.value}
          </Text>
          <Text className="text-sm text-blue-700">
            Status: {analysis.soilHealth.factors.ph.status}
          </Text>
          <Text className="text-sm text-blue-600">
            {analysis.soilHealth.factors.ph.recommendation}
          </Text>
        </View>

        {/* Nutrients */}
        <View className="mb-4">
          <Text className="text-md font-medium text-gray-700 mb-2">
            Nutrient Status
          </Text>
          {analysis.soilHealth.factors.nutrients.deficiencies.length > 0 && (
            <View className="bg-red-50 rounded-lg p-3 mb-2">
              <Text className="font-medium text-red-800 mb-1">Deficiencies</Text>
              <Text className="text-sm text-red-700">
                {analysis.soilHealth.factors.nutrients.deficiencies.join(', ')}
              </Text>
            </View>
          )}
          {analysis.soilHealth.factors.nutrients.excesses.length > 0 && (
            <View className="bg-orange-50 rounded-lg p-3 mb-2">
              <Text className="font-medium text-orange-800 mb-1">Excesses</Text>
              <Text className="text-sm text-orange-700">
                {analysis.soilHealth.factors.nutrients.excesses.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Fertilizer Recommendations */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Fertilizer Recommendations
          </Text>
          <Text className="text-sm text-gray-600 mb-2 capitalize">
            Type: {analysis.fertilizerRecommendations.type}
          </Text>
          {analysis.fertilizerRecommendations.products.map((product, index) => (
            <View key={index} className="bg-green-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-green-800">{product.name}</Text>
              <Text className="text-sm text-green-700">NPK: {product.npkRatio}</Text>
              <Text className="text-sm text-green-700">
                Quantity: {product.quantity} kg/hectare
              </Text>
              <Text className="text-sm text-green-700">
                Application: {product.applicationMethod}
              </Text>
              <Text className="text-sm text-green-700">
                Timing: {product.timing}
              </Text>
              <Text className="text-sm text-green-600">
                Cost: ${product.cost}/hectare
              </Text>
            </View>
          ))}
        </View>

        {/* Application Schedule */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Application Schedule
          </Text>
          {analysis.fertilizerRecommendations.schedule.slice(0, 5).map((item, index) => (
            <View key={index} className="bg-yellow-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-medium text-yellow-800">{item.action}</Text>
                  <Text className="text-sm text-yellow-700">
                    Product: {item.product}
                  </Text>
                  <Text className="text-sm text-yellow-700">
                    Amount: {item.amount} kg
                  </Text>
                </View>
                <Text className="text-sm text-yellow-600">
                  {item.date.toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Amendments */}
        {analysis.amendments.length > 0 && (
          <View className="mb-6">
            <Text className="text-md font-medium text-gray-700 mb-3">
              Soil Amendments
            </Text>
            {analysis.amendments.map((amendment, index) => (
              <View key={index} className="bg-purple-50 rounded-lg p-3 mb-2">
                <Text className="font-semibold text-purple-800">{amendment.type}</Text>
                <Text className="text-sm text-purple-700">
                  Purpose: {amendment.purpose}
                </Text>
                <Text className="text-sm text-purple-700">
                  Quantity: {amendment.quantity} kg/hectare
                </Text>
                <Text className="text-sm text-purple-600">
                  Timing: {amendment.applicationTiming}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Monitoring */}
        <View className="bg-gray-50 rounded-lg p-3">
          <Text className="text-md font-medium text-gray-700 mb-2">
            Monitoring Schedule
          </Text>
          <Text className="text-sm text-gray-600">
            Next Test: {analysis.monitoring.retestDate.toLocaleDateString()}
          </Text>
          <Text className="text-sm text-gray-600">
            Watch: {analysis.monitoring.parametersToWatch.join(', ')}
          </Text>
          <Text className="text-sm text-gray-600">
            Expected Improvements: {analysis.monitoring.expectedImprovements.join(', ')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Soil Analysis
        </Text>
        <Text className="text-gray-600">
          Analyze soil health and get AI-powered fertilizer recommendations.
        </Text>
      </View>

      {renderFormSection()}
      {renderAnalysisResults()}
    </ScrollView>
  );
};
