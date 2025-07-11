/**
 * Farming Tools Navigation Component
 * 
 * This component provides a navigation interface for all farming tools,
 * allowing users to easily discover and access different AI-powered tools.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { farmingTools, ToolKey } from './index';
import { CropPlannerTool } from './CropPlannerTool';
import { PestManagementTool } from './PestManagementTool';
import { SoilAnalysisTool } from './SoilAnalysisTool';
import { WeatherAnalysisTool } from './WeatherAnalysisTool';
import { MarketAnalysisTool } from './MarketAnalysisTool';
import { DiseaseIdentificationTool } from './DiseaseIdentificationTool';

interface ToolsNavigationProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    region?: string;
  };
  onToolResult?: (toolKey: ToolKey, result: any) => void;
}

export const ToolsNavigation: React.FC<ToolsNavigationProps> = ({
  userLocation,
  onToolResult
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolKey | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Planning', 'Health', 'Business'];

  const filteredTools = Object.entries(farmingTools).filter(([key, tool]) => 
    selectedCategory === 'All' || tool.category === selectedCategory
  );

  const renderToolCard = (toolKey: ToolKey, tool: typeof farmingTools[ToolKey]) => (
    <TouchableOpacity
      key={toolKey}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
      onPress={() => setSelectedTool(toolKey)}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-3">{tool.icon}</Text>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{tool.name}</Text>
          <Text className="text-sm text-gray-600">{tool.description}</Text>
        </View>
        <View className="px-3 py-1 bg-blue-100 rounded-full">
          <Text className="text-xs font-medium text-blue-700">{tool.category}</Text>
        </View>
      </View>
      <View className="flex-row justify-end">
        <Text className="text-sm text-blue-600 font-medium">Open Tool →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSelectedTool = () => {
    if (!selectedTool) return null;

    const handleToolResult = (result: any) => {
      onToolResult?.(selectedTool, result);
    };

    switch (selectedTool) {
      case 'cropPlanner':
        return (
          <CropPlannerTool 
            userLocation={userLocation} 
            onPlanGenerated={handleToolResult}
          />
        );
      case 'pestManagement':
        return (
          <PestManagementTool 
            userLocation={userLocation} 
            onPestIdentified={handleToolResult}
          />
        );
      case 'soilAnalysis':
        return (
          <SoilAnalysisTool 
            userLocation={userLocation} 
            onAnalysisComplete={handleToolResult}
          />
        );
      case 'weatherAnalysis':
        return (
          <WeatherAnalysisTool 
            userLocation={userLocation} 
            onAnalysisComplete={handleToolResult}
          />
        );
      case 'marketAnalysis':
        return (
          <MarketAnalysisTool 
            userLocation={{
              ...userLocation!,
              region: userLocation?.region || ''
            }} 
            onAnalysisComplete={handleToolResult}
          />
        );
      case 'diseaseIdentification':
        return (
          <DiseaseIdentificationTool 
            userLocation={userLocation} 
            onDiseaseIdentified={handleToolResult}
          />
        );
      default:
        return null;
    }
  };

  if (selectedTool) {
    return (
      <View className="flex-1">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setSelectedTool(null)}
              className="mr-3 p-2"
            >
              <Text className="text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              {farmingTools[selectedTool].name}
            </Text>
          </View>
        </View>
        {renderSelectedTool()}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Farming Tools
        </Text>
        <Text className="text-gray-600">
          AI-powered tools to help you make better farming decisions
        </Text>
      </View>

      {/* Category Filter */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`mr-3 px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? 'bg-green-600' 
                  : 'bg-gray-200'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text className={`text-sm font-medium ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tools List */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          {selectedCategory === 'All' ? 'All Tools' : `${selectedCategory} Tools`}
        </Text>
        
        {filteredTools.map(([toolKey, tool]) => 
          renderToolCard(toolKey as ToolKey, tool)
        )}

        {filteredTools.length === 0 && (
          <View className="bg-white rounded-lg p-6 items-center">
            <Text className="text-gray-500 text-center">
              No tools found in this category
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View className="bg-white mx-4 mb-4 rounded-lg p-4">
        <Text className="text-md font-semibold text-gray-800 mb-3">
          Tools Overview
        </Text>
        <View className="grid grid-cols-3 gap-4">
          {categories.slice(1).map((category) => {
            const count = Object.values(farmingTools).filter(
              tool => tool.category === category
            ).length;
            return (
              <View key={category} className="items-center">
                <Text className="text-lg font-bold text-green-600">{count}</Text>
                <Text className="text-sm text-gray-600">{category}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
