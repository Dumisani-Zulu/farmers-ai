import { useState, useEffect, useCallback } from 'react';
import { agricultureAI, CropAnalysisInput, CropAnalysisResult, WeatherPredictionInput, WeatherPredictionResult } from '../lib/agriculture-ai';

export interface UseAgricultureAIReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Crop Analysis
  cropAnalysis: CropAnalysisResult | null;
  analyzeCrop: (input: CropAnalysisInput) => Promise<void>;
  
  // Weather Prediction
  weatherPrediction: WeatherPredictionResult | null;
  predictWeather: (input: WeatherPredictionInput) => Promise<void>;
  
  // Seasonal Advice
  seasonalAdvice: string | null;
  getSeasonalAdvice: (cropType: string, location: { latitude: number; longitude: number }) => Promise<void>;
  
  // Personalized Recommendations
  recommendations: string | null;
  getRecommendations: (profile: {
    experience: string;
    farmSize: string;
    cropTypes: string[];
    location: { latitude: number; longitude: number };
    resources: string[];
  }) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export const useAgricultureAI = (): UseAgricultureAIReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cropAnalysis, setCropAnalysis] = useState<CropAnalysisResult | null>(null);
  const [weatherPrediction, setWeatherPrediction] = useState<WeatherPredictionResult | null>(null);
  const [seasonalAdvice, setSeasonalAdvice] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  // Initialize the AI service
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await agricultureAI.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize AI service');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setCropAnalysis(null);
    setWeatherPrediction(null);
    setSeasonalAdvice(null);
    setRecommendations(null);
    setError(null);
  }, []);

  const analyzeCrop = useCallback(async (input: CropAnalysisInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await agricultureAI.analyzeCropHealth(input);
      setCropAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze crop');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictWeather = useCallback(async (input: WeatherPredictionInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await agricultureAI.predictWeather(input);
      setWeatherPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict weather');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSeasonalAdvice = useCallback(async (cropType: string, location: { latitude: number; longitude: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const advice = await agricultureAI.getSeasonalAdvice(cropType, location);
      setSeasonalAdvice(advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get seasonal advice');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecommendations = useCallback(async (profile: {
    experience: string;
    farmSize: string;
    cropTypes: string[];
    location: { latitude: number; longitude: number };
    resources: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const recs = await agricultureAI.getPersonalizedRecommendations(profile);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Crop Analysis
    cropAnalysis,
    analyzeCrop,
    
    // Weather Prediction
    weatherPrediction,
    predictWeather,
    
    // Seasonal Advice
    seasonalAdvice,
    getSeasonalAdvice,
    
    // Personalized Recommendations
    recommendations,
    getRecommendations,
    
    // Utility
    clearError,
    reset,
  };
};
