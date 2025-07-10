import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, ArrowLeft, TestTube, Droplets, TrendingUp, Activity } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { agriculturalAITools } from '../../lib/agricultural-ai-tools';
import { convertImageToDataUri, getErrorMessage } from '../../lib/image-analysis-utils';

interface AISoilAnalyzerProps {
  onBack: () => void;
}

const AISoilAnalyzer: React.FC<AISoilAnalyzerProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Define the SoilAnalysisResult type
  interface SoilAnalysisResult {
    soilType: string;
    confidence: number;
    pH: number;
    fertility: string;
    moisture: string;
    recommendations: string[];
  }
  
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);

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
      console.log('🔍 Converting image for AI analysis...');
      const base64DataUri = await convertImageToDataUri(selectedImage);
      
      console.log('🌱 Starting soil analysis with Gemini AI...');
      const analysis = await agriculturalAITools.analyzeSoil(base64DataUri);
      setResult(analysis);
    } catch (error) {
      console.error('❌ Soil analysis failed:', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Analysis Failed', errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const getFertilityColor = (fertility: string) => {
    switch (fertility) {
      case 'excellent': return '#10b981';
      case 'good': return '#84cc16';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMoistureColor = (moisture: string) => {
    switch (moisture) {
      case 'optimal': return '#10b981';
      case 'wet': return '#06b6d4';
      case 'dry': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPHColor = (pH: number) => {
    if (pH >= 6.0 && pH <= 7.5) return '#10b981'; // Optimal
    if (pH >= 5.5 && pH < 6.0) return '#84cc16'; // Slightly acidic
    if (pH > 7.5 && pH <= 8.0) return '#84cc16'; // Slightly alkaline
    if (pH < 5.5) return '#f59e0b'; // Too acidic
    if (pH > 8.0) return '#ef4444'; // Too alkaline
    return '#6b7280';
  };

  const getPHStatus = (pH: number) => {
    if (pH >= 6.0 && pH <= 7.5) return 'Optimal';
    if (pH >= 5.5 && pH < 6.0) return 'Slightly Acidic';
    if (pH > 7.5 && pH <= 8.0) return 'Slightly Alkaline';
    if (pH < 5.5) return 'Too Acidic';
    if (pH > 8.0) return 'Too Alkaline';
    return 'Unknown';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TestTube size={24} color="#8b5cf6" className="mr-2" />
          <View>
            <Text className="text-xl font-bold text-gray-900">AI Soil Analyzer</Text>
            <Text className="text-sm text-gray-600">Analyze soil health from photos</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Image Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Take or Select Soil Photo</Text>
          
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
              <TestTube size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">No image selected</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">Take a photo of your soil</Text>
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
            className={`rounded-lg p-4 mb-6 ${analyzing ? 'bg-gray-400' : 'bg-purple-600'}`}
          >
            <Text className="text-white font-semibold text-center">
              {analyzing ? 'Analyzing Soil...' : 'Analyze Soil'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Results */}
        {result && (
          <View className="space-y-4">
            {/* Soil Type */}
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">Soil Analysis Results</Text>
              
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xl font-semibold text-gray-800">{result.soilType} Soil</Text>
                  <View className="bg-gray-100 rounded-lg px-3 py-1">
                    <Text className="text-sm text-gray-600">
                      {Math.round(result.confidence * 100)}% confidence
                    </Text>
                  </View>
                </View>
              </View>

              {/* Soil Properties */}
              <View className="space-y-4">
                {/* pH Level */}
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Activity size={20} color={getPHColor(result.pH)} />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">pH Level</Text>
                    </View>
                    <Text 
                      className="text-sm font-medium"
                      style={{ color: getPHColor(result.pH) }}
                    >
                      {getPHStatus(result.pH)}
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{result.pH}</Text>
                  <Text className="text-xs text-gray-600 mt-1">Optimal range: 6.0 - 7.5</Text>
                </View>

                {/* Fertility */}
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <TrendingUp size={20} color={getFertilityColor(result.fertility)} />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">Fertility Level</Text>
                    </View>
                    <Text 
                      className="text-sm font-medium capitalize"
                      style={{ color: getFertilityColor(result.fertility) }}
                    >
                      {result.fertility}
                    </Text>
                  </View>
                </View>

                {/* Moisture */}
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Droplets size={20} color={getMoistureColor(result.moisture)} />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">Moisture Level</Text>
                    </View>
                    <Text 
                      className="text-sm font-medium capitalize"
                      style={{ color: getMoistureColor(result.moisture) }}
                    >
                      {result.moisture}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">Recommendations</Text>
              <View className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <View key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <Text className="text-sm text-green-800">• {recommendation}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="flex-1 bg-gray-100 rounded-lg p-3"
              >
                <Text className="text-gray-700 font-medium text-center">Test Another Sample</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-3">
                <Text className="text-white font-medium text-center">Save Analysis</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-6">
          <Text className="text-purple-800 font-semibold mb-2">🔬 Soil Photography Tips</Text>
          <Text className="text-purple-700 text-sm mb-1">• Clear soil surface of debris</Text>
          <Text className="text-purple-700 text-sm mb-1">• Take photos in natural lighting</Text>
          <Text className="text-purple-700 text-sm mb-1">• Show texture and color clearly</Text>
          <Text className="text-purple-700 text-sm">• Include a small depth profile if possible</Text>
        </View>

        {/* Soil Types Info */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
          <Text className="text-amber-800 font-semibold mb-2">🌱 Common Soil Types</Text>
          <Text className="text-amber-700 text-sm mb-1">• Clay - Heavy, retains water, nutrient-rich</Text>
          <Text className="text-amber-700 text-sm mb-1">• Sandy - Light, drains quickly, lower nutrients</Text>
          <Text className="text-amber-700 text-sm mb-1">• Loam - Balanced, ideal for most crops</Text>
          <Text className="text-amber-700 text-sm">• Silt - Fine particles, moderate drainage</Text>
        </View>

        {/* pH Guide */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <Text className="text-blue-800 font-semibold mb-2">📊 pH Guide</Text>
          <Text className="text-blue-700 text-sm mb-1">• 6.0-7.0: Optimal for most vegetables</Text>
          <Text className="text-blue-700 text-sm mb-1">• 5.5-6.5: Good for blueberries, potatoes</Text>
          <Text className="text-blue-700 text-sm mb-1">• 7.0-8.0: Suitable for brassicas</Text>
          <Text className="text-blue-700 text-sm">• Add lime to raise pH, sulfur to lower pH</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AISoilAnalyzer;
