import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getDiseaseIdentificationService, DiseaseAnalysisResult } from '../../../ai/services/disease-identification-service';
import DiseaseAnalysisResults from './DiseaseAnalysisResults';

export default function DiseaseIdentifier() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DiseaseAnalysisResult | null>(null);
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
      console.log('🔍 Starting disease analysis...');
      const diseaseService = getDiseaseIdentificationService();
      const results = await diseaseService.analyzeImage(selectedImage);
      
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
          `Unable to analyze the image: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Disease Identifier</Text>
        <Text className="text-gray-600">
          Upload or take a photo of your crop to identify potential diseases
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
        <View className="border-2 border-dashed border-black rounded-lg p-8 mb-6 items-center">
          <Ionicons name="image-outline" size={60} color="black" />
          <Text className="text-black mt-2 text-center">
            No image selected
          </Text>
        </View>
      )}

      <View className="flex-row gap-4 mb-4 space-x-4">
        <TouchableOpacity
          onPress={pickImage}
          className="flex-1 bg-blue-500 rounded-lg p-4 items-center"
        >
          <Ionicons name="images-outline" size={24} color="white" />
          <Text className="text-white font-medium mt-1">Upload Image</Text>
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
        className={`rounded-lg px-4 py-2 items-center ${
          selectedImage && !isAnalyzing ? 'bg-purple-500' : 'bg-gray-300'
        }`}
      >
        {isAnalyzing ? (
          <View className="flex-row items-center">
            <Ionicons name="sync" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Analyzing...</Text>
          </View>
        ) : (
          <>
            <Ionicons name="search" size={20} color={selectedImage ? "white" : "gray"} />
            <Text className={`text-lg font-bold mt-1 ${selectedImage ? 'text-white' : 'text-gray-500'}`}>
              Identify Disease
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResults(false)}
      >
        {analysisResults && (
          <DiseaseAnalysisResults
            results={analysisResults}
            onClose={() => setShowResults(false)}
          />
        )}
      </Modal>
    </View>
  );
}
