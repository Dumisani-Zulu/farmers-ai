import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getWeedIdentificationService, WeedAnalysisResult } from '../../../ai/services/weed-identification-service';
import WeedAnalysisResults from './WeedAnalysisResults';

export default function WeedIdentifier() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<WeedAnalysisResult | null>(null);
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
      const weedService = getWeedIdentificationService();
      const results = await weedService.analyzeImage(selectedImage);
      setAnalysisResults(results);
      setShowResults(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (errorMessage.includes('overloaded')) {
        Alert.alert('Service Busy', 'The AI service is temporarily busy. Please try again in a moment.');
      } else if (errorMessage.includes('timeout')) {
        Alert.alert('Analysis Timeout', 'The analysis took too long. Please try again with a clearer image.');
      } else if (errorMessage.includes('API key')) {
        Alert.alert('Configuration Error', 'The AI service is not properly configured. Please check your settings.');
      } else {
        Alert.alert('Analysis Failed', `Unable to analyze the image: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Weed Identifier</Text>
        <Text className="text-gray-600">
          Upload or take a photo to identify weeds in your field
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
          <Ionicons name="leaf-outline" size={60} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2 text-center">
            No image selected
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
        className={`rounded-lg p-4 items-center ${
          selectedImage && !isAnalyzing ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        {isAnalyzing ? (
          <Text className="text-white font-medium">Analyzing...</Text>
        ) : (
          <>
            <Ionicons name="search-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Identify Weed</Text>
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
          <WeedAnalysisResults results={analysisResults} onClose={() => setShowResults(false)} />
        )}
      </Modal>

    </View>
  );
}
