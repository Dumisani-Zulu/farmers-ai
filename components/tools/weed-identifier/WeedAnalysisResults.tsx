import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeedAnalysisResult } from '../../../ai/services/weed-identification-service';

interface WeedAnalysisResultsProps {
  results: WeedAnalysisResult;
  onClose: () => void;
}

export default function WeedAnalysisResults({ results, onClose }: WeedAnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'high': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getWeedTypeColor = (weedType: string) => {
    switch (weedType) {
      case 'broadleaf': return 'text-blue-600';
      case 'grassy': return 'text-green-600';
      case 'sedge': return 'text-purple-600';
      case 'mixed': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getWeedTypeBgColor = (weedType: string) => {
    switch (weedType) {
      case 'broadleaf': return 'bg-blue-100';
      case 'grassy': return 'bg-green-100';
      case 'sedge': return 'bg-purple-100';
      case 'mixed': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const renderSection = (title: string, items: string[], icon: string) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon as any} size={20} color="#374151" />
        <Text className="text-lg font-semibold text-gray-700 ml-2">{title}</Text>
      </View>
      <View className="ml-6">
        {items.map((item, index) => (
          <Text key={index} className="text-gray-600 mb-1">
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderPreventionSection = (prevention: any) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name="shield-outline" size={20} color="#374151" />
        <Text className="text-lg font-semibold text-gray-700 ml-2">Prevention Methods</Text>
      </View>
      <View className="ml-6">
        {prevention.cultural.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Cultural Controls:</Text>
            {prevention.cultural.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
        {prevention.biological.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Biological Controls:</Text>
            {prevention.biological.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
        {prevention.chemical.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Chemical Controls:</Text>
            {prevention.chemical.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderTreatmentSection = (treatment: any) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name="medical-outline" size={20} color="#374151" />
        <Text className="text-lg font-semibold text-gray-700 ml-2">Treatment Options</Text>
      </View>
      <View className="ml-6">
        {treatment.immediate.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Immediate Actions:</Text>
            {treatment.immediate.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
        {treatment.ongoing.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Ongoing Management:</Text>
            {treatment.ongoing.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
        {treatment.organic.length > 0 && (
          <View className="mb-2">
            <Text className="font-medium text-gray-700 mb-1">Organic Options:</Text>
            {treatment.organic.map((item: string, index: number) => (
              <Text key={index} className="text-gray-600 mb-1">• {item}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-900">Weed Analysis Results</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Detection Status */}
      <View className="mb-6">
        <View className={`p-4 rounded-lg ${results.weedDetected ? 'bg-red-50' : 'bg-green-50'}`}>
          <View className="flex-row items-center">
            <Ionicons 
              name={results.weedDetected ? "warning" : "checkmark-circle"} 
              size={24} 
              color={results.weedDetected ? "#DC2626" : "#059669"} 
            />
            <Text className={`ml-2 text-lg font-semibold ${results.weedDetected ? 'text-red-700' : 'text-green-700'}`}>
              {results.weedDetected ? 'Weeds Detected' : 'No Weeds Detected'}
            </Text>
          </View>
          <Text className="text-gray-600 mt-2">
            Confidence: {results.confidence}%
          </Text>
        </View>
      </View>

      {results.weedDetected && (
        <>
          {/* Weed Information */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Weed Information</Text>
            
            {results.weedName && (
              <View className="mb-3">
                <Text className="font-semibold text-gray-700">Identified Weed:</Text>
                <Text className="text-gray-600">{results.weedName}</Text>
              </View>
            )}

            <View className="mb-3">
              <Text className="font-semibold text-gray-700">Crop Type:</Text>
              <Text className="text-gray-600">{results.cropType}</Text>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className={`px-3 py-1 rounded-full ${getSeverityBgColor(results.severity)}`}>
                <Text className={`font-medium ${getSeverityColor(results.severity)}`}>
                  {results.severity.toUpperCase()} Severity
                </Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${getWeedTypeBgColor(results.weedType)}`}>
                <Text className={`font-medium ${getWeedTypeColor(results.weedType)}`}>
                  {results.weedType.toUpperCase()} Weed
                </Text>
              </View>
            </View>
          </View>

          {/* Characteristics */}
          {results.characteristics.length > 0 && renderSection('Weed Characteristics', results.characteristics, 'eye-outline')}

          {/* Competitive Impact */}
          {results.competitiveImpact.length > 0 && renderSection('Competitive Impact', results.competitiveImpact, 'trending-down-outline')}

          {/* Prevention Methods */}
          {renderPreventionSection(results.prevention)}

          {/* Treatment Options */}
          {renderTreatmentSection(results.treatment)}

          {/* Risk Factors */}
          {results.riskFactors.length > 0 && renderSection('Risk Factors', results.riskFactors, 'warning-outline')}

          {/* Recommendations */}
          {results.recommendations.length > 0 && renderSection('Recommendations', results.recommendations, 'bulb-outline')}
        </>
      )}

      {/* Close Button */}
      <TouchableOpacity
        onPress={onClose}
        className="bg-gray-500 rounded-lg p-4 items-center mt-6"
      >
        <Text className="text-white font-medium">Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
