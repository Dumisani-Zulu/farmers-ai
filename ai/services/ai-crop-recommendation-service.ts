/**
 * AI-Generated Crop Recommendation Service
 * Uses Gemini AI to dynamically generate crop suggestions based on weather data
 */

import { getGeminiService } from './gemini-service';
import { 
  analyzeWeatherData, 
  WeatherData, 
  WeatherAnalysis 
} from '../utils/weather-analysis';

export interface AICropRecommendation {
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
  detailedReasoning?: string;
  actionablePlan?: {
    landPreparation: string;
    plantingAdvice: string;
    earlyManagement: string;
  };
}

export interface AICropSuggestion {
  name: string;
  reasoning: string;
  description: string;
  temperatureSuitability: string;
  rainfallSuitability: string;
  sunlightRequirements: string;
  pestDiseaseOutlook: string;
  actionablePlan: {
    landPreparation: string;
    plantingAdvice: string;
    earlyManagement: string;
  };
}

export interface RecommendationOptions {
  maxRecommendations?: number;
  minSuitabilityScore?: number;
  preferredCategories?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  farmSize?: 'small' | 'medium' | 'large';
  marketFocus?: 'subsistence' | 'local' | 'commercial';
  language?: string;
}

export class AICropRecommendationService {
  private geminiService = getGeminiService();

  /**
   * Get AI-generated crop recommendations based on weather data
   */
  async getRecommendations(
    weatherData: WeatherData,
    options: RecommendationOptions = {}
  ): Promise<AICropRecommendation[]> {
    console.log('🌾 Starting AI crop recommendation process...');
    
    try {
      // Analyze weather data
      console.log('📊 Analyzing weather data...');
      const weatherAnalysis = analyzeWeatherData(weatherData);
      console.log('✅ Weather analysis completed:', {
        temperature: weatherAnalysis.averageTemperature,
        season: weatherAnalysis.season,
        climateZone: weatherAnalysis.climateZone
      });
      
      // Generate AI crop suggestions
      console.log('🤖 Generating AI crop suggestions...');
      const aiSuggestions = await this.generateAICropSuggestions(
        weatherData,
        weatherAnalysis,
        options
      );
      console.log(`✅ Generated ${aiSuggestions.length} AI suggestions`);
      
      // Convert AI suggestions to recommendation format
      console.log('🔄 Converting suggestions to recommendations...');
      const recommendations = this.convertToRecommendations(
        aiSuggestions,
        weatherAnalysis,
        weatherData,
        options
      );
      
      // Sort by suitability score and return top recommendations
      const maxRecommendations = options.maxRecommendations || 10;
      const minScore = options.minSuitabilityScore || 40;
      
      const finalRecommendations = recommendations
        .filter(crop => crop.suitabilityScore >= minScore)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .slice(0, maxRecommendations);
      
      console.log(`🎯 Returning ${finalRecommendations.length} final recommendations`);
      return finalRecommendations;
        
    } catch (error) {
      console.error('❌ Error getting AI crop recommendations:', error);
      
      // If AI fails, try to return fallback recommendations
      try {
        console.log('🔄 Attempting fallback recommendations...');
        const weatherAnalysis = analyzeWeatherData(weatherData);
        const fallbackSuggestions = this.getFallbackSuggestions(weatherAnalysis);
        const fallbackRecommendations = this.convertToRecommendations(
          fallbackSuggestions,
          weatherAnalysis,
          weatherData,
          options
        );
        
        console.log(`🛡️ Returning ${fallbackRecommendations.length} fallback recommendations`);
        return fallbackRecommendations.slice(0, options.maxRecommendations || 6);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw new Error('Failed to generate crop recommendations');
      }
    }
  }

