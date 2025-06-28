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
  CloudRain,
  Wrench,
  Bug,
  Zap,
  TestTube
} from 'lucide-react-native';
import PlantDiseaseIdentifier from '../../components/PlantDiseaseIdentifier';
import PestIdentifier from '../../components/PestIdentifier';
import WeedIdentifier from '../../components/WeedIdentifier';
import AISoilAnalyzer from '../../components/AISoilAnalyzer';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'calculator' | 'planning' | 'monitoring' | 'financial' | 'ai-tools';
  isNew?: boolean;
}

type ToolScreen = 'main' | 'plant-disease' | 'pest-identifier' | 'weed-identifier' | 'soil-analyzer';

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
    name: 'Plant Disease Identifier',
    description: 'Identify plant diseases using AI-powered photo analysis',
    icon: <Camera size={24} color="#059669" />,
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '9',
    name: 'Pest Identifier', 
    description: 'Identify agricultural pests with AI image recognition',
    icon: <Bug size={24} color="#ef4444" />,
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '10',
    name: 'Weed Identifier',
    description: 'Identify and manage weeds using AI technology',
    icon: <Zap size={24} color="#10b981" />,
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '11',
    name: 'AI Soil Analyzer',
    description: 'Analyze soil health and get improvement recommendations',
    icon: <TestTube size={24} color="#8b5cf6" />,
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '12',
    name: 'Soil Temperature Monitor',
    description: 'Track soil temperature for optimal planting',
    icon: <Thermometer size={24} color="#dc2626" />,
    category: 'monitoring',
  },
  {
    id: '13',
    name: 'Weather Impact Assessment',
    description: 'Assess weather impact on crop yield',
    icon: <CloudRain size={24} color="#6b7280" />,
    category: 'monitoring',
  },
];

const categories = [
  { id: 'all', name: 'All Tools', icon: <Wrench size={16} color="#6b7280" /> },
  { id: 'ai-tools', name: 'AI Tools', icon: <TestTube size={16} color="#8b5cf6" /> },
  { id: 'calculator', name: 'Calculators', icon: <Calculator size={16} color="#10b981" /> },
  { id: 'planning', name: 'Planning', icon: <Calendar size={16} color="#8b5cf6" /> },
  { id: 'monitoring', name: 'Monitoring', icon: <TrendingUp size={16} color="#ec4899" /> },
  { id: 'financial', name: 'Financial', icon: <DollarSign size={16} color="#f59e0b" /> },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'ai-tools': return '#8b5cf6';
    case 'calculator': return '#10b981';
    case 'planning': return '#8b5cf6';
    case 'monitoring': return '#ec4899';
    case 'financial': return '#f59e0b';
    default: return '#6b7280';
  }
};

const ToolCard = ({ tool, onPress }: { tool: Tool; onPress: (toolId: string) => void }) => (
  <TouchableOpacity 
    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
    onPress={() => onPress(tool.id)}
  >
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
      <View className="bg-gray-100 rounded-lg p-2">
        <Text className="text-xs font-medium text-gray-700">Open</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ToolsScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [currentScreen, setCurrentScreen] = React.useState<ToolScreen>('main');

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleToolPress = (toolId: string) => {
    switch (toolId) {
      case '8': // Plant Disease Identifier
        setCurrentScreen('plant-disease');
        break;
      case '9': // Pest Identifier
        setCurrentScreen('pest-identifier');
        break;
      case '10': // Weed Identifier
        setCurrentScreen('weed-identifier');
        break;
      case '11': // AI Soil Analyzer
        setCurrentScreen('soil-analyzer');
        break;
      default:
        // Handle other tools or show coming soon message
        break;
    }
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  // Render AI tool screens
  if (currentScreen === 'plant-disease') {
    return <PlantDiseaseIdentifier onBack={handleBackToMain} />;
  }
  if (currentScreen === 'pest-identifier') {
    return <PestIdentifier onBack={handleBackToMain} />;
  }
  if (currentScreen === 'weed-identifier') {
    return <WeedIdentifier onBack={handleBackToMain} />;
  }
  if (currentScreen === 'soil-analyzer') {
    return <AISoilAnalyzer onBack={handleBackToMain} />;
  }

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
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" 
              style={{ width: '48%' }}
              onPress={() => handleToolPress('8')}
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
              onPress={() => handleToolPress('9')}
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
              onPress={() => handleToolPress('11')}
            >
              <TestTube size={32} color="#8b5cf6" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Soil Analyzer</Text>
              <View className="bg-purple-500 px-2 py-1 rounded-full mt-1">
                <Text className="text-xs text-white font-medium">AI</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 shadow-sm items-center" style={{ width: '48%' }}>
              <Calculator size={32} color="#10b981" />
              <Text className="text-sm font-medium text-gray-900 mt-2 text-center">Field Calculator</Text>
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
            <ToolCard key={tool.id} tool={tool} onPress={handleToolPress} />
          ))}
        </View>

        {/* Add Tool Suggestion */}
        <TouchableOpacity className="bg-green-50 border-2 border-dashed border-green-300 rounded-xl p-6 mt-4 items-center">
          <Text className="text-green-600 font-semibold mb-2">Need a specific tool?</Text>
          <Text className="text-sm text-green-600 text-center mb-3">
            Suggest a new farming tool and we&apos;ll consider adding it
          </Text>
          <TouchableOpacity className="bg-green-600 px-4 py-2 rounded-lg">
            <Text className="text-white text-sm font-medium">Suggest Tool</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
