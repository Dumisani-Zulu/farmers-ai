import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calculator, 
  Camera,
  Bug,
  TestTube
} from 'lucide-react-native';
import { DiseaseIdentificationTool } from '@/tools';

type ToolScreen = 'main' | 'plant-disease' | 'pest-identifier' | 'soil-analyzer';

export default function ToolsScreen() {
  const [currentScreen, setCurrentScreen] = useState<ToolScreen>('main');

  const handleBackToMain = useCallback(() => {
    setCurrentScreen('main');
  }, []);

  const handleDiseaseIdPress = useCallback(() => {
    setCurrentScreen('plant-disease');
  }, []);

  const handlePestIdPress = useCallback(() => {
    setCurrentScreen('pest-identifier');
  }, []);

  const handleSoilAnalyzerPress = useCallback(() => {
    setCurrentScreen('soil-analyzer');
  }, []);

  // Render AI tool screens
  if (currentScreen === 'plant-disease') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackToMain} className="mb-2">
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Plant Disease Identifier</Text>
          <Text className="text-sm text-gray-600 mt-1">Coming soon</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          {/* <Text className="text-gray-500 text-center">
            AI plant disease identification tool will be available here soon.
          </Text> */}
          <DiseaseIdentificationTool />
        </View>
      </SafeAreaView>
    );
  }
  if (currentScreen === 'pest-identifier') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackToMain} className="mb-2">
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Pest Identifier</Text>
          <Text className="text-sm text-gray-600 mt-1">Coming soon</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 text-center">
            AI pest identification tool will be available here soon.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (currentScreen === 'soil-analyzer') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBackToMain} className="mb-2">
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Soil Analyzer</Text>
          <Text className="text-sm text-gray-600 mt-1">Coming soon</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-500 text-center">
            AI soil analysis tool will be available here soon.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-7 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Farm Tools</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Quick Access Tools */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" 
              style={{ width: '48%' }}
              onPress={handleDiseaseIdPress}
            >
              <Camera size={32} color="#059669" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Disease ID</Text>
              <View className="bg-green-500 px-2 py-1 rounded-full mt-1">
                <Text className="text-xs text-white font-medium">AI</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" 
              style={{ width: '48%' }}
              onPress={handlePestIdPress}
            >
              <Bug size={32} color="#ef4444" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Pest ID</Text>
              <View className="bg-red-500 px-2 py-1 rounded-full mt-1">
                <Text className="text-xs text-white font-medium">AI</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" 
              style={{ width: '48%' }}
              onPress={handleSoilAnalyzerPress}
            >
              <TestTube size={32} color="#8b5cf6" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Soil Analyzer</Text>
              <View className="bg-purple-500 px-2 py-1 rounded-full mt-1">
                <Text className="text-xs text-white font-medium">AI</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" 
              style={{ width: '48%' }}
              onPress={() => console.log('Field Calculator not implemented yet')}
            >
              <Calculator size={32} color="#10b981" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Field Calculator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
