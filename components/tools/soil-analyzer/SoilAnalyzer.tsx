import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SoilAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

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

  const analyzeImage = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResults({
        soilType: 'Loamy',
        pH: 6.8,
        nitrogen: 'Medium',
        phosphorus: 'High',
        potassium: 'Low',
        organicMatter: '3.2%',
        moisture: '45%'
      });
    }, 3000);
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
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Analysis Results</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Soil Type:</Text>
                <Text className="font-medium">{analysisResults.soilType}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">pH Level:</Text>
                <Text className="font-medium">{analysisResults.pH}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Nitrogen:</Text>
                <Text className="font-medium">{analysisResults.nitrogen}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Phosphorus:</Text>
                <Text className="font-medium">{analysisResults.phosphorus}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Potassium:</Text>
                <Text className="font-medium">{analysisResults.potassium}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Organic Matter:</Text>
                <Text className="font-medium">{analysisResults.organicMatter}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Moisture:</Text>
                <Text className="font-medium">{analysisResults.moisture}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
