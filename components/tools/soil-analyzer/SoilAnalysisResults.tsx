import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoilAnalysisResult } from '../../../ai/services/soil-analysis-service';

interface SoilAnalysisResultsProps {
  results: SoilAnalysisResult;
  onClose: () => void;
}

export default function SoilAnalysisResults({ results, onClose }: SoilAnalysisResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelColor = (level: string) => {
    if (level.includes('good') || level.includes('excellent') || level.includes('high')) {
      return 'text-green-600';
    }
    if (level.includes('moderate') || level.includes('medium')) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const getTextureIcon = (texture: string) => {
    switch (texture) {
      case 'sandy': return 'hourglass-outline';
      case 'clay': return 'cube-outline';
      case 'loamy': return 'leaf-outline';
      case 'silt': return 'water-outline';
      default: return 'earth-outline';
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900">Soil Analysis Results</Text>
          <TouchableOpacity 
            onPress={onClose}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Confidence Badge */}
        <View className="flex-row items-center mb-6">
          <View className="bg-blue-100 rounded-full px-4 py-2">
            <Text className={`font-semibold ${getConfidenceColor(results.confidence)}`}>
              {results.confidence}% Confidence
            </Text>
          </View>
        </View>

        {/* Basic Soil Info */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Basic Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="earth" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">Soil Type:</Text>
              <Text className="font-semibold text-gray-900">{results.soilType}</Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="color-palette" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">Color:</Text>
              <Text className="font-semibold text-gray-900">{results.soilColor}</Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name={getTextureIcon(results.texture)} size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">Texture:</Text>
              <Text className="font-semibold text-gray-900 capitalize">{results.texture}</Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="grid" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-2 flex-1">Structure:</Text>
              <Text className="font-semibold text-gray-900">{results.structure}</Text>
            </View>
          </View>
        </View>

        {/* Soil Properties */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Soil Properties</Text>
          
          <View className="space-y-4">
            {/* pH */}
            <View className="border-b border-gray-200 pb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">pH Level</Text>
                <Text className={`font-semibold ${getLevelColor(results.estimatedProperties.pH.level)}`}>
                  {results.estimatedProperties.pH.level}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">{results.estimatedProperties.pH.range}</Text>
              <Text className="text-sm text-gray-500">{results.estimatedProperties.pH.description}</Text>
            </View>

            {/* Organic Matter */}
            <View className="border-b border-gray-200 pb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">Organic Matter</Text>
                <Text className={`font-semibold ${getLevelColor(results.estimatedProperties.organicMatter.level)}`}>
                  {results.estimatedProperties.organicMatter.level}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">{results.estimatedProperties.organicMatter.percentage}</Text>
              <Text className="text-sm text-gray-500">{results.estimatedProperties.organicMatter.description}</Text>
            </View>

            {/* Drainage */}
            <View className="border-b border-gray-200 pb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">Drainage</Text>
                <Text className={`font-semibold ${getLevelColor(results.estimatedProperties.drainage.level)}`}>
                  {results.estimatedProperties.drainage.level}
                </Text>
              </View>
              <Text className="text-sm text-gray-500">{results.estimatedProperties.drainage.description}</Text>
            </View>

            {/* Compaction */}
            <View className="border-b border-gray-200 pb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">Compaction</Text>
                <Text className={`font-semibold ${getLevelColor(results.estimatedProperties.compaction.level)}`}>
                  {results.estimatedProperties.compaction.level}
                </Text>
              </View>
              <Text className="text-sm text-gray-500">{results.estimatedProperties.compaction.description}</Text>
            </View>

            {/* Fertility */}
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-gray-900">Fertility</Text>
                <Text className={`font-semibold ${getLevelColor(results.estimatedProperties.fertility.level)}`}>
                  {results.estimatedProperties.fertility.level}
                </Text>
              </View>
              <Text className="text-sm text-gray-500">{results.estimatedProperties.fertility.description}</Text>
            </View>
          </View>
        </View>

        {/* Suitable Crops */}
        <View className="bg-green-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-green-900 mb-3">Suitable Crops</Text>
          <View className="flex-row flex-wrap gap-2">
            {results.suitableFor.map((crop, index) => (
              <View key={index} className="bg-green-100 rounded-full px-3 py-1">
                <Text className="text-green-800 text-sm font-medium">{crop}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warnings */}
        {results.warnings.length > 0 && (
          <View className="bg-red-50 rounded-lg p-4 mb-6">
            <Text className="text-lg font-bold text-red-900 mb-3">⚠️ Warnings</Text>
            {results.warnings.map((warning, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Ionicons name="warning" size={16} color="#DC2626" className="mt-0.5 mr-2" />
                <Text className="text-red-800 text-sm flex-1">{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Improvements */}
        <View className="bg-blue-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-blue-900 mb-3">Soil Improvements</Text>
          
          {results.improvements.immediate.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-blue-800 mb-2">Immediate Actions</Text>
              {results.improvements.immediate.map((action, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="checkmark-circle" size={16} color="#2563EB" className="mt-0.5 mr-2" />
                  <Text className="text-blue-800 text-sm flex-1">{action}</Text>
                </View>
              ))}
            </View>
          )}

          {results.improvements.seasonal.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-blue-800 mb-2">Seasonal Improvements</Text>
              {results.improvements.seasonal.map((action, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="calendar" size={16} color="#2563EB" className="mt-0.5 mr-2" />
                  <Text className="text-blue-800 text-sm flex-1">{action}</Text>
                </View>
              ))}
            </View>
          )}

          {results.improvements.longTerm.length > 0 && (
            <View>
              <Text className="font-semibold text-blue-800 mb-2">Long-term Strategies</Text>
              {results.improvements.longTerm.map((action, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="trending-up" size={16} color="#2563EB" className="mt-0.5 mr-2" />
                  <Text className="text-blue-800 text-sm flex-1">{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Fertilization */}
        <View className="bg-amber-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-amber-900 mb-3">Fertilization Recommendations</Text>
          
          {results.fertilization.organic.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-amber-800 mb-2">Organic Options</Text>
              {results.fertilization.organic.map((option, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="leaf" size={16} color="#D97706" className="mt-0.5 mr-2" />
                  <Text className="text-amber-800 text-sm flex-1">{option}</Text>
                </View>
              ))}
            </View>
          )}

          {results.fertilization.chemical.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-amber-800 mb-2">Chemical Options</Text>
              {results.fertilization.chemical.map((option, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="flask" size={16} color="#D97706" className="mt-0.5 mr-2" />
                  <Text className="text-amber-800 text-sm flex-1">{option}</Text>
                </View>
              ))}
            </View>
          )}

          {results.fertilization.timing.length > 0 && (
            <View>
              <Text className="font-semibold text-amber-800 mb-2">Timing</Text>
              {results.fertilization.timing.map((timing, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="time" size={16} color="#D97706" className="mt-0.5 mr-2" />
                  <Text className="text-amber-800 text-sm flex-1">{timing}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Management Practices */}
        <View className="bg-purple-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-purple-900 mb-3">Management Practices</Text>
          
          {results.management.irrigation.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-purple-800 mb-2">Irrigation</Text>
              {results.management.irrigation.map((practice, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="water" size={16} color="#7C3AED" className="mt-0.5 mr-2" />
                  <Text className="text-purple-800 text-sm flex-1">{practice}</Text>
                </View>
              ))}
            </View>
          )}

          {results.management.cultivation.length > 0 && (
            <View className="mb-4">
              <Text className="font-semibold text-purple-800 mb-2">Cultivation</Text>
              {results.management.cultivation.map((practice, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="construct" size={16} color="#7C3AED" className="mt-0.5 mr-2" />
                  <Text className="text-purple-800 text-sm flex-1">{practice}</Text>
                </View>
              ))}
            </View>
          )}

          {results.management.cropping.length > 0 && (
            <View>
              <Text className="font-semibold text-purple-800 mb-2">Cropping</Text>
              {results.management.cropping.map((practice, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="flower" size={16} color="#7C3AED" className="mt-0.5 mr-2" />
                  <Text className="text-purple-800 text-sm flex-1">{practice}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Key Recommendations */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Key Recommendations</Text>
          {results.recommendations.map((recommendation, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Ionicons name="bulb" size={16} color="#374151" className="mt-0.5 mr-2" />
              <Text className="text-gray-800 text-sm flex-1">{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
