/**
 * Disease Identification UI Component
 * 
 * This component provides the user interface for plant disease identification,
 * allowing farmers to upload images and get AI-powered disease diagnosis and treatment recommendations.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { diseaseIdentificationAI, DiseaseIdentificationRequest, DiseaseIdentificationResponse } from '../ai/tools/disease-identification';

interface DiseaseIdentificationProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onDiseaseIdentified?: (result: DiseaseIdentificationResponse) => void;
}

export const DiseaseIdentificationTool: React.FC<DiseaseIdentificationProps> = ({ 
  userLocation, 
  onDiseaseIdentified 
}) => {
  const [formData, setFormData] = useState<Partial<DiseaseIdentificationRequest>>({
    location: userLocation || { latitude: 0, longitude: 0 },
    cropType: '',
    symptoms: [],
    affectedArea: 0,
    timeOfYear: new Date(),
    environmentalConditions: {
      humidity: 0,
      temperature: 0,
      rainfall: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseIdentificationResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleInputChange = (field: keyof DiseaseIdentificationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEnvironmentalChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      environmentalConditions: {
        ...prev.environmentalConditions!,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleImageUpload = () => {
    // TODO: Implement image picker functionality
    Alert.alert('Info', 'Image upload functionality will be implemented');
  };

  const identifyDisease = async () => {
    if (!formData.cropType || !formData.symptoms || formData.symptoms.length === 0) {
      Alert.alert('Error', 'Please fill in crop type and symptoms');
      return;
    }

    setLoading(true);
    try {
      const request = {
        ...formData,
        image: selectedImage || undefined,
      } as DiseaseIdentificationRequest;
      
      const identification = await diseaseIdentificationAI.identifyDisease(request);
      setResult(identification);
      onDiseaseIdentified?.(identification);
    } catch (error) {
      Alert.alert('Error', 'Failed to identify disease. Please try again.');
      console.error('Disease identification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Disease Identification
      </Text>
      
      {/* Image Upload */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Upload Plant Image (recommended)
        </Text>
        <TouchableOpacity
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
          onPress={handleImageUpload}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} className="w-20 h-20 rounded" />
          ) : (
            <View>
              <Text className="text-gray-500 text-center">📸 Tap to upload image</Text>
              <Text className="text-xs text-gray-400 text-center mt-1">
                Photo of affected plant parts for better diagnosis
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
          placeholder="e.g., Maize, Tomato, Wheat"
          value={formData.cropType || ''}
          onChangeText={(text) => handleInputChange('cropType', text)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Disease Symptoms *
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 h-24"
          placeholder="e.g., Yellow spots on leaves, brown patches, wilting, stunted growth"
          value={formData.symptoms?.join(', ') || ''}
          onChangeText={(text) => 
            handleInputChange('symptoms', text.split(',').map(symptom => symptom.trim()))
          }
          multiline
          textAlignVertical="top"
        />
        <Text className="text-xs text-gray-500 mt-1">
          Separate multiple symptoms with commas
        </Text>
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

      {/* Environmental Conditions */}
      <Text className="text-md font-medium text-gray-700 mb-3">
        Environmental Conditions (optional)
      </Text>
      
      <View className="grid grid-cols-2 gap-3 mb-4">
        <View>
          <Text className="text-sm text-gray-600 mb-1">Temperature (°C)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="25"
            value={formData.environmentalConditions?.temperature?.toString() || ''}
            onChangeText={(text) => handleEnvironmentalChange('temperature', text)}
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text className="text-sm text-gray-600 mb-1">Humidity (%)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="70"
            value={formData.environmentalConditions?.humidity?.toString() || ''}
            onChangeText={(text) => handleEnvironmentalChange('humidity', text)}
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text className="text-sm text-gray-600 mb-1">Rainfall (mm)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="50"
            value={formData.environmentalConditions?.rainfall?.toString() || ''}
            onChangeText={(text) => handleEnvironmentalChange('rainfall', text)}
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text className="text-sm text-gray-600 mb-1">Wind Speed (km/h)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2"
            placeholder="15"
            value={formData.environmentalConditions?.windSpeed?.toString() || ''}
            onChangeText={(text) => handleEnvironmentalChange('windSpeed', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-lg py-3 px-6 ${loading ? 'bg-gray-400' : 'bg-red-600'}`}
        onPress={identifyDisease}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Identifying Disease...' : 'Identify Disease'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <ScrollView className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Disease Identification Results
        </Text>
        
        {/* Identified Diseases */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Possible Diseases
          </Text>
          {result.identifiedDiseases.map((disease, index) => (
            <View key={index} className="bg-red-50 rounded-lg p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-bold text-red-800 text-lg">{disease.name}</Text>
                  <Text className="text-sm italic text-red-700">{disease.scientificName}</Text>
                  <Text className="text-sm text-red-600 mt-1">
                    {disease.causativeAgent.toUpperCase()} • {disease.lifecycle}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-600 mb-1">
                    {Math.round(disease.confidence * 100)}% match
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${
                    disease.severity === 'critical' ? 'bg-red-200' :
                    disease.severity === 'severe' ? 'bg-orange-200' :
                    disease.severity === 'moderate' ? 'bg-yellow-200' : 'bg-green-200'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      disease.severity === 'critical' ? 'text-red-700' :
                      disease.severity === 'severe' ? 'text-orange-700' :
                      disease.severity === 'moderate' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {disease.severity}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm text-red-700 mb-2">{disease.description}</Text>
              {disease.favorableConditions.length > 0 && (
                <Text className="text-xs text-red-600">
                  Favorable conditions: {disease.favorableConditions.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Treatment Options */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Treatment Recommendations
          </Text>
          {result.treatments.map((treatment, index) => (
            <View key={index} className="bg-blue-50 rounded-lg p-4 mb-3">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-blue-800 capitalize text-lg">
                  {treatment.type} Treatment
                </Text>
                <View className="items-end">
                  <Text className="text-sm text-blue-600">
                    {Math.round(treatment.effectiveness * 100)}% effective
                  </Text>
                  <View className={`px-2 py-1 rounded mt-1 ${
                    treatment.resistanceRisk === 'low' ? 'bg-green-200' :
                    treatment.resistanceRisk === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      treatment.resistanceRisk === 'low' ? 'text-green-700' :
                      treatment.resistanceRisk === 'medium' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {treatment.resistanceRisk} resistance risk
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Products */}
              {treatment.products.map((product, prodIndex) => (
                <View key={prodIndex} className="bg-white rounded p-3 mb-2">
                  <Text className="font-semibold text-blue-800">{product.name}</Text>
                  <Text className="text-sm text-blue-700">
                    Active ingredient: {product.activeIngredient}
                  </Text>
                  <Text className="text-sm text-blue-700">
                    Dosage: {product.dosage} • Frequency: {product.frequency}
                  </Text>
                  <Text className="text-sm text-blue-600">
                    Cost: ${product.cost}/application
                  </Text>
                </View>
              ))}
              
              <Text className="text-sm text-blue-700 mb-1">
                Application: {treatment.applicationMethod}
              </Text>
              <Text className="text-sm text-blue-700 mb-2">
                Timing: {treatment.timing}
              </Text>
              
              {treatment.safetyPrecautions.length > 0 && (
                <View className="bg-yellow-50 rounded p-2">
                  <Text className="text-xs font-medium text-yellow-800 mb-1">
                    ⚠️ Safety Precautions:
                  </Text>
                  <Text className="text-xs text-yellow-700">
                    {treatment.safetyPrecautions.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Management Strategy */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Disease Management Strategy
          </Text>
          
          <View className="bg-red-50 rounded-lg p-3 mb-2">
            <Text className="font-semibold text-red-800 mb-2">🚨 Immediate Actions</Text>
            {result.managementStrategy.immediate.map((action, index) => (
              <Text key={index} className="text-sm text-red-700 mb-1">
                • {action}
              </Text>
            ))}
          </View>

          <View className="bg-orange-50 rounded-lg p-3 mb-2">
            <Text className="font-semibold text-orange-800 mb-2">📅 Short-term (1-4 weeks)</Text>
            {result.managementStrategy.shortTerm.map((action, index) => (
              <Text key={index} className="text-sm text-orange-700 mb-1">
                • {action}
              </Text>
            ))}
          </View>

          <View className="bg-green-50 rounded-lg p-3 mb-2">
            <Text className="font-semibold text-green-800 mb-2">🌱 Long-term Management</Text>
            {result.managementStrategy.longTerm.map((action, index) => (
              <Text key={index} className="text-sm text-green-700 mb-1">
                • {action}
              </Text>
            ))}
          </View>

          <View className="bg-blue-50 rounded-lg p-3">
            <Text className="font-semibold text-blue-800 mb-2">👁️ Monitoring</Text>
            {result.managementStrategy.monitoring.map((action, index) => (
              <Text key={index} className="text-sm text-blue-700 mb-1">
                • {action}
              </Text>
            ))}
          </View>
        </View>

        {/* Risk Assessment */}
        <View className="mb-6">
          <Text className="text-md font-medium text-gray-700 mb-3">
            Risk Assessment
          </Text>
          <View className="grid grid-cols-2 gap-3">
            <View className="bg-red-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-red-800">Spread Risk</Text>
              <Text className="text-2xl font-bold text-red-700">
                {Math.round(result.riskAssessment.spreadRisk * 100)}%
              </Text>
            </View>
            <View className="bg-orange-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-orange-800">Yield Loss Risk</Text>
              <Text className="text-2xl font-bold text-orange-700">
                {Math.round(result.riskAssessment.yieldLossRisk * 100)}%
              </Text>
            </View>
            <View className="bg-purple-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-purple-800">Economic Impact</Text>
              <Text className="text-2xl font-bold text-purple-700">
                {Math.round(result.riskAssessment.economicImpact * 100)}%
              </Text>
            </View>
            <View className="bg-blue-50 rounded-lg p-3">
              <Text className="text-sm font-medium text-blue-800">Weather Dependency</Text>
              <Text className="text-2xl font-bold text-blue-700">
                {Math.round(result.riskAssessment.weatherDependency * 100)}%
              </Text>
            </View>
          </View>
          
          <View className={`mt-3 p-3 rounded-lg ${
            result.riskAssessment.treatmentUrgency === 'immediate' ? 'bg-red-100' :
            result.riskAssessment.treatmentUrgency === 'within_24h' ? 'bg-orange-100' :
            result.riskAssessment.treatmentUrgency === 'within_week' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <Text className={`font-bold text-center ${
              result.riskAssessment.treatmentUrgency === 'immediate' ? 'text-red-800' :
              result.riskAssessment.treatmentUrgency === 'within_24h' ? 'text-orange-800' :
              result.riskAssessment.treatmentUrgency === 'within_week' ? 'text-yellow-800' : 'text-green-800'
            }`}>
              Treatment Urgency: {result.riskAssessment.treatmentUrgency.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Similar Diseases */}
        {result.similarDiseases.length > 0 && (
          <View className="mb-6">
            <Text className="text-md font-medium text-gray-700 mb-3">
              Similar Diseases (Differential Diagnosis)
            </Text>
            {result.similarDiseases.map((similar, index) => (
              <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                <Text className="font-semibold text-gray-800">{similar.name}</Text>
                <Text className="text-sm text-gray-700 mb-1">
                  Key differences: {similar.differences.join(', ')}
                </Text>
                <Text className="text-sm text-gray-600">
                  Look for: {similar.distinguishingFeatures.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Prevention */}
        <View className="bg-green-50 rounded-lg p-4">
          <Text className="text-md font-medium text-green-800 mb-3">
            🛡️ Preventive Measures
          </Text>
          {result.preventiveMeasures.map((measure, index) => (
            <View key={index} className="mb-2">
              <View className="flex-row justify-between items-center">
                <Text className="font-medium text-green-800">{measure.practice}</Text>
                <Text className="text-sm text-green-600">
                  {Math.round(measure.effectiveness * 100)}% effective
                </Text>
              </View>
              <Text className="text-sm text-green-700">
                Timing: {measure.timing} • Cost: ${measure.cost}
              </Text>
              <Text className="text-sm text-green-600">{measure.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Disease Identification
        </Text>
        <Text className="text-gray-600">
          AI-powered plant disease diagnosis with treatment recommendations.
        </Text>
      </View>

      {renderFormSection()}
      {renderResults()}
    </ScrollView>
  );
};
