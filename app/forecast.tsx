import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { ArrowLeft, MapPin, Sun, Cloud, CloudRain, Droplets } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExtendedForecastData {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
  humidity?: number;
  windSpeed?: number;
}

const getWeatherIcon = (condition: string, size: number = 32) => {
  const iconProps = { size, color: '#6b7280' };
  
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

export default function ForecastScreen() {
  const router = useRouter();
  const { weatherData, currentLocation } = useLocationWeather();
  const insets = useSafeAreaInsets();

  // Process weather data for 14-day forecast
  const get14DayForecastData = (): ExtendedForecastData[] => {
    if (!weatherData?.forecast) return [];

    // Get up to 14 days of forecast data
    return weatherData.forecast.slice(0, 14).map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return {
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayNames[date.getDay()],
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        high: Math.round(day.temperature?.max || 25),
        low: Math.round(day.temperature?.min || 18),
        condition: day.condition || 'Clear',
        precipitationChance: Math.round(day.precipitation || 0),
        humidity: day.humidity,
        windSpeed: day.windSpeed
      };
    });
  };

  const forecastData = get14DayForecastData();

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Math.max(insets.top + 40, 44),
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginRight: 8,
            borderRadius: 8,
            backgroundColor: '#f3f4f6'
          }}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#111827'
          }}>
            14-Day Forecast
          </Text>
          {currentLocation && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MapPin size={14} color="#6b7280" />
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                marginLeft: 4
              }}>
                {currentLocation.city}, {currentLocation.region}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Forecast List */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 40, 56)
        }}
      >
        {forecastData.length > 0 ? (
          forecastData.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Day and Date */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#111827'
                  }}>
                    {item.day}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#6b7280'
                  }}>
                    {item.date}
                  </Text>
                </View>

                {/* Weather Icon */}
                <View style={{
                  alignItems: 'center',
                  marginHorizontal: 16
                }}>
                  {getWeatherIcon(item.condition)}
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    marginTop: 4,
                    textAlign: 'center'
                  }}>
                    {item.condition}
                  </Text>
                </View>

                {/* Temperature */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#111827'
                  }}>
                    {item.high}°
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#6b7280'
                  }}>
                    {item.low}°
                  </Text>
                </View>
              </View>

              {/* Additional Details */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb'
              }}>
                {/* Precipitation */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Droplets size={16} color="#3b82f6" />
                  <Text style={{
                    fontSize: 14,
                    color: '#3b82f6',
                    marginLeft: 4
                  }}>
                    {item.precipitationChance}% chance of rain
                  </Text>
                </View>

                {/* Humidity and Wind (if available) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  {item.humidity && (
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      Humidity: {item.humidity}%
                    </Text>
                  )}
                  {item.windSpeed && (
                    <Text style={{
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      Wind: {item.windSpeed} km/h
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 24,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center'
            }}>
              No forecast data available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
