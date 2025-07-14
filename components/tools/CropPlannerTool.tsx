/**
 * Crop Planner UI Component
 * 
 * This component provides the user interface for the crop planning tool,
 * allowing farmers to input their requirements and view AI-generated recommendations.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { cropPlannerAI, CropPlanningRequest, CropPlanningResponse } from '../../ai/tools/crop-planner';

interface CropPlannerProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onPlanGenerated?: (plan: CropPlanningResponse) => void;
}

export const CropPlannerTool: React.FC<CropPlannerProps> = ({ 
  userLocation, 
  onPlanGenerated 
}) => {
  const [formData, setFormData] = useState<Partial<CropPlanningRequest>>({
    location: userLocation || { latitude: 0, longitude: 0 },
    farmSize: 0,
    soilType: '',
    previousCrops: [],
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CropPlanningResponse | null>(null);

  const handleInputChange = (field: keyof CropPlanningRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePlan = async () => {
    if (!formData.farmSize || !formData.soilType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const request = formData as CropPlanningRequest;
      const generatedPlan = await cropPlannerAI.generateCropPlan(request);
      setPlan(generatedPlan);
      onPlanGenerated?.(generatedPlan);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate crop plan. Please try again.');
      console.error('Crop planning error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Crop Planning Details
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Farm Size (hectares) *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter farm size"
          value={formData.farmSize?.toString() || ''}
          onChangeText={(text) => handleInputChange('farmSize', parseFloat(text) || 0)}
          keyboardType="numeric"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Soil Type *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Clay, Sandy, Loamy"
          value={formData.soilType || ''}
          onChangeText={(text) => handleInputChange('soilType', text)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Previous Crops (optional)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Maize, Beans (comma separated)"
          value={formData.previousCrops?.join(', ') || ''}
          onChangeText={(text) => 
            handleInputChange('previousCrops', text.split(',').map(crop => crop.trim()))
          }
        />
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-green-600'}`}
        onPress={generatePlan}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Generating Plan...' : 'Generate Crop Plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlanResults = () => {
    if (!plan) return null;

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Recommended Crop Plan
        </Text>
        
        {/* Recommended Crops */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Recommended Crops
          </Text>
          {plan.recommendedCrops.map((crop, index) => (
            <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-gray-800">{crop.cropName}</Text>
              <Text className="text-sm text-gray-600">Variety: {crop.variety}</Text>
              <Text className="text-sm text-gray-600">
                Expected Yield: {crop.expectedYield} tons/hectare
              </Text>
              <Text className={`text-sm font-medium ${
                crop.riskLevel === 'low' ? 'text-green-600' :
                crop.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Risk: {crop.riskLevel}
              </Text>
            </View>
          ))}
        </View>

        {/* Rotation Plan */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Crop Rotation Plan
          </Text>
          {plan.rotationPlan.map((rotation, index) => (
            <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-blue-800">{rotation.season}</Text>
              <Text className="text-sm text-blue-700">
                Crops: {rotation.crops.join(', ')}
              </Text>
              <Text className="text-sm text-blue-600">
                Benefits: {rotation.benefits.join(', ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View>
          <Text className="text-md font-medium text-gray-700 mb-3">
            Activity Timeline
          </Text>
          {plan.timeline.slice(0, 5).map((activity, index) => (
            <View key={index} className="flex-row items-center bg-yellow-50 rounded-lg p-3 mb-2">
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{activity.activity}</Text>
                <Text className="text-sm text-gray-600">Crop: {activity.crop}</Text>
                <Text className="text-sm text-gray-500">
                  {activity.date.toLocaleDateString()}
                </Text>
              </View>
              <View className={`px-2 py-1 rounded ${
                activity.importance === 'high' ? 'bg-red-100' :
                activity.importance === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  activity.importance === 'high' ? 'text-red-700' :
                  activity.importance === 'medium' ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {activity.importance}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Crop Planner
        </Text>
        <Text className="text-gray-600">
          Get AI-powered recommendations for optimal crop planning and rotation.
        </Text>
      </View>

      {renderFormSection()}
      {renderPlanResults()}
    </ScrollView>
  );
};
