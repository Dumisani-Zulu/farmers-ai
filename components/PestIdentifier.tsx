import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, ArrowLeft, AlertTriangle, CheckCircle, Info, Bug } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { agriculturalAITools, PestResult } from '../lib/agricultural-ai-tools';

interface PestIdentifierProps {
  onBack: () => void;
}

const PestIdentifier: React.FC<PestIdentifierProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PestResult | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    try {
      const analysis = await agriculturalAITools.identifyPest(selectedImage);
      setResult(analysis);
    } catch {
      Alert.alert('Analysis Failed', 'Failed to identify the pest. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle size={20} color="#10b981" />;
      case 'medium': return <Info size={20} color="#f59e0b" />;
      case 'high': return <AlertTriangle size={20} color="#ef4444" />;
      default: return <Info size={20} color="#6b7280" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Bug size={24} color="#ef4444" className="mr-2" />
          <View>
            <Text className="text-xl font-bold text-gray-900">Pest Identifier</Text>
            <Text className="text-sm text-gray-600">Identify agricultural pests</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Image Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Take or Select Photo</Text>
          
          {selectedImage ? (
            <View className="mb-4">
              <Image source={{ uri: selectedImage }} className="w-full h-64 rounded-xl" />
              <TouchableOpacity 
                onPress={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
              >
                <Text className="text-white text-xs font-medium">✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl h-64 items-center justify-center mb-4">
              <Bug size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">No image selected</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">Take a photo of the pest</Text>
            </View>
          )}

          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={takePhoto}
              className="flex-1 bg-green-600 rounded-lg p-3 flex-row items-center justify-center"
            >
              <Camera size={20} color="white" />
              <Text className="text-white font-medium ml-2">Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={pickImage}
              className="flex-1 bg-blue-600 rounded-lg p-3 flex-row items-center justify-center"
            >
              <Upload size={20} color="white" />
              <Text className="text-white font-medium ml-2">Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analyze Button */}
        {selectedImage && (
          <TouchableOpacity 
            onPress={analyzeImage}
            disabled={analyzing}
            className={`rounded-lg p-4 mb-6 ${analyzing ? 'bg-gray-400' : 'bg-red-600'}`}
          >
            <Text className="text-white font-semibold text-center">
              {analyzing ? 'Identifying Pest...' : 'Identify Pest'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Results */}
        {result && (
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Pest Identification</Text>
            
            {/* Pest Name */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-semibold text-gray-800">{result.pest}</Text>
                <View className="flex-row items-center">
                  {getSeverityIcon(result.severity)}
                  <Text 
                    className="text-sm font-medium ml-1 capitalize"
                    style={{ color: getSeverityColor(result.severity) }}
                  >
                    {result.severity} Threat
                  </Text>
                </View>
              </View>
              
              <View className="bg-gray-100 rounded-lg p-2">
                <Text className="text-sm text-gray-600">
                  Confidence: {Math.round(result.confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
              <Text className="text-sm text-gray-600">{result.description}</Text>
            </View>

            {/* Treatment */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Control Methods</Text>
              <View className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <Text className="text-sm text-orange-800">{result.treatment}</Text>
              </View>
            </View>

            {/* Severity Warning */}
            {result.severity === 'high' && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={16} color="#dc2626" />
                  <Text className="text-red-800 font-semibold ml-2">High Threat Level</Text>
                </View>
                <Text className="text-red-700 text-sm">
                  This pest can cause significant crop damage. Take immediate action to control the infestation.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity 
                onPress={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="flex-1 bg-gray-100 rounded-lg p-3"
              >
                <Text className="text-gray-700 font-medium text-center">Scan Another</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-3">
                <Text className="text-white font-medium text-center">Save Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
          <Text className="text-amber-800 font-semibold mb-2">🔍 Photography Tips</Text>
          <Text className="text-amber-700 text-sm mb-1">• Get close to the pest for detail</Text>
          <Text className="text-amber-700 text-sm mb-1">• Use good lighting conditions</Text>
          <Text className="text-amber-700 text-sm mb-1">• Include size reference if possible</Text>
          <Text className="text-amber-700 text-sm">• Capture pest and damage together</Text>
        </View>

        {/* Common Pests Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <Text className="text-blue-800 font-semibold mb-2">🐛 Common Agricultural Pests</Text>
          <Text className="text-blue-700 text-sm mb-1">• Aphids - Small, soft-bodied insects</Text>
          <Text className="text-blue-700 text-sm mb-1">• Beetles - Hard-shelled insects</Text>
          <Text className="text-blue-700 text-sm mb-1">• Caterpillars - Moth/butterfly larvae</Text>
          <Text className="text-blue-700 text-sm">• Mites - Tiny spider-like pests</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PestIdentifier;
