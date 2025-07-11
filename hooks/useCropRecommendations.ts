import { useState } from 'react';
import { getAICropRecommendationService, type AICropRecommendation, type RecommendationOptions } from '@/ai/services/ai-crop-recommendation-service';

export type { AICropRecommendation as CropRecommendation } from '@/ai/services/ai-crop-recommendation-service';

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
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    timestamp: number;
    accuracy?: number;
  };
  lastUpdated: number;
}

export const useCropRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AICropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (
    weatherData?: WeatherData, 
    options?: RecommendationOptions
  ) => {
    setIsLoading(true);
    setError(null);
    
    console.log('🌱 Starting AI crop recommendations process...');

    try {
      if (!weatherData) {
        throw new Error('Weather data is required for AI crop recommendations');
      }

      console.log('📍 Weather data available:', {
        location: weatherData.location.city,
        temperature: weatherData.current.temperature,
        condition: weatherData.current.condition
      });

      const aiCropService = getAICropRecommendationService();
      console.log('🤖 AI service initialized, requesting recommendations...');
      
      const cropRecommendations = await aiCropService.getRecommendations(weatherData, {
        maxRecommendations: 8,
        minSuitabilityScore: 40,
        experienceLevel: 'intermediate',
        farmSize: 'medium',
        marketFocus: 'local',
        language: 'English',
        ...options
      });
      
      console.log(`✅ Successfully generated ${cropRecommendations.length} AI crop recommendations`);
      setRecommendations(cropRecommendations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI crop recommendations';
      setError(errorMessage);
      console.error('❌ AI Crop recommendations error:', err);
      
      // Set empty recommendations on error
      setRecommendations([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 AI crop recommendations process completed');
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
  };
};
