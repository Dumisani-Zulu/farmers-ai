import { useState, useCallback, useEffect } from 'react';
import { useLocationWeather } from '@/contexts/LocationWeatherContext';
import { geminiAI } from '@/lib/gemini-ai';

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

interface UseWeatherBasedCropRecommendationsReturn {
  recommendations: CropRecommendation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Methods
  generateRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  clearRecommendations: () => void;
}

export const useWeatherBasedCropRecommendations = (): UseWeatherBasedCropRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const { weatherData, currentLocation, isLoading: locationLoading } = useLocationWeather();

  const generateCropRecommendations = useCallback(async (): Promise<CropRecommendation[]> => {
    if (!weatherData || !currentLocation) {
      throw new Error('Weather data and location are required for crop recommendations');
    }

    try {
      console.log('🤖 Initializing Gemini AI for crop recommendations...');
      await geminiAI.initialize();

      console.log('🌤️ Sending weather data to Gemini AI:', {
        location: currentLocation.city || currentLocation.address || 'Unknown location',
        currentTemp: weatherData.current.temperature,
        humidity: weatherData.current.humidity,
        forecastDays: weatherData.forecast.length
      });

      const result = await geminiAI.generateCropRecommendations(weatherData);
      
      console.log('🌾 Received raw Gemini AI response (first 200 chars):', result.substring(0, 200) + '...');
      
      // Try to parse the JSON response
      try {
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          console.warn('❌ No JSON found in Gemini response, using fallback');
          throw new Error('No JSON found in response');
        }
        
        const jsonStr = result.substring(jsonStart, jsonEnd);
        console.log('📋 Extracted JSON from Gemini response');
        
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
          console.warn('❌ Invalid response format from Gemini, using fallback');
          throw new Error('Invalid response format');
        }
        
        console.log('✅ Successfully parsed', parsed.recommendations.length, 'recommendations from Gemini AI');
        
        return parsed.recommendations.map((rec: any, index: number) => ({
          ...rec,
          id: rec.id || `crop_${index + 1}`,
          suitabilityScore: Math.min(100, Math.max(0, rec.suitabilityScore || 70)),
          reasons: Array.isArray(rec.reasons) ? rec.reasons : [rec.reasons || 'Suitable for current conditions'],
          warnings: Array.isArray(rec.warnings) ? rec.warnings : (rec.warnings ? [rec.warnings] : []),
          plantingTips: Array.isArray(rec.plantingTips) ? rec.plantingTips : [rec.plantingTips || 'Follow standard planting guidelines'],
        }));
      } catch (parseError: any) {
        console.warn('❌ Failed to parse JSON response, using fallback recommendations:', parseError.message);
        return getFallbackRecommendations(weatherData, currentLocation);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('API key not found')) {
        console.warn('⚠️ Gemini AI API key not configured, using enhanced fallback recommendations');
      } else {
        console.error('❌ Failed to generate AI recommendations:', error.message);
      }
      console.log('🔄 Using fallback recommendations instead');
      return getFallbackRecommendations(weatherData, currentLocation);
    }
  }, [weatherData, currentLocation]);

  const generateRecommendations = useCallback(async () => {
    if (!weatherData || !currentLocation) {
      setError('Location and weather data required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating crop recommendations for:', currentLocation.city || currentLocation.address || 'Unknown location');
      const newRecommendations = await generateCropRecommendations();
      
      setRecommendations(newRecommendations);
      setLastUpdated(Date.now());
      
      console.log(`Generated ${newRecommendations.length} crop recommendations`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      console.error('Recommendation generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generateCropRecommendations, weatherData, currentLocation]);

  const refreshRecommendations = useCallback(async () => {
    await generateRecommendations();
  }, [generateRecommendations]);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setLastUpdated(null);
    setError(null);
  }, []);

  // Auto-generate recommendations when weather data becomes available
  useEffect(() => {
    if (weatherData && currentLocation && !isLoading && !locationLoading && recommendations.length === 0) {
      console.log('Auto-generating initial crop recommendations');
      generateRecommendations();
    }
  }, [weatherData, currentLocation, isLoading, locationLoading, recommendations.length, generateRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    lastUpdated,
    generateRecommendations,
    refreshRecommendations,
    clearRecommendations,
  };
};

// Enhanced fallback recommendations based on weather data
const getFallbackRecommendations = (weatherData: any, location: any): CropRecommendation[] => {
  console.log('🔄 Generating enhanced fallback recommendations based on weather conditions');
  
  const avgTemp = weatherData.forecast.slice(0, 7).reduce((acc: number, day: any) => 
    acc + (day.temperature.min + day.temperature.max) / 2, 0) / 7;
  const totalRainfall = weatherData.forecast.slice(0, 7).reduce((acc: number, day: any) => 
    acc + day.precipitation, 0);
  const avgHumidity = weatherData.forecast.slice(0, 7).reduce((acc: number, day: any) => 
    acc + day.humidity, 0) / 7;

  const isWarmSeason = avgTemp > 20;
  const isWetSeason = totalRainfall > 20;
  const isHighHumidity = avgHumidity > 70;
  
  console.log('📊 Weather analysis for fallback:', {
    avgTemp: Math.round(avgTemp),
    totalRainfall: Math.round(totalRainfall),
    avgHumidity: Math.round(avgHumidity),
    isWarmSeason,
    isWetSeason,
    isHighHumidity
  });

  const baseRecommendations = [];

  // Season and temperature-based recommendations
  if (isWarmSeason) {
    baseRecommendations.push({
      id: 'tomato_warm',
      name: 'Tomato',
      variety: 'Early Girl',
      suitabilityScore: 85,
      plantingWindow: 'Now - next 2 weeks',
      expectedHarvest: '75-85 days',
      reasons: [
        `Warm temperatures (${Math.round(avgTemp)}°C) ideal for tomato growth`,
        'Heat-loving plant that thrives in current conditions',
        'Good yield potential in warm weather'
      ],
      warnings: isHighHumidity ? ['Monitor for fungal diseases in high humidity'] : ['Water consistently to prevent blossom end rot'],
      plantingTips: [
        'Plant after soil temperature reaches 18°C',
        'Provide support stakes or cages',
        'Ensure good air circulation between plants'
      ]
    });

    baseRecommendations.push({
      id: 'pepper_warm',
      name: 'Bell Pepper',
      variety: 'California Wonder',
      suitabilityScore: 82,
      plantingWindow: 'Now - next 3 weeks',
      expectedHarvest: '70-85 days',
      reasons: [
        'Thrives in warm weather conditions',
        'Long growing season matches current climate',
        'Excellent for fresh consumption'
      ],
      warnings: ['Protect from strong winds', 'Ensure consistent watering'],
      plantingTips: [
        'Plant in full sun location',
        'Space plants 18-24 inches apart',
        'Mulch around plants to retain moisture'
      ]
    });

    baseRecommendations.push({
      id: 'squash_warm',
      name: 'Summer Squash',
      variety: 'Yellow Crookneck',
      suitabilityScore: 88,
      plantingWindow: 'Now - next 2 weeks',
      expectedHarvest: '50-65 days',
      reasons: [
        'Fast-growing in warm temperatures',
        'Heat-tolerant variety',
        'Continuous harvest throughout season'
      ],
      warnings: ['Watch for squash bugs', 'Harvest regularly to encourage production'],
      plantingTips: [
        'Plant seeds 1 inch deep',
        'Space plants 3-4 feet apart',
        'Water at soil level to prevent leaf diseases'
      ]
    });
  } else {
    // Cool weather crops
    baseRecommendations.push({
      id: 'lettuce_cool',
      name: 'Lettuce',
      variety: 'Buttercrunch',
      suitabilityScore: 90,
      plantingWindow: 'Now - next 3 weeks',
      expectedHarvest: '45-60 days',
      reasons: [
        `Cool temperatures (${Math.round(avgTemp)}°C) perfect for lettuce`,
        'Won\'t bolt in current weather conditions',
        'Ideal growing conditions for crisp leaves'
      ],
      warnings: ['Protect from hard frost', 'Ensure good drainage'],
      plantingTips: [
        'Sow seeds directly or transplant',
        'Plant in partial shade if temperatures rise',
        'Keep soil consistently moist'
      ]
    });

    baseRecommendations.push({
      id: 'spinach_cool',
      name: 'Spinach',
      variety: 'Space',
      suitabilityScore: 92,
      plantingWindow: 'Now - next 4 weeks',
      expectedHarvest: '40-50 days',
      reasons: [
        'Thrives in cool weather conditions',
        'Frost-tolerant crop',
        'Multiple harvests possible'
      ],
      warnings: ['May bolt if weather warms suddenly'],
      plantingTips: [
        'Plant in rich, well-draining soil',
        'Succession plant every 2 weeks',
        'Harvest outer leaves first'
      ]
    });

    baseRecommendations.push({
      id: 'broccoli_cool',
      name: 'Broccoli',
      variety: 'De Cicco',
      suitabilityScore: 87,
      plantingWindow: 'Now - next 2 weeks',
      expectedHarvest: '60-80 days',
      reasons: [
        'Cool-season crop suited to current temperatures',
        'Forms tight heads in cool weather',
        'High nutritional value'
      ],
      warnings: ['Protect from cabbage worms', 'Harvest before flowers open'],
      plantingTips: [
        'Start with transplants for better success',
        'Plant in rich, composted soil',
        'Provide consistent moisture'
      ]
    });
  }

  // Rainfall-based recommendations
  if (isWetSeason) {
    baseRecommendations.push({
      id: 'kale_wet',
      name: 'Kale',
      variety: 'Lacinato',
      suitabilityScore: 86,
      plantingWindow: 'Now - next 3 weeks',
      expectedHarvest: '55-70 days',
      reasons: [
        `Expected rainfall (${Math.round(totalRainfall)}mm) reduces irrigation needs`,
        'Tolerates wet conditions well',
        'Improves flavor after light frost'
      ],
      warnings: ['Ensure good drainage to prevent root rot', 'Watch for aphids'],
      plantingTips: [
        'Plant in raised beds if soil drainage is poor',
        'Space plants for good air circulation',
        'Harvest outer leaves regularly'
      ]
    });
  } else {
    // Low rainfall recommendations
    baseRecommendations.push({
      id: 'radish_dry',
      name: 'Radish',
      variety: 'Cherry Belle',
      suitabilityScore: 95,
      plantingWindow: 'Now - next 4 weeks',
      expectedHarvest: '25-30 days',
      reasons: [
        'Drought-tolerant once established',
        'Fast-growing with minimal water needs',
        'Perfect for quick harvest'
      ],
      warnings: ['Water consistently during germination'],
      plantingTips: [
        'Sow seeds directly in garden',
        'Thin seedlings to prevent overcrowding',
        'Harvest when roots are young and tender'
      ]
    });
  }

  // Always include versatile crops
  baseRecommendations.push({
    id: 'beans_universal',
    name: 'Bush Beans',
    variety: 'Provider',
    suitabilityScore: 89,
    plantingWindow: 'Now - next 3 weeks',
    expectedHarvest: '50-60 days',
    reasons: [
      'Adapts well to various weather conditions',
      'Fixes nitrogen in soil',
      'Reliable producer in most climates'
    ],
    warnings: ['Avoid planting in waterlogged soil'],
    plantingTips: [
      'Plant seeds 1-2 inches deep',
      'Space rows 18-24 inches apart',
      'Avoid overhead watering to prevent disease'
    ]
  });

  const finalRecommendations = baseRecommendations.slice(0, 6); // Limit to 6 recommendations
  
  console.log(`✅ Generated ${finalRecommendations.length} weather-appropriate fallback recommendations`);
  
  return finalRecommendations;
};
