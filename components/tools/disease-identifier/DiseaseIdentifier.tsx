import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function DiseaseIdentifier() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const analyzeImage = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      Alert.alert('Analysis Complete', 'Disease identification results will be shown here');
    }, 2000);
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
        <View className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 items-center">
          <Ionicons name="image-outline" size={60} color="#9CA3AF" />
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
          selectedImage && !isAnalyzing ? 'bg-purple-500' : 'bg-gray-300'
        }`}
      >
        {isAnalyzing ? (
          <Text className="text-white font-medium">Analyzing...</Text>
        ) : (
          <>
            <Ionicons name="search-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Identify Disease</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
