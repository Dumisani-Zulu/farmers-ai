import { View, Text, ScrollView } from 'react-native';
import { 
  Sun, 
  Cloud, 
  CloudRain,
  Droplets
} from 'lucide-react-native';

interface DailyForecastData {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
}

interface DailyForecastProps {
  data: DailyForecastData[];
}

const getWeatherIcon = (condition: string) => {
  const iconProps = { size: 24, color: '#6b7280' };
  
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
    case 'clear sky':
    case 'mainly clear':
      return <Sun {...iconProps} color="#f59e0b" />;
    case 'cloudy':
    case 'partly cloudy':
    case 'overcast':
      return <Cloud {...iconProps} />;
    case 'rainy':
    case 'rain':
    case 'slight rain':
    case 'moderate rain':
    case 'heavy rain':
    case 'light drizzle':
    case 'moderate drizzle':
    case 'dense drizzle':
      return <CloudRain {...iconProps} color="#3b82f6" />;
    default:
      return <Sun {...iconProps} />;
  }
};

export default function DailyForecast({ data }: DailyForecastProps) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-2 w-full mx-auto">
      <Text className="text-lg font-inter-bold text-gray-900 mb-4">
        14-Day Forecast
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-4">
          {data.map((item, index) => (
            <View key={index} className="items-center bg-gray-50 rounded-xl p-3 min-w-[100px]">
              <Text className="text-sm font-inter-medium text-gray-900 mb-1">
                {item.day}
              </Text>
              <Text className="text-xs font-inter text-gray-600 mb-2">
                {item.date}
              </Text>
              
              <View className="mb-2">
                {getWeatherIcon(item.condition)}
              </View>
              
              <View className="items-center mb-1">
                <Text className="text-lg font-inter-bold text-gray-900">
                  {item.high}°
                </Text>
                <Text className="text-sm font-inter text-gray-500">
                  {item.low}°
                </Text>
              </View>
              
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
