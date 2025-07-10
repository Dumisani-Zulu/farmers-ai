import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, ArrowLeft, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { agriculturalAITools } from '../../lib/agricultural-ai-tools';

interface WeedIdentifierProps {
  onBack: () => void;
}

const WeedIdentifier: React.FC<WeedIdentifierProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Define the WeedResult interface
  interface WeedResult {
    weed: string;
    invasiveness: string;
    confidence: number;
    description: string;
    treatment: string;
  }
  
  const [result, setResult] = useState<WeedResult | null>(null);

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
      const analysis = await agriculturalAITools.identifyWeed(selectedImage);
      setResult(analysis);
    } catch {
      Alert.alert('Analysis Failed', 'Failed to identify the weed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getInvasivenessColor = (invasiveness: string) => {
    switch (invasiveness) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getInvasivenessIcon = (invasiveness: string) => {
    switch (invasiveness) {
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
          <Zap size={24} color="#10b981" className="mr-2" />
          <View>
            <Text className="text-xl font-bold text-gray-900">Weed Identifier</Text>
            <Text className="text-sm text-gray-600">Identify agricultural weeds</Text>
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
              <Zap size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">No image selected</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">Take a photo of the weed</Text>
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
            className={`rounded-lg p-4 mb-6 ${analyzing ? 'bg-gray-400' : 'bg-green-600'}`}
          >
            <Text className="text-white font-semibold text-center">
              {analyzing ? 'Identifying Weed...' : 'Identify Weed'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Results */}
        {result && (
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Weed Identification</Text>
            
            {/* Weed Name */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-semibold text-gray-800">{result.weed}</Text>
                <View className="flex-row items-center">
                  {getInvasivenessIcon(result.invasiveness)}
                  <Text 
                    className="text-sm font-medium ml-1 capitalize"
                    style={{ color: getInvasivenessColor(result.invasiveness) }}
                  >
                    {result.invasiveness} Invasive
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
              <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Text className="text-sm text-green-800">{result.treatment}</Text>
              </View>
            </View>

            {/* Invasiveness Warning */}
            {result.invasiveness === 'high' && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={16} color="#dc2626" />
                  <Text className="text-red-800 font-semibold ml-2">Highly Invasive Weed</Text>
                </View>
                <Text className="text-red-700 text-sm">
                  This weed spreads rapidly and can severely impact crop yields. Immediate control measures are recommended.
                </Text>
              </View>
            )}

            {/* Beneficial Note */}
            {result.weed.toLowerCase().includes('clover') && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-center mb-2">
                  <Info size={16} color="#2563eb" />
                  <Text className="text-blue-800 font-semibold ml-2">Beneficial Plant</Text>
                </View>
                <Text className="text-blue-700 text-sm">
                  This plant may provide nitrogen fixation benefits to your soil. Consider selective management.
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
        <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
          <Text className="text-green-800 font-semibold mb-2">🌿 Photography Tips</Text>
          <Text className="text-green-700 text-sm mb-1">• Capture the whole plant if possible</Text>
          <Text className="text-green-700 text-sm mb-1">• Include leaves, flowers, and stem</Text>
          <Text className="text-green-700 text-sm mb-1">• Take photos in natural lighting</Text>
          <Text className="text-green-700 text-sm">• Show the plant&apos;s growth pattern</Text>
        </View>

        {/* Weed Management Info */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <Text className="text-yellow-800 font-semibold mb-2">⚡ Weed Management Strategy</Text>
          <Text className="text-yellow-700 text-sm mb-1">• Early identification prevents spread</Text>
          <Text className="text-yellow-700 text-sm mb-1">• Mechanical removal for small infestations</Text>
          <Text className="text-yellow-700 text-sm mb-1">• Herbicide application for large areas</Text>
          <Text className="text-yellow-700 text-sm">• Prevention through crop rotation</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeedIdentifier;
