import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { agriculturalAITools } from '../lib/agricultural-ai-tools';

const TestPlantDiseaseAI: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        await agriculturalAITools.initialize();
        setIsInitialized(true);
        console.log('✅ Agricultural AI Tools initialized for testing');
      } catch (error) {
        console.error('❌ Failed to initialize Agricultural AI Tools:', error);
        Alert.alert('Initialization Error', 'Failed to initialize AI tools for testing');
      }
    };

    initializeAI();
  }, []);

  const testAllAITools = async () => {
    if (!isInitialized) {
      Alert.alert('Not Ready', 'AI tools are not initialized yet');
      return;
    }

    try {
      // Create a simple test image (1x1 pixel transparent PNG)
      const testImageUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      console.log('🧪 Testing all AI tools with Gemini AI...');
      
      // Test Plant Disease Identification
      console.log('🍃 Testing plant disease identification...');
      const diseaseResult = await agriculturalAITools.identifyPlantDisease(testImageUri);
      console.log('Disease Result:', diseaseResult);
      
      // Test Pest Identification
      console.log('🐛 Testing pest identification...');
      const pestResult = await agriculturalAITools.identifyPest(testImageUri);
      console.log('Pest Result:', pestResult);
      
      // Test Weed Identification
      console.log('🌿 Testing weed identification...');
      const weedResult = await agriculturalAITools.identifyWeed(testImageUri);
      console.log('Weed Result:', weedResult);
      
      // Test Soil Analysis
      console.log('🌱 Testing soil analysis...');
      const soilResult = await agriculturalAITools.analyzeSoil(testImageUri);
      console.log('Soil Result:', soilResult);
      
      const alertMessage = `🧪 All AI Tools Test Results:

🍃 PLANT DISEASE:
Disease: ${diseaseResult.disease}
Confidence: ${Math.round(diseaseResult.confidence * 100)}%
Severity: ${diseaseResult.severity}

🐛 PEST ANALYSIS:
Pest: ${pestResult.pest}
Confidence: ${Math.round(pestResult.confidence * 100)}%
Severity: ${pestResult.severity}

🌿 WEED ANALYSIS:
Weed: ${weedResult.weed}
Confidence: ${Math.round(weedResult.confidence * 100)}%
Invasiveness: ${weedResult.invasiveness}

🌱 SOIL ANALYSIS:
Type: ${soilResult.soilType}
pH: ${soilResult.pH}
Fertility: ${soilResult.fertility}
Moisture: ${soilResult.moisture}`;
      
      Alert.alert('🎉 AI Tools Test Complete!', alertMessage);
      
    } catch (error) {
      console.error('❌ AI tools test failed:', error);
      Alert.alert(
        'Test Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`
      );
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg m-4">
      <Text className="text-lg font-bold mb-4">🧪 AI Tools Test Suite</Text>
      
      <View className="mb-4">
        <Text className={`text-sm ${isInitialized ? 'text-green-600' : 'text-orange-600'}`}>
          Status: {isInitialized ? '✅ Ready' : '⏳ Initializing...'}
        </Text>
      </View>

      <TouchableOpacity 
        onPress={testAllAITools}
        disabled={!isInitialized}
        className={`p-3 rounded-lg ${isInitialized ? 'bg-blue-600' : 'bg-gray-400'}`}
      >
        <Text className="text-white font-semibold text-center">
          {isInitialized ? '🚀 Test All AI Tools with Gemini' : 'Initializing...'}
        </Text>
      </TouchableOpacity>

      <Text className="text-xs text-gray-500 mt-3 text-center">
        Tests: Plant Disease • Pest ID • Weed ID • Soil Analysis
      </Text>
    </View>
  );
};

export default TestPlantDiseaseAI;
