import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getSoilAnalysisService, SoilAnalysisResult } from '../../../ai/services/soil-analysis-service';
import SoilAnalysisResults from './SoilAnalysisResults';

export default function SoilAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<SoilAnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResults(null);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResults(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    try {
      console.log('🔍 Starting soil analysis...');
      const soilService = getSoilAnalysisService();
      const results = await soilService.analyzeImage(selectedImage);
      
      console.log('✅ Analysis completed successfully');
      setAnalysisResults(results);
      setShowResults(true);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Handle specific error types
      if (errorMessage.includes('overloaded')) {
        Alert.alert(
          'Service Busy',
          'The AI service is temporarily busy. Please try again in a moment.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('timeout')) {
        Alert.alert(
          'Analysis Timeout',
          'The analysis took too long. Please try again with a clearer image.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('API key')) {
        Alert.alert(
          'Configuration Error',
          'The AI service is not properly configured. Please check your settings.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          `Unable to analyze the soil: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Soil Analyzer</Text>
          <Text className="text-gray-600">
            Upload or take a photo of your soil for comprehensive analysis
          </Text>
        </View>

        {selectedImage ? (
          <View className="mb-6">
            <Image source={{ uri: selectedImage }} className="w-full h-64 rounded-lg" />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 items-center">
            <Ionicons name="earth-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              No soil image selected
            </Text>
          </View>
        )}

        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={pickImage}
            className="flex-1 bg-blue-500 rounded-lg p-4 items-center"
          >
            <Ionicons name="images-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            className="flex-1 bg-green-500 rounded-lg p-4 items-center"
          >
            <Ionicons name="camera-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Camera</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={analyzeImage}
          disabled={!selectedImage || isAnalyzing}
          className={`rounded-lg p-4 items-center mb-6 ${
            selectedImage && !isAnalyzing ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          {isAnalyzing ? (
            <Text className="text-white font-medium">Analyzing Soil...</Text>
          ) : (
            <>
              <Ionicons name="analytics-outline" size={24} color="white" />
              <Text className="text-white font-medium mt-1">Analyze Soil</Text>
            </>
          )}
        </TouchableOpacity>

        {analysisResults && (
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Quick Results</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Soil Type:</Text>
                <Text className="font-medium">{analysisResults.soilType}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Texture:</Text>
                <Text className="font-medium capitalize">{analysisResults.texture}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">pH Level:</Text>
                <Text className="font-medium">{analysisResults.estimatedProperties.pH.level}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Organic Matter:</Text>
                <Text className="font-medium">{analysisResults.estimatedProperties.organicMatter.level}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Drainage:</Text>
                <Text className="font-medium">{analysisResults.estimatedProperties.drainage.level}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Confidence:</Text>
                <Text className="font-medium">{analysisResults.confidence}%</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowResults(true)}
              className="bg-blue-500 rounded-lg p-3 items-center mt-4"
            >
              <Text className="text-white font-medium">View Detailed Analysis</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        {analysisResults && (
          <SoilAnalysisResults
            results={analysisResults}
            onClose={() => setShowResults(false)}
          />
        )}
      </Modal>
    </ScrollView>
  );
}
