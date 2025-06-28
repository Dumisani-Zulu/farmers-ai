import { useState, useEffect } from 'react';
import { agriculturalAITools, PlantDiseaseResult, PestResult, WeedResult, SoilAnalysisResult } from '../lib/agricultural-ai-tools';

export const useAgriculturalAI = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        await agriculturalAITools.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize AI tools');
        console.error('AI initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, []);

  const identifyPlantDisease = async (imageUri: string): Promise<PlantDiseaseResult> => {
    if (!isInitialized) {
      throw new Error('AI tools not initialized');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await agriculturalAITools.identifyPlantDisease(imageUri);
      return result;
    } catch {
      const errorMessage = 'Failed to identify plant disease';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const identifyPest = async (imageUri: string): Promise<PestResult> => {
    if (!isInitialized) {
      throw new Error('AI tools not initialized');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await agriculturalAITools.identifyPest(imageUri);
      return result;
    } catch {
      const errorMessage = 'Failed to identify pest';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const identifyWeed = async (imageUri: string): Promise<WeedResult> => {
    if (!isInitialized) {
      throw new Error('AI tools not initialized');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await agriculturalAITools.identifyWeed(imageUri);
      return result;
    } catch {
      const errorMessage = 'Failed to identify weed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSoil = async (imageUri: string): Promise<SoilAnalysisResult> => {
    if (!isInitialized) {
      throw new Error('AI tools not initialized');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await agriculturalAITools.analyzeSoil(imageUri);
      return result;
    } catch {
      const errorMessage = 'Failed to analyze soil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemoryInfo = () => {
    return agriculturalAITools.getMemoryInfo();
  };

  const cleanup = () => {
    agriculturalAITools.dispose();
  };

  return {
    isInitialized,
    isLoading,
    error,
    identifyPlantDisease,
    identifyPest,
    identifyWeed,
    analyzeSoil,
    getMemoryInfo,
    cleanup
  };
};

export default useAgriculturalAI;
