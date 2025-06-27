import { View, Text } from 'react-native';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Zap 
} from 'lucide-react-native';

interface WeatherCardProps {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  feelsLike: number;
}

const getWeatherIcon = (condition: string) => {
  const iconProps = { size: 64, color: '#3a9b3a' };
  
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun {...iconProps} color="#f59e0b" />;
    case 'cloudy':
    case 'partly cloudy':
      return <Cloud {...iconProps} color="#6b7280" />;
    case 'rainy':
    case 'rain':
      return <CloudRain {...iconProps} color="#3b82f6" />;
    case 'snow':
    case 'snowy':
      return <CloudSnow {...iconProps} color="#8b5cf6" />;
    case 'thunderstorm':
      return <Zap {...iconProps} color="#f59e0b" />;
    default:
      return <Sun {...iconProps} />;
  }
};

export default function WeatherCard({
  temperature,
  condition,
  humidity,
  windSpeed,
  location,
  feelsLike,
}: WeatherCardProps) {
  return (
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg border border-gray-100">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-lg font-inter-medium text-gray-600 mb-1">
            {location}
          </Text>
          <Text className="text-5xl font-inter-bold text-gray-900 mb-2">
            {temperature}°
          </Text>
          <Text className="text-lg font-inter text-gray-700 capitalize">
            {condition}
          </Text>
          <Text className="text-sm font-inter text-gray-500 mt-1">
            Feels like {feelsLike}°
          </Text>
        </View>
        <View className="items-center">
          {getWeatherIcon(condition)}
        </View>
      </View>
      
      <View className="flex-row justify-between pt-4 border-t border-gray-100">
        <View className="items-center">
          <Text className="text-sm font-inter-medium text-gray-500">
            Humidity
          </Text>
          <Text className="text-lg font-inter-bold text-gray-900">
            {humidity}%
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-sm font-inter-medium text-gray-500">
            Wind Speed
          </Text>
          <Text className="text-lg font-inter-bold text-gray-900">
            {windSpeed} mph
          </Text>
        </View>
      </View>
    </View>
  );
}