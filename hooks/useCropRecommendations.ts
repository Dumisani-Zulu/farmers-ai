import { useState, useCallback } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import * as Location from 'expo-location';
import { geminiAI } from '@/lib/gemini-ai';

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  };
  forecast: {
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    precipitation: number;
    condition: string;
  }[];
}

export interface CropRecommendation {
  id: string;
  name: string;
  variety: string;
  suitabilityScore: number;
  plantingWindow: string;
  expectedHarvest: string;
  reasons: string[];
  warnings?: string[];
  plantingTips: string[];
  image?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

interface UseCropRecommendationsReturn {
  recommendations: CropRecommendation[];
  weatherData: WeatherData | null;
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  fetchRecommendations: (location?: LocationData) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
}

export const useCropRecommendations = (): UseCropRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationResult.coords;
      
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationName = `${address.city || address.district || 'Unknown City'}${address.region ? ', ' + address.region : ''}${address.country ? ', ' + address.country : ''}`;
        
        return {
          latitude,
          longitude,
          name: locationName,
        };
      } else {
        return {
          latitude,
          longitude,
          name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
        };
      }
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

  const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
        latitude: lat,
        longitude: lon,
        current: ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "weather_code"],
        daily: ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_sum", "relative_humidity_2m_mean"],
        timezone: "auto",
        forecast_days: 14
      });

      const response = responses[0];
      const current = response.current()!;
      const daily = response.daily()!;

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

      // Build forecast array
      const forecast = [];
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        
        if (i < daily.variables(1)!.valuesArray()!.length) {
          const maxTemp = daily.variables(1)!.valuesArray()![i];
          const minTemp = daily.variables(2)!.valuesArray()![i];
          const precipitation = daily.variables(3)!.valuesArray()![i];
          const humidity = daily.variables(4)!.valuesArray()![i];
          const weatherCode = daily.variables(0)!.valuesArray()![i];
          
          forecast.push({
            date: date.toISOString().split('T')[0],
            temperature: {
              min: Math.round(minTemp),
              max: Math.round(maxTemp),
            },
            humidity: Math.round(humidity),
            precipitation: Math.round(precipitation * 10) / 10,
            condition: getWeatherCondition(weatherCode),
          });
        }
      }

      return {
        current: {
          temperature: Math.round(current.variables(0)!.value()),
          humidity: Math.round(current.variables(1)!.value()),
          precipitation: Math.round(current.variables(2)!.value() * 10) / 10,
          windSpeed: Math.round(current.variables(3)!.value() * 2.237), // Convert m/s to mph
          condition: getWeatherCondition(current.variables(4)!.value()),
        },
        forecast,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  };

  const generateCropRecommendations = useCallback(async (weather: WeatherData, locationData: LocationData): Promise<CropRecommendation[]> => {
    try {
      await geminiAI.initialize();

      const result = await geminiAI.generateCropRecommendations(weather, locationData);
      
      // Try to parse the JSON response
      try {
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}') + 1;
        const jsonStr = result.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonStr);
        
        return parsed.recommendations.map((rec: any, index: number) => ({
          ...rec,
          id: rec.id || `crop_${index + 1}`,
          suitabilityScore: Math.min(100, Math.max(0, rec.suitabilityScore || 70)),
        }));
      } catch {
        console.warn('Failed to parse JSON, using fallback recommendations');
        return getFallbackRecommendations(weather, locationData);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('API key not found')) {
        console.warn('Gemini AI API key not configured, using enhanced fallback recommendations');
      } else {
        console.error('Failed to generate AI recommendations:', error);
      }
      return getFallbackRecommendations(weather, locationData);
    }
  }, []);

  const getFallbackRecommendations = (weather: WeatherData, locationData: LocationData): CropRecommendation[] => {
    const avgTemp = weather.forecast.slice(0, 7).reduce((acc, day) => acc + (day.temperature.min + day.temperature.max) / 2, 0) / 7;
    const totalRainfall = weather.forecast.slice(0, 7).reduce((acc, day) => acc + day.precipitation, 0);
    const avgHumidity = weather.forecast.slice(0, 7).reduce((acc, day) => acc + day.humidity, 0) / 7;
    
    const recommendations: CropRecommendation[] = [];
    
    // Summer crops (warm season)
    if (avgTemp >= 20 && avgTemp <= 32) {
      recommendations.push({
        id: 'tomato_1',
        name: 'Tomatoes',
        variety: 'Roma',
        suitabilityScore: avgTemp >= 22 && avgTemp <= 28 ? 90 : 75,
        plantingWindow: 'Next 1-2 weeks',
        expectedHarvest: '75-85 days from planting',
        reasons: [
          'Excellent temperature range for warm-season crop',
          'Long growing season ahead',
          totalRainfall > 15 ? 'Adequate rainfall expected' : 'Good drainage conditions'
        ],
        warnings: avgTemp > 30 ? ['Monitor for heat stress', 'Provide afternoon shade'] : [],
        plantingTips: [
          'Plant after soil temperature reaches 16°C',
          'Provide support structures (cages or stakes)',
          'Mulch around plants to retain moisture',
          'Space plants 60cm apart for good air circulation'
        ],
      });

      recommendations.push({
        id: 'pepper_1',
        name: 'Bell Peppers',
        variety: 'California Wonder',
        suitabilityScore: 85,
        plantingWindow: 'Next 1-3 weeks',
        expectedHarvest: '70-80 days from planting',
        reasons: [
          'Perfect warm weather conditions',
          'High humidity beneficial for fruit development',
          'Extended harvest period'
        ],
        plantingTips: [
          'Start seeds indoors if soil is still cool',
          'Plant in full sun location',
          'Regular watering but avoid waterlogging',
          'Harvest when peppers reach full size'
        ],
      });
    }

    // Cool season crops
    if (avgTemp >= 10 && avgTemp <= 25) {
      recommendations.push({
        id: 'lettuce_1',
        name: 'Lettuce',
        variety: 'Buttercrunch',
        suitabilityScore: avgTemp <= 20 ? 90 : 70,
        plantingWindow: 'Immediate planting recommended',
        expectedHarvest: '45-60 days from planting',
        reasons: [
          'Ideal cool season conditions',
          'Quick maturity for fast harvest',
          'Tolerates light frost'
        ],
        warnings: avgTemp > 22 ? ['May bolt in hot weather', 'Plant in partial shade'] : [],
        plantingTips: [
          'Plant in partial shade if temperatures rising',
          'Keep soil consistently moist',
          'Harvest outer leaves first for continuous production',
          'Succession plant every 2 weeks'
        ],
      });

      recommendations.push({
        id: 'spinach_1',
        name: 'Spinach',
        variety: 'Space',
        suitabilityScore: 85,
        plantingWindow: 'Next 1-2 weeks',
        expectedHarvest: '40-50 days from planting',
        reasons: [
          'Cool weather preferred crop',
          'High nutritional value',
          'Cold tolerant'
        ],
        plantingTips: [
          'Direct sow in garden beds',
          'Plant in fertile, well-draining soil',
          'Harvest when leaves are 3-6 inches long',
          'Can tolerate light frost'
        ],
      });
    }

    // Crops suitable for rainy conditions
    if (totalRainfall > 15) {
      recommendations.push({
        id: 'beans_1',
        name: 'Green Beans',
        variety: 'Bush Bean Provider',
        suitabilityScore: 80,
        plantingWindow: 'Next 2-3 weeks',
        expectedHarvest: '50-60 days from planting',
        reasons: [
          'Good moisture availability from rainfall',
          'Nitrogen-fixing improves soil',
          'Thrives in humid conditions'
        ],
        warnings: ['Ensure good drainage to prevent root rot', 'Watch for fungal diseases in wet conditions'],
        plantingTips: [
          'Plant when soil temperature is above 15°C',
          'Create raised beds for better drainage',
          'Avoid overhead watering if rainfall is adequate',
          'Harvest regularly to encourage production'
        ],
      });
    }

    // Universal crops suitable for most conditions
    recommendations.push({
      id: 'radish_1',
      name: 'Radishes',
      variety: 'Cherry Belle',
      suitabilityScore: 85,
      plantingWindow: 'Immediate planting',
      expectedHarvest: '25-30 days from planting',
      reasons: [
        'Fast-growing crop for quick harvest',
        'Tolerates wide temperature range',
        'Good for soil preparation'
      ],
      plantingTips: [
        'Direct sow seeds in garden',
        'Thin seedlings to 2-3cm apart',
        'Harvest when roots are firm and crisp',
        'Perfect for succession planting'
      ],
    });

    // Add herbs that are generally suitable
    recommendations.push({
      id: 'basil_1',
      name: 'Basil',
      variety: 'Genovese',
      suitabilityScore: avgTemp >= 18 ? 85 : 65,
      plantingWindow: 'Next 1-2 weeks',
      expectedHarvest: '60-90 days continuous harvest',
      reasons: [
        'Excellent culinary herb',
        'Companion plant for tomatoes',
        'Continuous harvest potential'
      ],
      warnings: avgTemp < 15 ? ['Sensitive to cold temperatures'] : [],
      plantingTips: [
        'Plant in warm, sunny location',
        'Pinch flowers to encourage leaf growth',
        'Harvest regularly for best flavor',
        'Can be grown in containers'
      ],
    });
    
    return recommendations.slice(0, 6); // Return top 6 recommendations
  };

  const fetchRecommendations = useCallback(async (providedLocation?: LocationData) => {
    try {
      setIsLoading(true);
      setError(null);

      let locationData = providedLocation;
      
      if (!locationData) {
        const currentLocation = await getCurrentLocation();
        if (!currentLocation) {
          throw new Error('Unable to get location');
        }
        locationData = currentLocation;
      }

      setLocation(locationData);
      
      const weather = await fetchWeatherData(locationData.latitude, locationData.longitude);
      setWeatherData(weather);
      
      const cropRecommendations = await generateCropRecommendations(weather, locationData);
      setRecommendations(cropRecommendations);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch crop recommendations';
      setError(errorMessage);
      console.error('Crop recommendations error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generateCropRecommendations]);

  const refreshRecommendations = useCallback(async () => {
    if (location) {
      await fetchRecommendations(location);
    }
  }, [location, fetchRecommendations]);

  return {
    recommendations,
    weatherData,
    location,
    isLoading,
    error,
    fetchRecommendations,
    refreshRecommendations,
  };
};
