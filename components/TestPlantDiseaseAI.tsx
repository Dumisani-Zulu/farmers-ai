import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { agriculturalAITools } from '../lib/agricultural-ai-tools';

const TestPlantDiseaseAI: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        await agriculturalAITools.initialize();
        setIsInitialized(true);
        updateMemoryInfo();
        console.log('✅ Agricultural AI Tools initialized for testing');
      } catch (error) {
        console.error('❌ Failed to initialize Agricultural AI Tools:', error);
        Alert.alert('Initialization Error', 'Failed to initialize AI tools for testing');
      }
    };

    initializeAI();
  }, []);

  const updateMemoryInfo = () => {
    const info = agriculturalAITools.getMemoryInfo();
    setMemoryInfo(info);
  };

  const testWithMockImage = async () => {
    if (!isInitialized) {
      Alert.alert('Not Ready', 'AI tools are not initialized yet');
      return;
    }

    try {
      // Create a simple test image URL (this simulates a disease scenario)
      const testImageUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      console.log('🧪 Testing plant disease identification...');
      console.log('📷 Using test image URI:', testImageUri);
      
      const result = await agriculturalAITools.identifyPlantDisease(testImageUri);
      
      console.log('🔬 Test Result:', result);
      
      const alertMessage = `Disease: ${result.disease}\nConfidence: ${Math.round(result.confidence * 100)}%\nSeverity: ${result.severity}\n\nDescription: ${result.description}\n\nTreatment: ${result.treatment}`;
      
      Alert.alert(
        'Plant Disease Analysis Result',
        alertMessage,
        [
          { text: 'View Console', onPress: () => console.log('Full result:', result) },
          { text: 'OK' }
        ]
      );
      
      updateMemoryInfo();
    } catch (error) {
      console.error('❌ Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Test Failed', `Error during analysis: ${errorMessage}\n\nCheck the console for more details.`);
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg m-4">
      <Text className="text-lg font-bold mb-4">Plant Disease AI Test</Text>
      
      <View className="mb-4">
        <Text className={`text-sm ${isInitialized ? 'text-green-600' : 'text-orange-600'}`}>
          Status: {isInitialized ? '✅ Ready' : '⏳ Initializing...'}
        </Text>
      </View>

      {memoryInfo && (
        <View className="mb-4">
          <Text className="text-sm text-gray-600">
            Memory: {memoryInfo.numTensors} tensors, {Math.round(memoryInfo.numBytes / 1024)} KB
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={testWithMockImage}
        disabled={!isInitialized}
        className={`rounded-lg p-3 ${isInitialized ? 'bg-blue-600' : 'bg-gray-400'}`}
      >
        <Text className="text-white font-medium text-center">
          Test Disease Identification
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestPlantDiseaseAI;
