import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import WeatherCard from '@/components/WeatherCard';
import HourlyForecast from '@/components/HourlyForecast';
import DailyForecast from '@/components/DailyForecast';
import { fetchWeatherApi } from 'openmeteo';
import { 
  MapPin, 
  Thermometer, 
  Eye,
  Wind,
  Search
} from 'lucide-react-native';

export default function CurrentWeather() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true); // Start with loading true
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    location: 'Getting location...',
    feelsLike: 75,
  });
  const [hourlyData, setHourlyData] = useState([
    { time: 'Now', temperature: 72, condition: 'partly cloudy', precipitationChance: 0 },
    { time: '1PM', temperature: 75, condition: 'sunny', precipitationChance: 0 },
    { time: '2PM', temperature: 77, condition: 'sunny', precipitationChance: 5 },
    { time: '3PM', temperature: 79, condition: 'partly cloudy', precipitationChance: 10 },
    { time: '4PM', temperature: 78, condition: 'cloudy', precipitationChance: 15 },
    { time: '5PM', temperature: 76, condition: 'rainy', precipitationChance: 45 },
    { time: '6PM', temperature: 74, condition: 'rainy', precipitationChance: 60 },
    { time: '7PM', temperature: 71, condition: 'cloudy', precipitationChance: 25 },
  ]);
  const [dailyData, setDailyData] = useState([
    { day: 'Today', date: 'Jun 28', high: 79, low: 65, condition: 'partly cloudy', precipitationChance: 20 },
    { day: 'Tomorrow', date: 'Jun 29', high: 82, low: 68, condition: 'sunny', precipitationChance: 5 },
    { day: 'Mon', date: 'Jun 30', high: 75, low: 62, condition: 'rainy', precipitationChance: 70 },
    { day: 'Tue', date: 'Jul 1', high: 73, low: 59, condition: 'cloudy', precipitationChance: 30 },
    { day: 'Wed', date: 'Jul 2', high: 78, low: 64, condition: 'sunny', precipitationChance: 10 },
    { day: 'Thu', date: 'Jul 3', high: 81, low: 67, condition: 'partly cloudy', precipitationChance: 15 },
    { day: 'Fri', date: 'Jul 4', high: 84, low: 70, condition: 'sunny', precipitationChance: 0 },
  ]);
  // Remove the duplicate loading state declaration since it's now defined above

  // Function to get user's current location
  const getCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to get weather for your current location. You can still search for locations manually.',
          [{ text: 'OK' }]
        );
        // Set a default location and stop loading
        setCurrentWeather(prev => ({ ...prev, location: 'Madison County, IA' }));
        setLoading(false);
        return;
      }

      setLocationPermissionGranted(true);
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get location name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationName = `${address.city || address.district || 'Unknown City'}${address.region ? ', ' + address.region : ''}${address.country ? ', ' + address.country : ''}`;
        
        // Fetch weather data for current location
        await fetchWeatherData(latitude, longitude, locationName);
      } else {
        // Fallback if reverse geocoding fails
        await fetchWeatherData(latitude, longitude, `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationPermissionGranted(false);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. You can search for locations manually.',
        [{ text: 'OK' }]
      );
      // Set a default location and stop loading
      setCurrentWeather(prev => ({ ...prev, location: 'Madison County, IA' }));
      setLoading(false);
    }
  };

  // Function to get coordinates from location name using a free geocoding service
  const getCoordinates = async (locationName: string) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name,
          country: result.country,
          admin1: result.admin1
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Function to fetch weather data from OpenMeteo API
  const fetchWeatherData = async (latitude: number, longitude: number, locationName: string) => {
    try {
      setLoading(true);
      
      const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
        latitude: latitude,
        longitude: longitude,
        current: ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "weather_code", "wind_speed_10m"],
        hourly: ["temperature_2m", "precipitation_probability", "weather_code"],
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
        timezone: "auto",
        forecast_days: 14
      });

      const response = responses[0];
      const current = response.current()!;
      const hourly = response.hourly()!;
      const daily = response.daily()!;

      // Get weather condition from weather code
      const getWeatherCondition = (code: number) => {
        const weatherCodes: { [key: number]: string } = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Fog',
          48: 'Depositing rime fog',
          51: 'Light drizzle',
          53: 'Moderate drizzle',
          55: 'Dense drizzle',
          61: 'Slight rain',
          63: 'Moderate rain',
          65: 'Heavy rain',
          71: 'Slight snow',
          73: 'Moderate snow',
          75: 'Heavy snow',
          95: 'Thunderstorm',
        };
        return weatherCodes[code] || 'Unknown';
      };

      // Update current weather
      const newCurrentWeather = {
        temperature: Math.round(current.variables(0)!.value()),
        condition: getWeatherCondition(current.variables(3)!.value()),
        humidity: Math.round(current.variables(1)!.value()),
        windSpeed: Math.round(current.variables(4)!.value() * 2.237), // Convert m/s to mph
        location: locationName,
        feelsLike: Math.round(current.variables(2)!.value()),
      };

      // Update hourly data (next 8 hours)
      const now = new Date();
      const newHourlyData = [];
      
      for (let i = 0; i < 8; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hourIndex = i;
        
        if (hourIndex < hourly.variables(0)!.valuesArray()!.length) {
          const temp = Math.round(hourly.variables(0)!.valuesArray()![hourIndex]);
          const precipChance = Math.round(hourly.variables(1)!.valuesArray()![hourIndex]);
          const weatherCode = hourly.variables(2)!.valuesArray()![hourIndex];
          
          newHourlyData.push({
            time: i === 0 ? 'Now' : time.toLocaleTimeString('en-US', { 
              hour: 'numeric',
              hour12: true 
            }),
            temperature: temp,
            condition: getWeatherCondition(weatherCode).toLowerCase(),
            precipitationChance: precipChance
          });
        }
      }

      // Update daily data (14 days)
      const newDailyData = [];
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        
        if (i < daily.variables(1)!.valuesArray()!.length) {
          const maxTemp = Math.round(daily.variables(1)!.valuesArray()![i]);
          const minTemp = Math.round(daily.variables(2)!.valuesArray()![i]);
          const precipChance = Math.round(daily.variables(3)!.valuesArray()![i]);
          const weatherCode = daily.variables(0)!.valuesArray()![i];
          
          let dayLabel;
          if (i === 0) {
            dayLabel = 'Today';
          } else if (i === 1) {
            dayLabel = 'Tomorrow';
          } else {
            dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          }
          
          newDailyData.push({
            day: dayLabel,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            high: maxTemp,
            low: minTemp,
            condition: getWeatherCondition(weatherCode).toLowerCase(),
            precipitationChance: precipChance
          });
        }
      }

      setCurrentWeather(newCurrentWeather);
      setHourlyData(newHourlyData);
      setDailyData(newDailyData);
      
    } catch (error) {
      console.error('Weather API error:', error);
      Alert.alert('Error', 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    const coordinates = await getCoordinates(searchQuery.trim());
    if (coordinates) {
      const fullLocationName = `${coordinates.name}${coordinates.admin1 ? ', ' + coordinates.admin1 : ''}, ${coordinates.country}`;
      await fetchWeatherData(coordinates.latitude, coordinates.longitude, fullLocationName);
      setLocationPermissionGranted(false); // Mark as searched location, not current location
      setSearchQuery(''); // Clear search after successful search
    } else {
      Alert.alert('Error', 'Location not found. Please try a different search term.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (locationPermissionGranted) {
      // Re-fetch current location data
      await getCurrentLocation();
    } else if (currentWeather.location !== 'Madison County, IA' && currentWeather.location !== 'Getting location...') {
      // Re-fetch searched location data
      const coordinates = await getCoordinates(currentWeather.location);
      if (coordinates) {
        await fetchWeatherData(coordinates.latitude, coordinates.longitude, currentWeather.location);
      }
    }
    setRefreshing(false);
  };

  // useEffect to get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const additionalMetrics = [
    { icon: <Eye size={20} color="#6b7280" />, label: 'Visibility', value: '10 mi' },
    { icon: <Thermometer size={20} color="#6b7280" />, label: 'UV Index', value: '6 High' },
    { icon: <Wind size={20} color="#6b7280" />, label: 'Pressure', value: '30.15 in' },
  ];

  return (
    <View className="flex-1 bg-gradient-to-b from-sky-100 to-green-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header */}
        <View className="pb-6 px-4 mt-3">
          <View className="flex-row items-center justify-center mb-2">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-sm font-inter-medium text-gray-600 ml-1">
              {locationPermissionGranted ? 'Current Location' : 'Location'}
            </Text>
          </View>
          <Text className="text-2xl font-inter-bold text-center text-gray-900 mb-4">
            Farmers Rain Planner
          </Text>
          
          {/* Search Bar */}
          <View className="bg-white rounded-xl shadow-sm border border-gray-200 flex-row items-center px-4 py-3 mb-2">
            <Search size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base font-inter text-gray-900"
              placeholder="Search for a location..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleSearch}
              disabled={loading}
              className="ml-2 bg-green-600 rounded-lg px-4 py-2"
            >
              <Text className="text-white font-inter-medium text-sm">
                {loading ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Current Location Button - Only show if not already using current location */}
          {!locationPermissionGranted && (
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={loading}
              className="bg-blue-600 rounded-xl px-4 py-3 flex-row items-center justify-center"
            >
              <MapPin size={16} color="white" />
              <Text className="text-white font-inter-medium text-sm ml-2">
                {loading ? 'Getting Location...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Current Weather Card */}
        {loading ? (
          <View className="mx-4 mb-6">
            <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <View className="items-center">
                <Text className="text-lg font-inter-medium text-gray-600 mb-2">
                  Getting your location...
                </Text>
                <Text className="text-sm font-inter text-gray-500 text-center">
                  Please allow location access to get weather for your current location
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <WeatherCard {...currentWeather} />
        )}

        {/* Hourly Forecast */}
        <View className="mt-6">
          <HourlyForecast data={hourlyData} />
        </View>

        {/* Daily Forecast */}
        <View className="mt-6">
          <DailyForecast data={dailyData} />
        </View>

        {/* Additional Metrics */}
        <View className="mt-6 mx-4 mb-6">
          <View className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <Text className="text-lg font-inter-bold text-gray-900 mb-4">
              Additional Details
            </Text>
            
            <View className="space-y-4">
              {additionalMetrics.map((metric, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    {metric.icon}
                    <Text className="text-base font-inter text-gray-700 ml-3">
                      {metric.label}
                    </Text>
                  </View>
                  <Text className="text-base font-inter-bold text-gray-900">
                    {metric.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}