
import React, { useState } from 'react';
import { View, Text, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import tool components
import DiseaseIdentifier from '../../components/tools/disease-identifier/DiseaseIdentifier';
import PestIdentifier from '../../components/tools/pest-identifier/PestIdentifier';
import WeedIdentifier from '../../components/tools/weed-identifier/WeedIdentifier';
import SoilAnalyzer from '../../components/tools/soil-analyzer/SoilAnalyzer';
import IrrigationCalculator from '../../components/tools/irrigation-calculator/IrrigationCalculator';
import ToolCard from '../../components/tools/ToolCard';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
  component: React.ComponentType;
}

const tools: Tool[] = [
  {
    id: 'disease-identifier',
    title: 'Disease Identifier',
    description: 'Identify plant diseases using AI image analysis',
    icon: 'medical-outline',
    color: '#8B5CF6',
    component: DiseaseIdentifier,
  },
  {
    id: 'pest-identifier',
    title: 'Pest Identifier',
    description: 'Detect and identify pests affecting your crops',
    icon: 'bug-outline',
    color: '#F59E0B',
    component: PestIdentifier,
  },
  {
    id: 'weed-identifier',
    title: 'Weed Identifier',
    description: 'Identify weeds and get management recommendations',
    icon: 'leaf-outline',
    color: '#10B981',
    component: WeedIdentifier,
  },
  {
    id: 'soil-analyzer',
    title: 'Soil Analyzer',
    description: 'Analyze soil composition and nutrient levels',
    icon: 'earth-outline',
    color: '#F97316',
    component: SoilAnalyzer,
  },
  {
    id: 'irrigation-calculator',
    title: 'Irrigation Calculator',
    description: 'Calculate optimal water requirements for crops',
    icon: 'water-outline',
    color: '#06B6D4',
    component: IrrigationCalculator,
  },
];

export default function ToolsScreen() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const openTool = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const closeTool = () => {
    setSelectedTool(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-center">Farm Tools</Text>
        <Text className="text-gray-600 text-center mt-1">
          AI-powered tools to help manage your farm
        </Text>
      </View>
      
      <ScrollView className="flex-1 px-4 py-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            color={tool.color}
            onPress={() => openTool(tool)}
          />
        ))}
      </ScrollView>

      {/* Tool Modal */}
      <Modal
        visible={selectedTool !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              {selectedTool?.title}
            </Text>
            <Text 
              className="text-blue-500 font-medium text-lg"
              onPress={closeTool}
            >
              Done
            </Text>
          </View>
          
          {selectedTool && React.createElement(selectedTool.component)}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
