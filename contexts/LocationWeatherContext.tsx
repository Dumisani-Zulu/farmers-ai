import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, locationService } from '@/lib/location-service';

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  };
  forecast: {
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
    description: string;
  }[];
  location: LocationData;
  lastUpdated: number;
}

interface LocationWeatherContextType {
  currentLocation: LocationData | null;
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  updateLocation: (location: LocationData) => Promise<void>;
  refreshWeatherData: (forceRefresh?: boolean) => Promise<void>;
  searchLocations: (query: string) => Promise<LocationData[]>;
  getCurrentLocation: () => Promise<LocationData | null>;
  clearCache: () => Promise<void>;
}

const LocationWeatherContext = createContext<LocationWeatherContextType | undefined>(undefined);

const CACHE_KEY_LOCATION = 'cached_location_weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const LocationWeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data and initialize location service on mount
  useEffect(() => {
    const initialize = async () => {
      await locationService.initialize();
      await loadCachedData();
    };
    initialize();
  }, []);

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY_LOCATION);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        
        // Check if cache is still valid
        const now = Date.now();
        if (now - parsed.lastUpdated < CACHE_DURATION) {
          setCurrentLocation(parsed.location);
          setWeatherData(parsed.weatherData);
          console.log('Loaded cached location and weather data');
        } else {
          console.log('Cached data expired, will fetch fresh data');
        }
      }
    } catch (error) {
      console.error('Failed to load cached location/weather data:', error);
    }
  };

  const saveCachedData = async (location: LocationData, weather: WeatherData) => {
    try {
      const dataToCache = {
        location,
        weatherData: weather,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY_LOCATION, JSON.stringify(dataToCache));
      console.log('Cached location and weather data');
    } catch (error) {
      console.error('Failed to cache location/weather data:', error);
    }
  };

  const fetchWeatherData = async (location: LocationData): Promise<WeatherData> => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max` +
      `&timezone=auto&forecast_days=14`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    const getWeatherCondition = (code: number): { condition: string; description: string } => {
      const weatherCodes: { [key: number]: { condition: string; description: string } } = {
        0: { condition: 'clear', description: 'Clear sky' },
        1: { condition: 'partly-cloudy', description: 'Mainly clear' },
        2: { condition: 'partly-cloudy', description: 'Partly cloudy' },
        3: { condition: 'cloudy', description: 'Overcast' },
        45: { condition: 'fog', description: 'Fog' },
        48: { condition: 'fog', description: 'Depositing rime fog' },
        51: { condition: 'drizzle', description: 'Light drizzle' },
        53: { condition: 'drizzle', description: 'Moderate drizzle' },
        55: { condition: 'drizzle', description: 'Dense drizzle' },
        61: { condition: 'rain', description: 'Slight rain' },
        63: { condition: 'rain', description: 'Moderate rain' },
        65: { condition: 'rain', description: 'Heavy rain' },
        71: { condition: 'snow', description: 'Slight snow' },
        73: { condition: 'snow', description: 'Moderate snow' },
        75: { condition: 'snow', description: 'Heavy snow' },
        95: { condition: 'thunderstorm', description: 'Thunderstorm' },
      };
      return weatherCodes[code] || { condition: 'unknown', description: 'Unknown weather' };
    };

    const currentWeather = getWeatherCondition(current.weather_code);
    
    const forecast = daily.time.map((dateStr: string, i: number) => {
      const dayWeather = getWeatherCondition(daily.weather_code[i]);
      return {
        date: dateStr,
        temperature: {
          min: Math.round(daily.temperature_2m_min[i]),
          max: Math.round(daily.temperature_2m_max[i]),
        },
        humidity: Math.round(daily.relative_humidity_2m_mean[i]),
        precipitation: Math.round(daily.precipitation_sum[i] * 10) / 10,
        windSpeed: Math.round(daily.wind_speed_10m_max[i] * 2.237), // Convert m/s to mph
        condition: dayWeather.condition,
        description: dayWeather.description,
      };
    });

    return {
      current: {
        temperature: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        precipitation: Math.round(current.precipitation * 10) / 10,
        windSpeed: Math.round(current.wind_speed_10m * 2.237), // Convert m/s to mph
        condition: currentWeather.condition,
        description: currentWeather.description,
      },
      forecast,
      location,
      lastUpdated: Date.now(),
    };
  };

  const updateLocation = async (location: LocationData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🌍 Updating location and fetching weather data:', {
        city: location.city,
        region: location.region,
        country: location.country,
        coords: `${location.latitude}, ${location.longitude}`
      });
      
      const weather = await fetchWeatherData(location);
      
      setCurrentLocation(location);
      setWeatherData(weather);
      
      // Cache the data
      await saveCachedData(location, weather);
      
      console.log('✅ Location and weather data updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      setError(errorMessage);
      console.error('❌ Failed to update location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWeatherData = async (forceRefresh: boolean = false) => {
    if (!currentLocation) {
      console.log('No current location to refresh weather data');
      return;
    }

    // Check if we need to refresh
    if (!forceRefresh && weatherData && weatherData.lastUpdated) {
      const now = Date.now();
      if (now - weatherData.lastUpdated < CACHE_DURATION) {
        console.log('Weather data is still fresh, skipping refresh');
        return;
      }
    }

    await updateLocation(currentLocation);
  };

  const searchLocations = async (query: string): Promise<LocationData[]> => {
    try {
      return await locationService.searchLocations(query);
    } catch (err) {
      console.error('Failed to search locations:', err);
      return [];
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        await updateLocation(location);
        return location;
      }
      return null;
    } catch (err) {
      console.error('Failed to get current location:', err);
      return null;
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY_LOCATION);
      setCurrentLocation(null);
      setWeatherData(null);
      console.log('Location/weather cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const value: LocationWeatherContextType = {
    currentLocation,
    weatherData,
    isLoading,
    error,
    updateLocation,
    refreshWeatherData,
    searchLocations,
    getCurrentLocation,
    clearCache,
  };

  return (
    <LocationWeatherContext.Provider value={value}>
      {children}
    </LocationWeatherContext.Provider>
  );
};

export const useLocationWeather = (): LocationWeatherContextType => {
  const context = useContext(LocationWeatherContext);
  if (!context) {
    throw new Error('useLocationWeather must be used within a LocationWeatherProvider');
  }
  return context;
};
