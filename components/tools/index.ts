/**
 * Farming Tools UI Components Index
 * 
 * This file exports all the UI components for the farming tools
 */

export { CropPlannerTool } from './CropPlannerTool';
export { PestManagementTool } from './PestManagementTool';
export { SoilAnalysisTool } from './SoilAnalysisTool';
export { WeatherAnalysisTool } from './WeatherAnalysisTool';
export { MarketAnalysisTool } from './MarketAnalysisTool';
export { DiseaseIdentificationTool } from './DiseaseIdentificationTool';

// Tool metadata for easy navigation and organization
export const farmingTools = {
  cropPlanner: {
    name: 'Crop Planner',
    description: 'AI-powered crop planning and rotation recommendations',
    icon: '🌱',
    component: 'CropPlannerTool',
    category: 'Planning'
  },
  pestManagement: {
    name: 'Pest Management',
    description: 'Identify pests and get treatment recommendations',
    icon: '🐛',
    component: 'PestManagementTool',
    category: 'Health'
  },
  soilAnalysis: {
    name: 'Soil Analysis',
    description: 'Analyze soil health and get fertilizer recommendations',
    icon: '🌍',
    component: 'SoilAnalysisTool',
    category: 'Health'
  },
  weatherAnalysis: {
    name: 'Weather Analysis',
    description: 'Weather-based farming insights and irrigation planning',
    icon: '🌤️',
    component: 'WeatherAnalysisTool',
    category: 'Planning'
  },
  marketAnalysis: {
    name: 'Market Analysis',
    description: 'Market insights and pricing recommendations',
    icon: '📈',
    component: 'MarketAnalysisTool',
    category: 'Business'
  },
  diseaseIdentification: {
    name: 'Disease Identification',
    description: 'AI-powered plant disease diagnosis and treatment',
    icon: '🦠',
    component: 'DiseaseIdentificationTool',
    category: 'Health'
  }
} as const;

export type ToolKey = keyof typeof farmingTools;
