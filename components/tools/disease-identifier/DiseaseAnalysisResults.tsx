import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiseaseAnalysisResult } from '../../../ai/services/disease-identification-service';

interface DiseaseAnalysisResultsProps {
  results: DiseaseAnalysisResult;
  onClose: () => void;
}

export default function DiseaseAnalysisResults({ results, onClose }: DiseaseAnalysisResultsProps) {
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

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-900">Analysis Results</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Crop Identification */}
      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="leaf" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold text-blue-800 ml-2">Crop Identified</Text>
        </View>
        <Text className="text-xl font-bold text-blue-900">{results.cropType}</Text>
      </View>

      {/* Disease Status */}
      <View className={`p-4 rounded-lg mb-4 ${results.diseaseDetected ? getSeverityBgColor(results.severity) : 'bg-green-50'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons 
              name={results.diseaseDetected ? "warning" : "checkmark-circle"} 
              size={24} 
              color={results.diseaseDetected ? "#EF4444" : "#10B981"} 
            />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              {results.diseaseDetected ? 'Disease Detected' : 'Plant Appears Healthy'}
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            {results.confidence}% confidence
          </Text>
        </View>
        
        {results.diseaseDetected && results.diseaseName && (
          <View>
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {results.diseaseName}
            </Text>
            <Text className={`text-sm font-medium ${getSeverityColor(results.severity)}`}>
              Severity: {results.severity.charAt(0).toUpperCase() + results.severity.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Symptoms */}
      {results.symptoms && results.symptoms.length > 0 && (
        <View className="mb-4">
          {renderSection('Symptoms Observed', results.symptoms, 'eye-outline')}
        </View>
      )}

      {/* Causes */}
      {results.causes && results.causes.length > 0 && (
        <View className="mb-4">
          {renderSection('Possible Causes', results.causes, 'help-circle-outline')}
        </View>
      )}

      {/* Risk Factors */}
      {results.riskFactors && results.riskFactors.length > 0 && (
        <View className="mb-4">
          {renderSection('Risk Factors', results.riskFactors, 'alert-circle-outline')}
        </View>
      )}

      {/* Immediate Treatment */}
      {results.treatment?.immediate && results.treatment.immediate.length > 0 && (
        <View className="mb-4">
          <View className="bg-red-50 p-4 rounded-lg">
            {renderSection('Immediate Actions', results.treatment.immediate, 'flash-outline')}
          </View>
        </View>
      )}

      {/* Treatment Options */}
      {results.treatment && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Treatment Options</Text>
          
          {results.treatment.organic && results.treatment.organic.length > 0 && (
            <View className="bg-green-50 p-3 rounded-lg mb-3">
              <Text className="text-md font-medium text-green-800 mb-2">🌱 Organic Methods</Text>
              {results.treatment.organic.map((item, index) => (
                <Text key={index} className="text-green-700 mb-1">• {item}</Text>
              ))}
            </View>
          )}

          {results.treatment.ongoing && results.treatment.ongoing.length > 0 && (
            <View className="bg-blue-50 p-3 rounded-lg mb-3">
              <Text className="text-md font-medium text-blue-800 mb-2">🔄 Ongoing Management</Text>
              {results.treatment.ongoing.map((item, index) => (
                <Text key={index} className="text-blue-700 mb-1">• {item}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Prevention */}
      {results.prevention && (
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Prevention Strategies</Text>
          
          {results.prevention.cultural && results.prevention.cultural.length > 0 && (
            <View className="bg-yellow-50 p-3 rounded-lg mb-3">
              <Text className="text-md font-medium text-yellow-800 mb-2">🚜 Cultural Practices</Text>
              {results.prevention.cultural.map((item, index) => (
                <Text key={index} className="text-yellow-700 mb-1">• {item}</Text>
              ))}
            </View>
          )}

          {results.prevention.biological && results.prevention.biological.length > 0 && (
            <View className="bg-green-50 p-3 rounded-lg mb-3">
              <Text className="text-md font-medium text-green-800 mb-2">🦋 Biological Control</Text>
              {results.prevention.biological.map((item, index) => (
                <Text key={index} className="text-green-700 mb-1">• {item}</Text>
              ))}
            </View>
          )}

          {results.prevention.chemical && results.prevention.chemical.length > 0 && (
            <View className="bg-purple-50 p-3 rounded-lg mb-3">
              <Text className="text-md font-medium text-purple-800 mb-2">🧪 Chemical Control</Text>
              {results.prevention.chemical.map((item, index) => (
                <Text key={index} className="text-purple-700 mb-1">• {item}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <View className="mb-6">
          <View className="bg-indigo-50 p-4 rounded-lg">
            {renderSection('Key Recommendations', results.recommendations, 'bulb-outline')}
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
        <Text className="text-sm text-gray-600 text-center">
          ⚠️ This analysis is for guidance only. For severe cases or confirmation, 
          consult with a local agricultural extension officer or plant pathologist.
        </Text>
      </View>
    </ScrollView>
  );
}
