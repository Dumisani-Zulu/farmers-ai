/**
 * AI Configuration for Farmers App
 * Manages API keys, model settings, and AI service configurations
 */

export interface AIConfig {
  gemini: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  tensorflow: {
    modelUrl?: string;
    backend: 'cpu' | 'webgl' | 'rn';
  };
  features: {
    cropRecommendation: boolean;
    weatherAnalysis: boolean;
    seasonalAdvice: boolean;
    diseaseDetection: boolean;
  };
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  gemini: {
    apiKey: '',
    model: 'gemini-1.5-flash',
    maxTokens: 1000,
    temperature: 0.7,
  },
  tensorflow: {
    backend: 'rn',
  },
  features: {
    cropRecommendation: true,
    weatherAnalysis: true,
    seasonalAdvice: true,
    diseaseDetection: false, // Will enable in later stages
  },
};

export const getAIConfig = (): AIConfig => {
  // Try multiple environment variable names for API key
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 
                 process.env.GOOGLE_AI_API_KEY || 
                 process.env.GOOGLE_API_KEY || 
                 '';

  return {
    ...defaultAIConfig,
    gemini: {
      ...defaultAIConfig.gemini,
      apiKey,
    },
  };
};
