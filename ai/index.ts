/**
 * AI Module Index
 * Main entry point for all AI services and utilities
 */

// Configuration
export { getAIConfig, defaultAIConfig, type AIConfig } from './config';

// Tools
export * from './tools';

// Services
export { getGeminiService, GeminiAIService } from './services/gemini-service';
export { getTensorFlowService, TensorFlowService } from './services/tensorflow-service';
export { 
  getCropRecommendationService, 
  CropRecommendationService,
  type CropRecommendation,
  type RecommendationOptions 
} from './services/crop-recommendation-service';
export { 
  getAICropRecommendationService, 
  AICropRecommendationService,
  type AICropRecommendation,
  type AICropSuggestion 
} from './services/ai-crop-recommendation-service';
export { 
  getDiseaseIdentificationService, 
  DiseaseIdentificationService,
  type DiseaseAnalysisResult 
} from './services/disease-identification-service';

// Data
export { 
  CROP_DATABASE, 
  getCropById, 
  getCropsByCategory, 
  searchCrops,
  type CropInfo 
} from './data/crop-database';

// Utils
export { 
  analyzeWeatherData, 
  calculateWeatherSuitability,
  type WeatherAnalysis 
} from './utils/weather-analysis';

/**
 * Initialize AI services
 * Call this once when the app starts
 */
export const initializeAI = async (): Promise<void> => {
  try {
    console.log('Initializing AI services...');
    
    // Verify Gemini service is configured
    const { getGeminiService } = await import('./services/gemini-service');
    const geminiService = getGeminiService();
    if (!geminiService.isConfigured()) {
      console.warn('Gemini AI service is not properly configured. Please check your API key.');
    }
    
    // Initialize TensorFlow (optional for now)
    try {
      const { getTensorFlowService } = await import('./services/tensorflow-service');
      const tfService = getTensorFlowService();
      await tfService.initialize();
      console.log('TensorFlow.js initialized successfully');
    } catch (error) {
      console.warn('TensorFlow.js initialization failed:', error);
      // Continue without TensorFlow
    }
    
    console.log('AI services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI services:', error);
    throw error;
  }
};

/**
 * Quick health check for AI services
 */
export const checkAIHealth = async (): Promise<{ 
  gemini: boolean; 
  tensorflow: boolean;
  cropRecommendation: boolean; 
}> => {
  try {
    const { getGeminiService } = await import('./services/gemini-service');
    const { getTensorFlowService } = await import('./services/tensorflow-service');
    
    const geminiService = getGeminiService();
    const tfService = getTensorFlowService();
    
    return {
      gemini: geminiService.isConfigured(),
      tensorflow: tfService.isInitialized(),
      cropRecommendation: true, // Always available as it has fallback logic
    };
  } catch (error) {
    console.error('AI health check failed:', error);
    return {
      gemini: false,
      tensorflow: false,
      cropRecommendation: false,
    };
  }
};