  /**
   * Generate AI crop suggestions using structured prompt
   */
  private async generateAICropSuggestions(
    weatherData: WeatherData,
    weatherAnalysis: WeatherAnalysis,
    options: RecommendationOptions
  ): Promise<AICropSuggestion[]> {
    const currentDate = new Date().toISOString().split('T')[0];
    const location = this.formatLocation(weatherData.location);
    const forecastSummary = this.formatForecastData(weatherData);

    const prompt = `You are an expert agricultural advisor. Based on the provided weather data and location, suggest suitable crops for farming.

**IMPORTANT: The entire response MUST be in ${options.language || 'English'}.**

Current Date: ${currentDate}
Location: ${location}
Weather Analysis:
- Average Temperature: ${weatherAnalysis.averageTemperature.toFixed(1)}°C
- Temperature Range: ${weatherAnalysis.temperatureRange.min}°C to ${weatherAnalysis.temperatureRange.max}°C
- Total Rainfall (7-day): ${weatherAnalysis.totalRainfall}mm
- Average Humidity: ${weatherAnalysis.averageHumidity.toFixed(1)}%
- Season: ${weatherAnalysis.season}
- Climate Zone: ${weatherAnalysis.climateZone}
- Growing Season: ${weatherAnalysis.growingSeason ? 'Yes' : 'No'}

Current Weather: ${weatherData.current.condition} - ${weatherData.current.description}
Temperature: ${weatherData.current.temperature}°C

14-Day Forecast Summary:
${forecastSummary}

Farmer Profile:
- Experience Level: ${options.experienceLevel || 'intermediate'}
- Farm Size: ${options.farmSize || 'medium'}
- Market Focus: ${options.marketFocus || 'local'}

Please suggest 4-6 diverse crops suitable for these conditions. Include a variety: cereals, vegetables, legumes, and other crops suitable for the climate. Do NOT limit to just staple crops.

For each crop, provide a JSON response with this structure:
{
  "suggestedCrops": [
    {
      "name": "Crop Name",
      "reasoning": "Comprehensive markdown-formatted reasoning with sections:
        ## Detailed Description
        Brief overview and characteristics
        
        ## Why It's a Good Match For This Forecast
        ### Temperature Suitability
        Analysis of temperature compatibility
        ### Rainfall and Water Needs  
        Water requirements vs forecast
        ### Sunlight Exposure
        Light requirements analysis
        ### Pest & Disease Outlook
        Disease/pest pressure based on weather
        
        ## Actionable Farming Plan (14-Day Guide)
        ### Land Preparation
        Specific preparation steps tied to forecast
        ### Planting Advice
        Best planting days within 14-day window
        ### Early Management & Nutrition
        Watering, weeding, fertilizer recommendations"
    }
  ]
}

Respond with valid JSON only.`;

    try {
      console.log('📤 Sending request to Gemini AI...');
      const response = await this.geminiService.generateStructuredData<{
        suggestedCrops: {
          name: string;
          reasoning: string;
        }[];
      }>(prompt, 'JSON object with suggestedCrops array');
      
      console.log('📥 Received response from Gemini AI:', response);
      
      const parsedSuggestions = this.parseAIResponse(response);
      console.log(`✅ Parsed ${parsedSuggestions.length} crop suggestions from AI`);
      
      return parsedSuggestions;
    } catch (error) {
      console.error('❌ Error generating AI crop suggestions:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        geminiConfigured: this.geminiService.isConfigured()
      });
      
      // Fallback to basic suggestions if AI fails
      console.log('🔄 Using fallback suggestions due to AI error');
      return this.getFallbackSuggestions(weatherAnalysis);
    }
  }

  /**
   * Parse AI response and extract structured crop suggestions
   */
  private parseAIResponse(response: any): AICropSuggestion[] {
    try {
      const crops = response.suggestedCrops || [];
      
      return crops.map((crop: any) => {
        const reasoning = crop.reasoning || '';
        
        // Extract sections from markdown reasoning
        const sections = this.parseMarkdownSections(reasoning);
        
        return {
          name: crop.name,
          reasoning: reasoning,
          description: sections.description || `${crop.name} is recommended based on current weather conditions.`,
          temperatureSuitability: sections.temperatureSuitability || 'Temperature conditions are suitable for growth.',
          rainfallSuitability: sections.rainfallSuitability || 'Rainfall levels match crop requirements.',
          sunlightRequirements: sections.sunlightRequirements || 'Adequate sunlight available for photosynthesis.',
          pestDiseaseOutlook: sections.pestDiseaseOutlook || 'Monitor for common pests and diseases.',
          actionablePlan: {
            landPreparation: sections.landPreparation || 'Prepare land according to crop requirements.',
            plantingAdvice: sections.plantingAdvice || 'Plant during favorable weather windows.',
            earlyManagement: sections.earlyManagement || 'Provide adequate water and nutrients.',
          },
        };
      });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Parse markdown sections from AI reasoning
   */
  private parseMarkdownSections(reasoning: string): any {
    const sections: any = {};
    
    // Extract description
    const descMatch = reasoning.match(/## Detailed Description\s*\n(.*?)(?=\n##|$)/s);
    if (descMatch) sections.description = descMatch[1].trim();
    
    // Extract temperature suitability
    const tempMatch = reasoning.match(/### Temperature Suitability\s*\n(.*?)(?=\n###|$)/s);
    if (tempMatch) sections.temperatureSuitability = tempMatch[1].trim();
    
    // Extract rainfall suitability
    const rainMatch = reasoning.match(/### Rainfall and Water Needs\s*\n(.*?)(?=\n###|$)/s);
    if (rainMatch) sections.rainfallSuitability = rainMatch[1].trim();
    
    // Extract sunlight requirements
    const sunMatch = reasoning.match(/### Sunlight Exposure\s*\n(.*?)(?=\n###|$)/s);
    if (sunMatch) sections.sunlightRequirements = sunMatch[1].trim();
    
    // Extract pest/disease outlook
    const pestMatch = reasoning.match(/### Pest & Disease Outlook\s*\n(.*?)(?=\n###|$)/s);
    if (pestMatch) sections.pestDiseaseOutlook = pestMatch[1].trim();
    
    // Extract actionable plan sections
    const landPrepMatch = reasoning.match(/### Land Preparation\s*\n(.*?)(?=\n###|$)/s);
    if (landPrepMatch) sections.landPreparation = landPrepMatch[1].trim();
    
    const plantingMatch = reasoning.match(/### Planting Advice\s*\n(.*?)(?=\n###|$)/s);
    if (plantingMatch) sections.plantingAdvice = plantingMatch[1].trim();
    
    const managementMatch = reasoning.match(/### Early Management & Nutrition\s*\n(.*?)(?=\n###|$)/s);
    if (managementMatch) sections.earlyManagement = managementMatch[1].trim();
    
    return sections;
  }

  /**
   * Convert AI suggestions to recommendation format
   */
  private convertToRecommendations(
    aiSuggestions: AICropSuggestion[],
    weatherAnalysis: WeatherAnalysis,
    weatherData: WeatherData,
    options: RecommendationOptions
  ): AICropRecommendation[] {
    return aiSuggestions.map((suggestion, index) => {
      const suitabilityScore = this.calculateAISuitabilityScore(suggestion, weatherAnalysis);
      const cropId = this.generateCropId(suggestion.name);
      
      return {
        id: cropId,
        name: suggestion.name,
        variety: this.extractVariety(suggestion.name),
        plantingDate: this.calculatePlantingDate(weatherAnalysis),
        harvestDate: this.calculateHarvestDate(weatherAnalysis, 90), // Default 90 days
        plantingWindow: this.getPlantingWindow(weatherAnalysis),
        expectedHarvest: '90-120 days to maturity',
        description: suggestion.description,
        growthStage: 'planning',
        plantingTips: this.extractPlantingTips(suggestion.actionablePlan.plantingAdvice),
        requirements: this.generateRequirements(weatherAnalysis),
        benefits: this.extractBenefits(suggestion.reasoning),
        challenges: this.extractChallenges(suggestion.reasoning),
        tips: this.extractTips(suggestion.actionablePlan),
        reasons: this.extractReasons(suggestion.temperatureSuitability, suggestion.rainfallSuitability),
        warnings: this.extractWarnings(suggestion.pestDiseaseOutlook),
        suitabilityScore,
        weatherCompatibility: {
          temperature: suitabilityScore * 0.8, // Simplified scoring
          rainfall: suitabilityScore * 0.9,
          overall: suitabilityScore,
        },
        aiInsights: suggestion.reasoning,
        detailedReasoning: suggestion.reasoning,
        actionablePlan: suggestion.actionablePlan,
      };
    });
  }

  /**
   * Fallback suggestions when AI fails
   */
  private getFallbackSuggestions(weatherAnalysis: WeatherAnalysis): AICropSuggestion[] {
    const fallbackCrops = [
      {
        name: 'Maize',
        reasoning: 'Maize is a versatile cereal crop suitable for various climate conditions.',
      },
      {
        name: 'Beans',
        reasoning: 'Beans are nitrogen-fixing legumes that improve soil fertility.',
      },
      {
        name: 'Tomatoes',
        reasoning: 'Tomatoes are high-value vegetables suitable for market gardens.',
      },
    ];

    return fallbackCrops.map(crop => ({
      name: crop.name,
      reasoning: crop.reasoning,
      description: crop.reasoning,
      temperatureSuitability: 'Suitable for current temperature range.',
      rainfallSuitability: 'Adequate rainfall for growth.',
      sunlightRequirements: 'Requires full sun exposure.',
      pestDiseaseOutlook: 'Monitor for common pests.',
      actionablePlan: {
        landPreparation: 'Prepare well-drained soil.',
        plantingAdvice: 'Plant during favorable weather.',
        earlyManagement: 'Water regularly and apply fertilizer.',
      },
    }));
  }

  // Helper methods
  private formatLocation(location: any): string {
    return `${location.city || 'Unknown'}, ${location.region || location.country || 'Unknown'}`;
  }

  private formatForecastData(weatherData: WeatherData): string {
    return weatherData.forecast.slice(0, 7).map(day => 
      `${day.date}: ${day.condition}, ${day.temperature.min}-${day.temperature.max}°C, ${day.precipitation}mm rain`
    ).join('\n');
  }

  private formatHistoricalContext(weatherAnalysis: WeatherAnalysis): string {
    return `Climate: ${weatherAnalysis.climateZone}, Season: ${weatherAnalysis.season}`;
  }

  private calculateAISuitabilityScore(suggestion: AICropSuggestion, weatherAnalysis: WeatherAnalysis): number {
    // Simple scoring based on AI reasoning content quality
    let score = 60; // Base score
    
    if (suggestion.reasoning.length > 500) score += 20; // Detailed reasoning
    if (suggestion.actionablePlan.landPreparation.length > 50) score += 10; // Detailed plan
    if (weatherAnalysis.growingSeason) score += 10; // Growing season bonus
    
    return Math.min(100, score);
  }

  private generateCropId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }

  private extractVariety(name: string): string | undefined {
    // Extract variety if mentioned in parentheses
    const match = name.match(/\((.*?)\)/);
    return match ? match[1] : undefined;
  }

  private calculatePlantingDate(weatherAnalysis: WeatherAnalysis): string {
    const currentDate = new Date();
    const plantingDate = new Date(currentDate);
    
    if (weatherAnalysis.growingSeason) {
      plantingDate.setDate(currentDate.getDate() + 7); // Next week
    } else {
      plantingDate.setMonth(currentDate.getMonth() + 2); // Next season
    }
    
    return plantingDate.toISOString().split('T')[0];
  }

  private calculateHarvestDate(weatherAnalysis: WeatherAnalysis, duration: number): string {
    const plantingDate = new Date(this.calculatePlantingDate(weatherAnalysis));
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(plantingDate.getDate() + duration);
    
    return harvestDate.toISOString().split('T')[0];
  }

  private getPlantingWindow(weatherAnalysis: WeatherAnalysis): string {
    return `${weatherAnalysis.season} season`;
  }

  private generateRequirements(weatherAnalysis: WeatherAnalysis): any {
    return {
      temperature: { 
        min: weatherAnalysis.temperatureRange.min - 5, 
        max: weatherAnalysis.temperatureRange.max + 5 
      },
      rainfall: { min: 400, max: 1200 },
      humidity: { min: 40, max: 80 },
      soilType: ['loamy', 'sandy-loam'],
      soilPH: { min: 6.0, max: 7.5 },
      sunlight: 'full',
    };
  }

  private extractPlantingTips(plantingAdvice: string): string[] {
    // Extract bullet points or numbered items from advice
    const tips = plantingAdvice.split(/[.!?]/).filter(tip => tip.length > 10);
    return tips.slice(0, 3); // Return top 3 tips
  }

  private extractBenefits(reasoning: string): string[] {
    // Look for positive indicators in reasoning
    const benefits = ['Suitable for current climate', 'Good market potential', 'Adaptable to conditions'];
    return benefits;
  }

  private extractChallenges(reasoning: string): string[] {
    // Look for challenges mentioned in reasoning
    const challenges = ['Monitor weather conditions', 'Proper water management needed', 'Pest control important'];
    return challenges;
  }

  private extractTips(actionablePlan: any): string[] {
    return [
      actionablePlan.landPreparation.substring(0, 100) + '...',
      actionablePlan.plantingAdvice.substring(0, 100) + '...',
      actionablePlan.earlyManagement.substring(0, 100) + '...',
    ].filter(tip => tip.length > 10);
  }

  private extractReasons(tempSuitability: string, rainSuitability: string): string[] {
    return [
      tempSuitability.substring(0, 100) + '...',
      rainSuitability.substring(0, 100) + '...',
    ].filter(reason => reason.length > 10);
  }

  private extractWarnings(pestOutlook: string): string[] {
    return [pestOutlook.substring(0, 100) + '...'].filter(warning => warning.length > 10);
  }
}

// Singleton instance
let aiCropRecommendationService: AICropRecommendationService | null = null;

export const getAICropRecommendationService = (): AICropRecommendationService => {
  if (!aiCropRecommendationService) {
    aiCropRecommendationService = new AICropRecommendationService();
  }
  return aiCropRecommendationService;
};
