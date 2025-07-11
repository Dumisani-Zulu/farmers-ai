import { useState } from 'react';

export interface CropRecommendation {
  id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  harvestDate?: string;
  plantingWindow?: string;
  expectedHarvest?: string;
  description: string;
  growthStage: string;
  plantingTips?: string[];
  requirements: {
    temperature: { min: number; max: number };
    rainfall: { min: number; max: number };
    humidity?: { min: number; max: number };
    soilType: string[];
    soilPH: { min: number; max: number };
    sunlight: string;
  };
  benefits: string[];
  challenges: string[];
  tips: string[];
  reasons?: string[];
  warnings?: string[];
  suitabilityScore: number;
  weatherCompatibility: {
    temperature: number;
    rainfall: number;
    overall: number;
  };
}

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
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (location?: { lat: number; lon: number }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Placeholder - will be implemented with actual AI tools
      const mockRecommendations: CropRecommendation[] = [];
      setRecommendations(mockRecommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
  };
};
