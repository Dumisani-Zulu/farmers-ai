import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calculator, 
  Ruler, 
  Droplets, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Camera,
  Thermometer,
  Sun,
  CloudRain,
  Wrench
} from 'lucide-react-native';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'calculator' | 'planning' | 'monitoring' | 'financial';
  isNew?: boolean;
}

const tools: Tool[] = [
  {
    id: '1',
    name: 'Field Area Calculator',
    description: 'Calculate field dimensions and area for planting',
    icon: <Ruler size={24} color="#3b82f6" />,
    category: 'calculator',
  },
  {
    id: '2',
    name: 'Fertilizer Calculator',
    description: 'Determine optimal fertilizer amounts for your crops',
    icon: <Calculator size={24} color="#10b981" />,
    category: 'calculator',
  },
  {
    id: '3',
    name: 'Irrigation Planner',
    description: 'Plan and schedule irrigation for maximum efficiency',
    icon: <Droplets size={24} color="#06b6d4" />,
    category: 'planning',
  },
  {
    id: '4',
    name: 'Crop Revenue Calculator',
    description: 'Estimate potential income from your crops',
    icon: <DollarSign size={24} color="#f59e0b" />,
    category: 'financial',
  },
  {
    id: '5',
    name: 'Planting Calendar',
    description: 'Optimal planting and harvesting schedule',
    icon: <Calendar size={24} color="#8b5cf6" />,
    category: 'planning',
  },
  {
    id: '6',
    name: 'Growth Tracker',
    description: 'Monitor and track crop growth progress',
    icon: <TrendingUp size={24} color="#ec4899" />,
    category: 'monitoring',
    isNew: true,
  },
  {
    id: '7',
    name: 'Field Mapper',
    description: 'Map and organize your farming areas',
    icon: <MapPin size={24} color="#ef4444" />,
    category: 'planning',
  },
  {
    id: '8',
    name: 'Disease Identifier',
    description: 'Identify plant diseases using camera',
    icon: <Camera size={24} color="#059669" />,
    category: 'monitoring',
    isNew: true,
  },
  {
    id: '9',
    name: 'Soil Temperature Monitor',
    description: 'Track soil temperature for optimal planting',
    icon: <Thermometer size={24} color="#dc2626" />,
    category: 'monitoring',
  },
  {
    id: '10',
    name: 'Weather Impact Assessment',
    description: 'Assess weather impact on crop yield',
    icon: <CloudRain size={24} color="#6b7280" />,
    category: 'monitoring',
  },
];

const categories = [
  { id: 'all', name: 'All Tools', icon: <Wrench size={16} color="#6b7280" /> },
  { id: 'calculator', name: 'Calculators', icon: <Calculator size={16} color="#10b981" /> },
  { id: 'planning', name: 'Planning', icon: <Calendar size={16} color="#8b5cf6" /> },
  { id: 'monitoring', name: 'Monitoring', icon: <TrendingUp size={16} color="#ec4899" /> },
  { id: 'financial', name: 'Financial', icon: <DollarSign size={16} color="#f59e0b" /> },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'calculator': return '#10b981';
    case 'planning': return '#8b5cf6';
    case 'monitoring': return '#ec4899';
    case 'financial': return '#f59e0b';
    default: return '#6b7280';
  }
};

const ToolCard = ({ tool }: { tool: Tool }) => (
  <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center">
    <View className="mr-4">
      {tool.icon}
    </View>
    <View className="flex-1">
      <View className="flex-row items-center mb-1">
        <Text className="text-lg font-semibold text-gray-900">{tool.name}</Text>
        {tool.isNew && (
          <View className="bg-green-500 px-2 py-1 rounded-full ml-2">
            <Text className="text-xs text-white font-medium">NEW</Text>
          </View>
        )}
      </View>
      <Text className="text-sm text-gray-600 mb-2">{tool.description}</Text>
      <View 
        className="px-2 py-1 rounded-full self-start"
        style={{ backgroundColor: `${getCategoryColor(tool.category)}20` }}
      >
        <Text 
          className="text-xs font-medium capitalize"
          style={{ color: getCategoryColor(tool.category) }}
        >
          {tool.category}
        </Text>
      </View>
    </View>
    <View className="ml-2">
      <TouchableOpacity className="bg-gray-100 rounded-lg p-2">
        <Text className="text-xs font-medium text-gray-700">Open</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function ToolsScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Farm Tools</Text>
        <Text className="text-sm text-gray-600 mt-1">{tools.length} tools available</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Quick Access Tools */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" style={{ width: '48%' }}>
              <Calculator size={32} color="#10b981" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Field Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" style={{ width: '48%' }}>
              <Droplets size={32} color="#06b6d4" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Irrigation Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" style={{ width: '48%' }}>
              <Camera size={32} color="#059669" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Disease ID</Text>
              <View className="bg-green-500 px-2 py-1 rounded-full mt-1">
                <Text className="text-xs text-white font-medium">NEW</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" style={{ width: '48%' }}>
              <DollarSign size={32} color="#f59e0b" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Revenue Calc</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg mr-2 flex-row items-center ${
                  selectedCategory === category.id ? 'bg-green-600' : 'bg-white border border-gray-200'
                }`}
              >
                {category.icon}
                <Text className={`text-sm font-medium ml-2 ${
                  selectedCategory === category.id ? 'text-white' : 'text-gray-700'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tools List */}
        <View>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>

        {/* Add Tool Suggestion */}
        <TouchableOpacity className="bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-6 mt-4 items-center">
          <Text className="text-green-600 font-semibold mb-2">Need a specific tool?</Text>
          <Text className="text-sm text-green-600 text-center mb-3">
            Suggest a new farming tool and we'll consider adding it
          </Text>
          <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
            <Text className="text-white text-sm font-medium">Suggest Tool</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
