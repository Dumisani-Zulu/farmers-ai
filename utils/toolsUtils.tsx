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
  Bug,
  Zap,
  TestTube
} from 'lucide-react-native';
import { ToolData } from '../data/tools';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'calculator' | 'planning' | 'monitoring' | 'financial' | 'ai-tools';
  isNew?: boolean;
}

const iconMap = {
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
  Bug,
  Zap,
  TestTube,
} as const;

export const convertToolDataToTool = (toolData: ToolData): Tool => {
  const IconComponent = iconMap[toolData.iconName as keyof typeof iconMap];
  
  return {
    ...toolData,
    icon: <IconComponent size={24} color={toolData.iconColor} />,
  };
};

export const convertToolsDataToTools = (toolsData: ToolData[]): Tool[] => {
  return toolsData.map(convertToolDataToTool);
};
