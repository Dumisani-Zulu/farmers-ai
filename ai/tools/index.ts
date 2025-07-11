/**
 * AI Tools Index
 * 
 * This file exports all the AI logic modules for easy import
 */

export { cropPlannerAI, CropPlannerAI } from './crop-planner';
export type { CropPlanningRequest, CropPlanningResponse } from './crop-planner';

export { pestManagementAI, PestManagementAI } from './pest-management';
export type { 
  PestIdentificationRequest, 
  PestIdentificationResponse,
  DiseaseDetectionRequest 
} from './pest-management';

export { soilAnalysisAI, SoilAnalysisAI } from './soil-analysis';
export type { 
  SoilAnalysisRequest, 
  SoilAnalysisResponse,
  SoilHealthTrend 
} from './soil-analysis';

export { weatherAnalysisAI, WeatherAnalysisAI } from './weather-analysis';
export type { 
  WeatherAnalysisRequest, 
  WeatherAnalysisResponse,
  IrrigationRecommendation 
} from './weather-analysis';

export { marketAnalysisAI, MarketAnalysisAI } from './market-analysis';
export type { 
  MarketAnalysisRequest, 
  MarketAnalysisResponse,
  PriceHistory,
  CompetitorAnalysis 
} from './market-analysis';

export { diseaseIdentificationAI, DiseaseIdentificationAI } from './disease-identification';
export type { 
  DiseaseIdentificationRequest, 
  DiseaseIdentificationResponse,
  DiseaseMonitoring,
  DiseaseForecast 
} from './disease-identification';
