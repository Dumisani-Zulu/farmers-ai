export interface ToolData {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
  category: 'calculator' | 'planning' | 'monitoring' | 'financial' | 'ai-tools';
  isNew?: boolean;
}

export const toolsData: ToolData[] = [
  {
    id: '1',
    name: 'Field Area Calculator',
    description: 'Calculate field dimensions and area for planting',
    iconName: 'Ruler',
    iconColor: '#3b82f6',
    category: 'calculator',
  },
  {
    id: '2',
    name: 'Fertilizer Calculator',
    description: 'Determine optimal fertilizer amounts for your crops',
    iconName: 'Calculator',
    iconColor: '#10b981',
    category: 'calculator',
  },
  {
    id: '3',
    name: 'Irrigation Planner',
    description: 'Plan and schedule irrigation for maximum efficiency',
    iconName: 'Droplets',
    iconColor: '#06b6d4',
    category: 'planning',
  },
  {
    id: '4',
    name: 'Crop Revenue Calculator',
    description: 'Estimate potential income from your crops',
    iconName: 'DollarSign',
    iconColor: '#f59e0b',
    category: 'financial',
  },
  {
    id: '5',
    name: 'Planting Calendar',
    description: 'Optimal planting and harvesting schedule',
    iconName: 'Calendar',
    iconColor: '#8b5cf6',
    category: 'planning',
  },
  {
    id: '6',
    name: 'Growth Tracker',
    description: 'Monitor and track crop growth progress',
    iconName: 'TrendingUp',
    iconColor: '#ec4899',
    category: 'monitoring',
    isNew: true,
  },
  {
    id: '7',
    name: 'Field Mapper',
    description: 'Map and organize your farming areas',
    iconName: 'MapPin',
    iconColor: '#ef4444',
    category: 'planning',
  },
  {
    id: '8',
    name: 'Plant Disease Identifier',
    description: 'Identify plant diseases using AI-powered photo analysis',
    iconName: 'Camera',
    iconColor: '#059669',
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '9',
    name: 'Pest Identifier', 
    description: 'Identify agricultural pests with AI image recognition',
    iconName: 'Bug',
    iconColor: '#ef4444',
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '10',
    name: 'Weed Identifier',
    description: 'Identify and manage weeds using AI technology',
    iconName: 'Zap',
    iconColor: '#10b981',
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '11',
    name: 'AI Soil Analyzer',
    description: 'Analyze soil health and get improvement recommendations',
    iconName: 'TestTube',
    iconColor: '#8b5cf6',
    category: 'ai-tools',
    isNew: true,
  },
  {
    id: '11a',
    name: 'Location Manager',
    description: 'Manage farm locations with smart caching and search',
    iconName: 'MapPin',
    iconColor: '#3b82f6',
    category: 'planning',
    isNew: true,
  },
  {
    id: '12',
    name: 'Soil Temperature Monitor',
    description: 'Track soil temperature for optimal planting',
    iconName: 'Thermometer',
    iconColor: '#dc2626',
    category: 'monitoring',
  },
  {
    id: '13',
    name: 'Weather Impact Assessment',
    description: 'Assess weather impact on crop yield',
    iconName: 'CloudRain',
    iconColor: '#6b7280',
    category: 'monitoring',
  },
];
