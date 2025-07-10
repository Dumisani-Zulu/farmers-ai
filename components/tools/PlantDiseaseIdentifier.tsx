import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, ArrowLeft, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { agriculturalAITools } from '../../lib/agricultural-ai-tools';

interface PlantDiseaseIdentifierProps {
  onBack: () => void;
}

const PlantDiseaseIdentifier: React.FC<PlantDiseaseIdentifierProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Define the PlantDiseaseResult interface
  interface PlantDiseaseResult {
    disease: string;
    confidence: number;
    description: string;
    treatment: string;
    severity: 'low' | 'medium' | 'high';
  }
  
  const [result, setResult] = useState<PlantDiseaseResult | null>(null);

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
      console.log('🔬 Starting plant disease analysis...');
      console.log('📷 Image URI:', selectedImage);
      
      const analysis = await agriculturalAITools.identifyPlantDisease(selectedImage);
      
      console.log('✅ Analysis completed:', analysis);
      setResult(analysis);
      
      // Show success message if analysis was successful
      if (analysis.disease !== 'Analysis Error' && analysis.confidence > 0) {
        console.log('🎉 Plant disease analysis successful!');
      }
      
    } catch (error) {
      console.error('❌ Plant disease analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      Alert.alert(
        'Analysis Failed', 
        `Failed to analyze the plant disease: ${errorMessage}\n\nPlease try again with a clear, well-lit photo of plant leaves.`
      );
      
      // Set error result
      setResult({
        disease: 'Analysis Failed',
        confidence: 0,
        description: `Analysis encountered an error: ${errorMessage}. Please ensure you have a clear photo showing plant leaves or affected areas.`,
        treatment: 'Try taking a new photo with better lighting and focus on the plant leaves. If problems persist, consult with a local agricultural expert.',
        severity: 'low'
      });
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
        <View>
          <Text className="text-xl font-bold text-gray-900">Plant Disease Identifier</Text>
          <Text className="text-sm text-gray-600">Identify diseases from leaf photos</Text>
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
              <Camera size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">No image selected</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">Take a photo or select from gallery</Text>
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
          <>
            <TouchableOpacity 
              onPress={analyzeImage}
              disabled={analyzing}
              className={`rounded-lg p-4 mb-4 ${analyzing ? 'bg-gray-400' : 'bg-purple-600'}`}
            >
              <Text className="text-white font-semibold text-center">
                {analyzing ? 'Analyzing Plant Image...' : 'Analyze Plant Disease'}
              </Text>
            </TouchableOpacity>
            
            {analyzing && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <Text className="text-blue-800 text-sm text-center">
                  🔬 Processing image with AI (server-side)...
                </Text>
                <Text className="text-blue-600 text-xs text-center mt-1">
                  Using Gemini AI for expert plant disease analysis
                </Text>
                <Text className="text-blue-500 text-xs text-center mt-1">
                  Server-side processing ensures accurate, professional results
                </Text>
              </View>
            )}
          </>
        )}

        {/* Results */}
        {result && (
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Analysis Results</Text>
            
            {/* Disease Name */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-semibold text-gray-800">{result.disease}</Text>
                <View className="flex-row items-center">
                  {getSeverityIcon(result.severity)}
                  <Text 
                    className="text-sm font-medium ml-1 capitalize"
                    style={{ color: getSeverityColor(result.severity) }}
                  >
                    {result.severity} Risk
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
              <Text className="text-sm font-semibold text-gray-700 mb-2">Recommended Treatment</Text>
              <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Text className="text-sm text-green-800">{result.treatment}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity 
                onPress={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="flex-1 bg-gray-100 rounded-lg p-3"
              >
                <Text className="text-gray-700 font-medium text-center">Analyze Another</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-3">
                <Text className="text-white font-medium text-center">Save Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <Text className="text-blue-800 font-semibold mb-2">💡 AI Analysis Tips</Text>
          <Text className="text-blue-700 text-sm mb-1">• Take photos in good lighting</Text>
          <Text className="text-blue-700 text-sm mb-1">• Focus on affected leaf areas</Text>
          <Text className="text-blue-700 text-sm mb-1">• Avoid blurry or distant shots</Text>
          <Text className="text-blue-700 text-sm mb-1">• Include multiple symptoms if visible</Text>
          <Text className="text-blue-600 text-xs mt-2">
            ⚡ Powered by Gemini AI for professional-grade analysis
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlantDiseaseIdentifier;
