import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import WeatherCard from '@/components/WeatherCard';
import HourlyForecast from '@/components/HourlyForecast';
import DailyForecast from '@/components/DailyForecast';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { 
  MapPin, 
  Thermometer, 
  Eye,
  Wind,
  RefreshCw
} from 'lucide-react-native';

export default function CurrentWeather() {
  const [refreshing, setRefreshing] = useState(false);
  
  // Use the global location/weather context
  const { 
    currentLocation, 
    weatherData, 
    isLoading,
    error,
    getCurrentLocation,
    refreshWeatherData
  } = useLocationWeather();
  
  // Initialize location and weather data on component mount
  useEffect(() => {
    const initializeLocationAndWeather = async () => {
      try {
        console.log('Initializing location and weather data...');
        
        // If no location is cached, get current location
        if (!currentLocation) {
          console.log('No cached location found, requesting current location...');
          const location = await getCurrentLocation();
          
          if (location) {
            console.log('Location detected:', location.city, location.region);
            // Weather data will be automatically fetched by the context
          }
        } else {
          console.log('Using cached location:', currentLocation.city, currentLocation.region);
          
          // If we have a location but no recent weather data, refresh it
          if (!weatherData) {
            console.log('Refreshing weather data for cached location...');
            await refreshWeatherData();
          }
        }
      } catch (error) {
        console.error('Failed to initialize location and weather:', error);
      }
    };

    initializeLocationAndWeather();
  }, [currentLocation, weatherData, getCurrentLocation, refreshWeatherData]);

  // Additional effect to handle location changes
  useEffect(() => {
    if (currentLocation && !weatherData) {
      console.log('Location available but no weather data, fetching...');
      refreshWeatherData();
    }
  }, [currentLocation, weatherData, refreshWeatherData]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWeatherData(true);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get display data from context or show loading/error state
  const getDisplayData = () => {
    if (error) {
      return {
        temperature: 0,
        condition: 'Error loading weather',
        humidity: 0,
        windSpeed: 0,
        location: 'Location unavailable',
        feelsLike: 0,
      };
    }

    if (!weatherData || !currentLocation) {
      return {
        temperature: 0,
        condition: 'Loading...',
        humidity: 0,
        windSpeed: 0,
        location: isLoading ? 'Getting location...' : 'No location selected',
        feelsLike: 0,
      };
    }

    return {
      temperature: weatherData.current.temperature,
      condition: weatherData.current.description,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      location: `${currentLocation.city || 'Unknown'}${currentLocation.region ? ', ' + currentLocation.region : ''}`,
      feelsLike: weatherData.current.temperature, // Could add feels like calculation
    };
  };

  const displayData = getDisplayData();

  // Convert weather data to component format
  const getHourlyData = () => {
    if (!weatherData?.forecast) return [];
    
    // For now, use daily data to simulate hourly (you could enhance this with real hourly data)
    return weatherData.forecast.slice(0, 8).map((day, index) => ({
      time: index === 0 ? 'Now' : `${new Date(day.date).getDate()}/${new Date(day.date).getMonth() + 1}`,
      temperature: day.temperature.max,
      condition: day.condition,
      precipitationChance: Math.round(day.precipitation * 10), // Convert to percentage
    }));
  };

  const getDailyData = () => {
    if (!weatherData?.forecast) return [];
    
    return weatherData.forecast.slice(0, 7).map((day, index) => {
      const date = new Date(day.date);
      const dayName = index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        day: dayName,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        high: day.temperature.max,
        low: day.temperature.min,
        condition: day.condition,
        precipitationChance: Math.round(day.precipitation * 10),
      };
    });
  };

  const hourlyData = getHourlyData();
  const dailyData = getDailyData();

  const additionalMetrics = [
    { icon: <Eye size={20} color="#6b7280" />, label: 'Visibility', value: '10 mi' },
    { icon: <Thermometer size={20} color="#6b7280" />, label: 'UV Index', value: '6 High' },
    { icon: <Wind size={20} color="#6b7280" />, label: 'Pressure', value: '30.15 in' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MapPin size={16} color="#6b7280" />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280', marginLeft: 4 }}>
              Current Location
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#111827' }}>
            Farmers Weather
          </Text>
        </View>

        {/* Current Location Display */}
        <View style={{
          backgroundColor: '#ffffff',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MapPin size={20} color="#3a9b3a" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                color: '#111827',
                fontWeight: '600'
              }}>
                {currentLocation ? 
                  `${currentLocation.city || 'Unknown'}${currentLocation.region ? ', ' + currentLocation.region : ''}` :
                  isLoading ? 'Detecting location...' : 'Location not detected'
                }
              </Text>
              {currentLocation && (
                <Text style={{ 
                  fontSize: 12, 
                  color: '#6b7280',
                  marginTop: 2
                }}>
                  Tap refresh to update weather data
                </Text>
              )}
            </View>
          </View>
          
          {/* Refresh Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#3b82f6',
              padding: 8,
              borderRadius: 8,
              marginLeft: 12,
            }}
            onPress={() => refreshWeatherData(true)}
            disabled={isLoading}
          >
            <RefreshCw size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Current Location Button - Show when no location or when there's an error */}
        {(!currentLocation || error) && (
          <TouchableOpacity
            style={{
              backgroundColor: error ? '#dc2626' : '#3b82f6',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => getCurrentLocation()}
            disabled={isLoading}
          >
            <MapPin size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={{ 
              color: 'white', 
              fontWeight: '500', 
              fontSize: 16 
            }}>
              {isLoading ? 'Getting Location...' : 
               error ? 'Retry Location Detection' : 
               'Detect Current Location'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Error Display */}
        {error && (
          <View style={{
            backgroundColor: '#fef2f2',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#ef4444',
          }}>
            <Text style={{ color: '#dc2626', fontWeight: '600' }}>Error</Text>
            <Text style={{ color: '#dc2626', marginTop: 4 }}>{error}</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#dc2626',
                padding: 8,
                borderRadius: 6,
                alignSelf: 'flex-start',
                marginTop: 8,
              }}
              onPress={() => getCurrentLocation()}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Weather Card */}
        <WeatherCard
          temperature={displayData.temperature}
          condition={displayData.condition}
          humidity={displayData.humidity}
          windSpeed={displayData.windSpeed}
          location={displayData.location}
          feelsLike={displayData.feelsLike}
        />

        {/* Hourly Forecast */}
        {hourlyData.length > 0 && (
          <HourlyForecast data={hourlyData} />
        )}

        {/* Daily Forecast */}
        {dailyData.length > 0 && (
          <DailyForecast data={dailyData} />
        )}

        {/* Additional Metrics */}
        {weatherData && (
          <View style={{
            backgroundColor: '#ffffff',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: 16 
            }}>
              Additional Details
            </Text>
            
            {additionalMetrics.map((metric, index) => (
              <View key={index} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                paddingVertical: 8 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {metric.icon}
                  <Text style={{ 
                    fontSize: 16, 
                    color: '#374151', 
                    marginLeft: 12 
                  }}>
                    {metric.label}
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: '#111827' 
                }}>
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}