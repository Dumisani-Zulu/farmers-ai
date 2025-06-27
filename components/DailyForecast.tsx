import { View, Text, ScrollView } from 'react-native';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudDrizzle,
  Zap,
  Eye
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

export default function DailyForecast({ data }: DailyForecastProps) {
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun size={20} color="#f59e0b" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <CloudRain size={20} color="#3b82f6" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow size={20} color="#6b7280" />;
    } else if (conditionLower.includes('drizzle')) {
      return <CloudDrizzle size={20} color="#3b82f6" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return <Zap size={20} color="#8b5cf6" />;
    } else if (conditionLower.includes('fog')) {
      return <Eye size={20} color="#6b7280" />;
    } else {
      return <Cloud size={20} color="#6b7280" />;
    }
  };

  return (
    <View className="mx-4">
      <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <Text className="text-lg font-inter-bold text-gray-900 mb-4">
          14-Day Forecast
        </Text>
        
        <View className="space-y-3">
          {data.map((day, index) => (
            <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              {/* Day and Date */}
              <View className="flex-1">
                <Text className="text-base font-inter-bold text-gray-900">
                  {day.day}
                </Text>
                <Text className="text-sm font-inter text-gray-600">
                  {day.date}
                </Text>
              </View>
              
              {/* Weather Icon and Condition */}
              <View className="flex-1 flex-row items-center justify-center">
                {getWeatherIcon(day.condition)}
                <View className="ml-2">
                  <Text className="text-sm font-inter text-gray-700 capitalize">
                    {day.condition}
                  </Text>
                  <Text className="text-xs font-inter text-blue-600">
                    {day.precipitationChance}% rain
                  </Text>
                </View>
              </View>
              
              {/* Temperature Range */}
              <View className="flex-1 items-end">
                <View className="flex-row items-center">
                  <Text className="text-base font-inter-bold text-gray-900">
                    {day.high}°
                  </Text>
                  <Text className="text-base font-inter text-gray-500 ml-2">
                    {day.low}°
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
