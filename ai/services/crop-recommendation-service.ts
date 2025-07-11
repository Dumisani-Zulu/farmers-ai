/**
 * Crop Recommendation Service
 * Uses Gemini AI and weather analysis to recommend suitable crops
 */

import { getGeminiService } from './gemini-service';
import { CROP_DATABASE, CropInfo } from '../data/crop-database';
import { 
  analyzeWeatherData, 
  calculateWeatherSuitability, 
  WeatherData, 
  WeatherAnalysis 
} from '../utils/weather-analysis';

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
  aiInsights?: string;
}

export interface RecommendationOptions {
  maxRecommendations?: number;
  minSuitabilityScore?: number;
  preferredCategories?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  farmSize?: 'small' | 'medium' | 'large';
  marketFocus?: 'subsistence' | 'local' | 'commercial';
}

export class CropRecommendationService {
  private geminiService = getGeminiService();

  /**
   * Get crop recommendations based on weather data and user preferences
   */
  async getRecommendations(
    weatherData: WeatherData,
    options: RecommendationOptions = {}
  ): Promise<CropRecommendation[]> {
    try {
      // Analyze weather data
      const weatherAnalysis = analyzeWeatherData(weatherData);
      
      // Get base crop suitability scores
      const suitableCrops = this.calculateBaseSuitability(weatherAnalysis, options);
      
      // Enhance recommendations with AI insights
      const enhancedRecommendations = await this.enhanceWithAI(
        suitableCrops,
        weatherAnalysis,
        weatherData,
        options
      );
      
      // Sort by suitability score and return top recommendations
      const maxRecommendations = options.maxRecommendations || 10;
      const minScore = options.minSuitabilityScore || 40;
      
      return enhancedRecommendations
        .filter(crop => crop.suitabilityScore >= minScore)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, maxRecommendations);
        
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      throw new Error('Failed to generate crop recommendations');
    }
  }

  /**
   * Calculate base suitability scores for all crops
   */
  private calculateBaseSuitability(
    weatherAnalysis: WeatherAnalysis,
    options: RecommendationOptions
  ): CropRecommendation[] {
    const recommendations: CropRecommendation[] = [];
    
    for (const crop of CROP_DATABASE) {
      // Filter by preferred categories if specified
      if (options.preferredCategories && 
          !options.preferredCategories.includes(crop.category)) {
        continue;
      }
      
      // Calculate weather suitability
      const suitability = calculateWeatherSuitability(weatherAnalysis, crop.climate);
      
      // Skip crops with very low suitability
      if (suitability.score < 20) continue;
      
      // Create recommendation object
      const recommendation: CropRecommendation = {
        id: crop.id,
        name: crop.name,
        variety: this.selectBestVariety(crop, weatherAnalysis),
        plantingDate: this.calculatePlantingDate(crop, weatherAnalysis),
        harvestDate: this.calculateHarvestDate(crop, weatherAnalysis),
        plantingWindow: this.getPlantingWindow(crop, weatherAnalysis),
        expectedHarvest: this.getExpectedHarvest(crop),
        description: this.generateDescription(crop, weatherAnalysis),
        growthStage: 'planning',
        plantingTips: this.generatePlantingTips(crop, weatherAnalysis, options),
        requirements: {
          temperature: crop.climate.temperature,
          rainfall: crop.climate.rainfall,
          humidity: crop.climate.humidity,
          soilType: crop.soil.types,
          soilPH: crop.soil.ph,
          sunlight: crop.requirements.sunlight,
        },
        benefits: crop.benefits,
        challenges: crop.commonChallenges,
        tips: this.generateGeneralTips(crop, weatherAnalysis),
        reasons: this.generateReasons(crop, suitability, weatherAnalysis),
        warnings: this.generateWarnings(crop, suitability, weatherAnalysis),
        suitabilityScore: suitability.score,
        weatherCompatibility: {
          temperature: suitability.factors.temperature,
          rainfall: suitability.factors.rainfall,
          overall: suitability.score,
        },
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  /**
   * Enhance recommendations with AI-generated insights
   */
  private async enhanceWithAI(
    recommendations: CropRecommendation[],
    weatherAnalysis: WeatherAnalysis,
    weatherData: WeatherData,
    options: RecommendationOptions
  ): Promise<CropRecommendation[]> {
    try {
      // Take top candidates for AI enhancement
      const topCandidates = recommendations
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, 5);
      
      const enhancedPromises = topCandidates.map(async (crop) => {
        const aiInsights = await this.generateAIInsights(crop, weatherAnalysis, weatherData, options);
        return { ...crop, aiInsights };
      });
      
      const enhanced = await Promise.all(enhancedPromises);
      
      // Merge enhanced crops back with the rest
      const enhancedMap = new Map(enhanced.map(crop => [crop.id, crop]));
      
      return recommendations.map(crop => 
        enhancedMap.get(crop.id) || crop
      );
      
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      // Return original recommendations if AI enhancement fails
      return recommendations;
    }
  }

  /**
   * Generate AI insights for a specific crop recommendation
   */
  private async generateAIInsights(
    crop: CropRecommendation,
    weatherAnalysis: WeatherAnalysis,
    weatherData: WeatherData,
    options: RecommendationOptions
  ): Promise<string> {
    const prompt = `
As an agricultural expert, provide specific insights for growing ${crop.name} given the following conditions:

Weather Analysis:
- Average Temperature: ${weatherAnalysis.averageTemperature.toFixed(1)}°C
- Temperature Range: ${weatherAnalysis.temperatureRange.min}°C to ${weatherAnalysis.temperatureRange.max}°C
- Total Rainfall (7-day): ${weatherAnalysis.totalRainfall}mm
- Average Humidity: ${weatherAnalysis.averageHumidity.toFixed(1)}%
- Season: ${weatherAnalysis.season}
- Climate Zone: ${weatherAnalysis.climateZone}
- Growing Season: ${weatherAnalysis.growingSeason ? 'Yes' : 'No'}

Current Weather:
- Temperature: ${weatherData.current.temperature}°C
- Condition: ${weatherData.current.condition}
- Description: ${weatherData.current.description}

Location: ${weatherData.location.city || 'Unknown'}, ${weatherData.location.region || weatherData.location.country || 'Unknown'}

Farmer Profile:
- Experience Level: ${options.experienceLevel || 'intermediate'}
- Farm Size: ${options.farmSize || 'medium'}
- Market Focus: ${options.marketFocus || 'local'}

Crop Suitability Score: ${crop.suitabilityScore.toFixed(1)}/100

Please provide:
1. Specific timing recommendations for this location and season
2. Climate-specific growing tips
3. Potential challenges based on current weather patterns
4. Optimization suggestions for maximizing yield
5. Market timing advice if relevant

Keep the response concise but actionable (max 200 words).
`;

    try {
      const insights = await this.geminiService.generateText(prompt);
      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return `Based on current conditions, ${crop.name} shows ${crop.suitabilityScore > 70 ? 'excellent' : crop.suitabilityScore > 50 ? 'good' : 'moderate'} suitability for your location.`;
    }
  }

  /**
   * Helper methods for generating recommendation details
   */
  private selectBestVariety(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string | undefined {
    return crop.varieties[0]; // Simple selection - could be enhanced with more logic
  }

  private calculatePlantingDate(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string {
    const currentDate = new Date();
    const recommendedDate = new Date(currentDate);
    
    // Simple logic - plant in optimal season
    if (crop.season.planting.includes(weatherAnalysis.season)) {
      recommendedDate.setDate(currentDate.getDate() + 7); // Next week
    } else {
      recommendedDate.setMonth(currentDate.getMonth() + 2); // Next season
    }
    
    return recommendedDate.toISOString().split('T')[0];
  }

  private calculateHarvestDate(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string {
    const plantingDate = new Date(this.calculatePlantingDate(crop, weatherAnalysis));
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(plantingDate.getDate() + crop.season.duration);
    
    return harvestDate.toISOString().split('T')[0];
  }

  private getPlantingWindow(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string {
    return `${crop.season.planting.join(' or ')} season`;
  }

  private getExpectedHarvest(crop: CropInfo): string {
    return `${crop.season.duration} days to maturity`;
  }

  private generateDescription(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string {
    return `${crop.scientificName} is a ${crop.category} crop suitable for ${weatherAnalysis.climateZone} climates.`;
  }

  private generatePlantingTips(crop: CropInfo, weatherAnalysis: WeatherAnalysis, options: RecommendationOptions): string[] {
    const tips: string[] = [];
    
    if (options.experienceLevel === 'beginner') {
      tips.push(`Start with a small plot to gain experience with ${crop.name}`);
    }
    
    if (weatherAnalysis.totalRainfall < crop.climate.rainfall.min / 52 * 7) {
      tips.push('Plan for supplemental irrigation due to low rainfall');
    }
    
    if (weatherAnalysis.averageTemperature < crop.climate.temperature.optimal.min) {
      tips.push('Consider using row covers or greenhouse for temperature protection');
    }
    
    return tips;
  }

  private generateGeneralTips(crop: CropInfo, weatherAnalysis: WeatherAnalysis): string[] {
    const tips: string[] = [];
    
    tips.push(`Ensure soil pH is between ${crop.soil.ph.min} and ${crop.soil.ph.max}`);
    tips.push(`Provide ${crop.requirements.sunlight} sunlight exposure`);
    
    if (crop.requirements.water === 'high' && weatherAnalysis.totalRainfall < 50) {
      tips.push('Install drip irrigation for water efficiency');
    }
    
    return tips;
  }

  private generateReasons(crop: CropInfo, suitability: any, weatherAnalysis: WeatherAnalysis): string[] {
    const reasons: string[] = [];
    
    if (suitability.factors.temperature > 80) {
      reasons.push('Excellent temperature match for optimal growth');
    }
    
    if (suitability.factors.rainfall > 70) {
      reasons.push('Good rainfall compatibility reduces irrigation needs');
    }
    
    if (weatherAnalysis.season && crop.season.planting.includes(weatherAnalysis.season)) {
      reasons.push('Perfect planting season timing');
    }
    
    return reasons;
  }

  private generateWarnings(crop: CropInfo, suitability: any, weatherAnalysis: WeatherAnalysis): string[] {
    const warnings: string[] = [];
    
    if (suitability.factors.temperature < 50) {
      warnings.push('Temperature conditions may stress the plants');
    }
    
    if (suitability.factors.rainfall < 40) {
      warnings.push('Low rainfall may require significant irrigation');
    }
    
    if (!weatherAnalysis.growingSeason) {
      warnings.push('Outside typical growing season - consider protected cultivation');
    }
    
    return warnings;
  }
}

// Singleton instance
let cropRecommendationService: CropRecommendationService | null = null;

export const getCropRecommendationService = (): CropRecommendationService => {
  if (!cropRecommendationService) {
    cropRecommendationService = new CropRecommendationService();
  }
  return cropRecommendationService;
};
