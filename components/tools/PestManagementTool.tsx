/**
 * Pest Management UI Component
 * 
 * This component provides the user interface for pest identification and management,
 * allowing farmers to upload images and get AI-powered pest identification and treatment recommendations.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { pestManagementAI, PestIdentificationRequest, PestIdentificationResponse } from '../../ai/tools/pest-management';

interface PestManagementProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onPestIdentified?: (result: PestIdentificationResponse) => void;
}

export const PestManagementTool: React.FC<PestManagementProps> = ({ 
  userLocation, 
  onPestIdentified 
}) => {
  const [formData, setFormData] = useState<Partial<PestIdentificationRequest>>({
    location: userLocation || { latitude: 0, longitude: 0 },
    cropType: '',
    symptoms: [],
    affectedArea: 0,
    timeOfYear: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PestIdentificationResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleInputChange = (field: keyof PestIdentificationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = () => {
    // TODO: Implement image picker functionality
    Alert.alert('Info', 'Image upload functionality will be implemented');
  };

  const identifyPest = async () => {
    if (!formData.cropType || !formData.symptoms || formData.symptoms.length === 0) {
      Alert.alert('Error', 'Please fill in crop type and symptoms');
      return;
    }

    setLoading(true);
    try {
      const request = {
        ...formData,
        image: selectedImage || undefined,
      } as PestIdentificationRequest;
      
      const identification = await pestManagementAI.identifyPest(request);
      setResult(identification);
      onPestIdentified?.(identification);
    } catch (error) {
      Alert.alert('Error', 'Failed to identify pest. Please try again.');
      console.error('Pest identification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Pest Identification
      </Text>
      
      {/* Image Upload */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Upload Plant Image (optional)
        </Text>
        <TouchableOpacity
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
          onPress={handleImageUpload}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} className="w-20 h-20 rounded" />
          ) : (
            <View>
              <Text className="text-gray-500 text-center">Tap to upload image</Text>
              <Text className="text-xs text-gray-400 text-center mt-1">
                Photo of affected plant parts
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Crop Type *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g., Maize, Tomato, Beans"
          value={formData.cropType || ''}
          onChangeText={(text) => handleInputChange('cropType', text)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Observed Symptoms *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 h-20"
          placeholder="e.g., Yellow spots on leaves, holes in leaves, wilting"
          value={formData.symptoms?.join(', ') || ''}
          onChangeText={(text) => 
            handleInputChange('symptoms', text.split(',').map(symptom => symptom.trim()))
          }
          multiline
          textAlignVertical="top"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Affected Area (%)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Percentage of crop affected"
          value={formData.affectedArea?.toString() || ''}
          onChangeText={(text) => handleInputChange('affectedArea', parseFloat(text) || 0)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-red-600'}`}
        onPress={identifyPest}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Identifying...' : 'Identify Pest'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Identification Results
        </Text>
        
        {/* Identified Pests */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Possible Pests
          </Text>
          {result.identifiedPests.map((pest, index) => (
            <View key={index} className="bg-red-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{pest.name}</Text>
                  <Text className="text-sm text-gray-600">{pest.scientificName}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600 mr-2">
                    {Math.round(pest.confidence * 100)}%
                  </Text>
                  <View className={`px-2 py-1 rounded ${
                    pest.severity === 'critical' ? 'bg-red-200' :
                    pest.severity === 'high' ? 'bg-orange-200' :
                    pest.severity === 'medium' ? 'bg-yellow-200' : 'bg-green-200'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      pest.severity === 'critical' ? 'text-red-700' :
                      pest.severity === 'high' ? 'text-orange-700' :
                      pest.severity === 'medium' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {pest.severity}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mb-1">{pest.description}</Text>
              <Text className="text-xs text-gray-500">Lifecycle: {pest.lifecycle}</Text>
            </View>
          ))}
        </View>

        {/* Treatment Recommendations */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Treatment Options
          </Text>
          {result.treatments.map((treatment, index) => (
            <View key={index} className="bg-blue-50 rounded-lg p-3 mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-blue-800 capitalize">
                  {treatment.method} Treatment
                </Text>
                <Text className="text-sm text-blue-600">
                  {Math.round(treatment.effectiveness * 100)}% effective
                </Text>
              </View>
              <Text className="text-sm text-blue-700 mb-1">
                Products: {treatment.products.join(', ')}
              </Text>
              <Text className="text-sm text-blue-700 mb-1">
                Timing: {treatment.applicationTiming}
              </Text>
              <Text className="text-sm text-blue-700 mb-1">
                Frequency: {treatment.frequency}
              </Text>
              {treatment.safety.length > 0 && (
                <Text className="text-xs text-blue-600">
                  Safety: {treatment.safety.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Preventive Measures */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Preventive Measures
          </Text>
          {result.preventiveMeasures.map((measure, index) => (
            <View key={index} className="bg-green-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-green-800">{measure.practice}</Text>
              <Text className="text-sm text-green-700">Timing: {measure.timing}</Text>
              <Text className="text-sm text-green-600">{measure.description}</Text>
            </View>
          ))}
        </View>

        {/* Risk Assessment */}
        <View className="bg-yellow-50 rounded-lg p-3">
          <Text className="text-md font-medium text-yellow-800 mb-2">
            Risk Assessment
          </Text>
          <Text className="text-sm text-yellow-700">
            Spread Risk: {Math.round(result.riskAssessment.spreadRisk * 100)}%
          </Text>
          <Text className="text-sm text-yellow-700">
            Crop Loss Risk: {Math.round(result.riskAssessment.cropLossRisk * 100)}%
          </Text>
          <Text className={`text-sm font-medium mt-1 ${
            result.riskAssessment.treatmentUrgency === 'immediate' ? 'text-red-700' :
            result.riskAssessment.treatmentUrgency === 'within_week' ? 'text-orange-700' : 'text-green-700'
          }`}>
            Treatment Urgency: {result.riskAssessment.treatmentUrgency.replace('_', ' ')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Pest Management
        </Text>
        <Text className="text-gray-600">
          Identify pests and get AI-powered treatment recommendations.
        </Text>
      </View>

      {renderFormSection()}
      {renderResults()}
    </ScrollView>
  );
};
