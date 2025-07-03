import { View, Text, ScrollView } from 'react-native';
import { 
  Sun, 
  Cloud, 
  CloudRain,
  Droplets
} from 'lucide-react-native';

interface HourlyData {
  time: string;
  temperature: number;
  condition: string;
  precipitationChance: number;
}

interface HourlyForecastProps {
  data: HourlyData[];
}

const getWeatherIcon = (condition: string) => {
  const iconProps = { size: 24, color: '#6b7280' };
  
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun {...iconProps} color="#f59e0b" />;
    case 'cloudy':
    case 'partly cloudy':
      return <Cloud {...iconProps} />;
    case 'rainy':
    case 'rain':
      return <CloudRain {...iconProps} color="#3b82f6" />;
    default:
      return <Sun {...iconProps} />;
  }
};

export default function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-4 w-full mx-auto">
      <Text className="text-lg font-inter-bold text-gray-900 mb-4">
        24-Hour Forecast
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-4">
          {data.map((item, index) => (
            <View key={index} className="items-center bg-gray-50 rounded-xl p-3 min-w-[80px]">
              <Text className="text-sm font-inter-medium text-gray-600 mb-2">
                {item.time}
              </Text>
              
              <View className="mb-2">
                {getWeatherIcon(item.condition)}
              </View>
              
              <Text className="text-lg font-inter-bold text-gray-900 mb-1">
                {item.temperature}°
              </Text>
              
              {item.precipitationChance > 0 && (
                <View className="flex-row items-center">
                  <Droplets size={12} color="#3b82f6" />
                  <Text className="text-xs font-inter text-blue-600 ml-1">
                    {item.precipitationChance}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}