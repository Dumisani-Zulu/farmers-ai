import * as tf from '@tensorflow/tfjs';
import { tensorFlowService } from './tensorflow';
import { geminiAI } from './gemini-ai';

// Types for agricultural AI services
export interface CropAnalysisInput {
  imageData?: ImageData | HTMLCanvasElement | HTMLImageElement;
  cropType?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  soilData?: {
    ph: number;
    moisture: number;
    temperature: number;
  };
}

export interface CropAnalysisResult {
  healthScore: number;
  diseases: Array<{
    name: string;
    confidence: number;
    treatment: string;
  }>;
  recommendations: string[];
  aiInsights: string;
}

export interface WeatherPredictionInput {
  location: {
    latitude: number;
    longitude: number;
  };
  historicalData?: number[][];
  cropType?: string;
}

export interface WeatherPredictionResult {
  forecast: Array<{
    date: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    confidence: number;
  }>;
  farmingAdvice: string;
}

class AgricultureAIService {
  private cropHealthModel: tf.LayersModel | null = null;
  private weatherModel: tf.LayersModel | null = null;

  async initialize(): Promise<void> {
    // Initialize TensorFlow
    await tensorFlowService.initialize();
    
    // Initialize Gemini AI
    try {
      await geminiAI.initialize();
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.warn('⚠️ Gemini AI initialization failed, using mock responses:', error);
    }
    
    console.log('Agriculture AI Service initialized');
  }

  /**
   * Analyze crop health using image recognition and AI insights
   */
  async analyzeCropHealth(input: CropAnalysisInput): Promise<CropAnalysisResult> {
    let imageAnalysis = null;
    
    // If image is provided, analyze with TensorFlow
    if (input.imageData && tensorFlowService.isInitialized()) {
      try {
        const preprocessed = tensorFlowService.preprocessImage(input.imageData);
        
        // Mock crop health analysis (replace with actual model)
        const healthScore = Math.random() * 100;
        
        imageAnalysis = {
          healthScore,
          diseases: healthScore < 70 ? [
            {
              name: 'Leaf Blight',
              confidence: 0.8,
              treatment: 'Apply fungicide spray'
            }
          ] : [],
        };
        
        tensorFlowService.dispose(preprocessed);
      } catch (error) {
        console.error('Image analysis failed:', error);
      }
    }

    // Generate AI insights using Gemini AI if available, otherwise use mock
    let aiInsights: string;
    
    if (geminiAI.isReady()) {
      try {
        aiInsights = await geminiAI.generateCropAnalysis({
          cropType: input.cropType,
          location: input.location,
          soilData: input.soilData,
          imageDescription: imageAnalysis ? `Health score: ${imageAnalysis.healthScore.toFixed(1)}/100` : undefined,
        });
      } catch (error) {
        console.error('Gemini AI failed, using fallback:', error);
        aiInsights = this.getMockCropInsights(input, imageAnalysis);
      }
    } else {
      aiInsights = this.getMockCropInsights(input, imageAnalysis);
    }

    return {
      healthScore: imageAnalysis?.healthScore || 85,
      diseases: imageAnalysis?.diseases || [],
      recommendations: [
        'Monitor soil moisture levels daily',
        'Apply organic fertilizer next week',
        'Check for pest activity',
        'Implement crop rotation plan',
      ],
      aiInsights: aiInsights,
    };
  }

  /**
   * Generate seasonal farming advice
   */
  async getSeasonalAdvice(cropType: string, location: { latitude: number; longitude: number }): Promise<string> {
    if (geminiAI.isReady()) {
      try {
        return await geminiAI.generateSeasonalAdvice(cropType, location);
      } catch (error) {
        console.error('Gemini AI failed, using fallback:', error);
      }
    }
    
    // Fallback to mock advice
    const currentDate = new Date();
    const season = this.getCurrentSeason(location.latitude);
    
    return `Seasonal Farming Advice for ${cropType}
Location: ${location.latitude}°N, ${location.longitude}°W
Current Season: ${season}
Date: ${currentDate.toLocaleDateString()}

${season === 'Spring' ? `Spring Recommendations:
• Prepare seedbeds and soil testing
• Begin planting after last frost date
• Apply pre-emergent fertilizers
• Monitor for early pest emergence` : ''}

${season === 'Summer' ? `Summer Recommendations:
• Maintain consistent irrigation
• Monitor for heat stress in crops
• Apply post-emergent herbicides if needed
• Implement integrated pest management` : ''}

${season === 'Fall' ? `Fall Recommendations:
• Prepare for harvest season
• Apply winter fertilizers
• Plan cover crop planting
• Equipment maintenance and storage prep` : ''}

${season === 'Winter' ? `Winter Recommendations:
• Plan next year's crop rotation
• Order seeds and supplies
• Maintain and repair equipment
• Monitor stored crops for quality` : ''}

Weather Considerations:
• Monitor extended forecasts for planning
• Adjust irrigation based on precipitation
• Protect crops from extreme weather events

Pest and Disease Prevention:
• Scout fields regularly for early detection
• Maintain crop residue management
• Consider beneficial insect habitats`;
  }

  /**
   * Predict weather patterns for farming decisions
   */
  async predictWeather(input: WeatherPredictionInput): Promise<WeatherPredictionResult> {
    // Mock weather prediction (replace with actual ML model)
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      precipitation: Math.random() * 10,
      confidence: 0.7 + Math.random() * 0.3,
    }));

    let farmingAdvice: string;
    
    if (geminiAI.isReady()) {
      try {
        farmingAdvice = await geminiAI.generateWeatherBasedAdvice(forecast, input.cropType);
      } catch (error) {
        console.error('Gemini AI failed, using fallback:', error);
        farmingAdvice = this.getMockWeatherAdvice(forecast, input.cropType);
      }
    } else {
      farmingAdvice = this.getMockWeatherAdvice(forecast, input.cropType);
    }

    return {
      forecast,
      farmingAdvice,
    };
  }

  private getCurrentSeason(latitude: number): string {
    const month = new Date().getMonth();
    const isNorthern = latitude > 0;
    
    if (isNorthern) {
      if (month >= 2 && month <= 4) return 'Spring';
      if (month >= 5 && month <= 7) return 'Summer';
      if (month >= 8 && month <= 10) return 'Fall';
      return 'Winter';
    } else {
      if (month >= 2 && month <= 4) return 'Fall';
      if (month >= 5 && month <= 7) return 'Winter';
      if (month >= 8 && month <= 10) return 'Spring';
      return 'Summer';
    }
  }

  private getMockCropInsights(input: CropAnalysisInput, imageAnalysis: any): string {
    return `Based on the provided data for ${input.cropType || 'your crop'}:

Location Analysis: ${input.location ? `Coordinates ${input.location.latitude}, ${input.location.longitude}` : 'Location not provided'}

Soil Conditions:
- pH Level: ${input.soilData?.ph || 'Unknown'} ${input.soilData?.ph ? (input.soilData.ph < 6 ? '(Acidic - consider lime application)' : input.soilData.ph > 7.5 ? '(Alkaline - monitor nutrient availability)' : '(Optimal range)') : ''}
- Moisture: ${input.soilData?.moisture || 'Unknown'}% ${input.soilData?.moisture ? (input.soilData.moisture < 30 ? '(Low - increase irrigation)' : input.soilData.moisture > 80 ? '(High - improve drainage)' : '(Good level)') : ''}
- Temperature: ${input.soilData?.temperature || 'Unknown'}°C

${imageAnalysis ? `Image Analysis indicates a health score of ${imageAnalysis.healthScore.toFixed(1)}/100.` : 'No image provided for visual analysis.'}

Recommendations:
1. Monitor weather patterns for optimal planting/harvesting windows
2. Implement integrated pest management strategies
3. Consider soil testing for nutrient deficiencies
4. Maintain proper irrigation schedules based on soil moisture`;
  }

  private getMockWeatherAdvice(forecast: Array<{date: string; temperature: number; humidity: number; precipitation: number; confidence: number}>, cropType?: string): string {
    return `Weather-Based Farming Advice for ${cropType || 'your crops'}:

7-Day Forecast Summary:
${forecast.map(day => 
  `${day.date}: ${day.temperature.toFixed(1)}°C, ${day.humidity.toFixed(1)}% humidity, ${day.precipitation.toFixed(1)}mm rain`
).join('\n')}

Irrigation Recommendations:
• ${forecast.reduce((acc, day) => acc + day.precipitation, 0) > 20 ? 'Reduce irrigation due to expected rainfall' : 'Maintain regular irrigation schedule'}
• Monitor soil moisture levels daily

Planting Recommendations:
• ${forecast.some(day => day.temperature < 5) ? 'Delay planting due to frost risk' : 'Conditions suitable for planting'}
• Consider crop protection if temperature extremes expected

Harvesting Recommendations:
• ${forecast.some(day => day.precipitation > 5) ? 'Plan harvest activities before expected rain' : 'Good conditions for harvest activities'}
• Monitor crop maturity indicators`;
  }

  /**
   * Get personalized farming recommendations
   */
  async getPersonalizedRecommendations(
    farmerProfile: {
      experience: string;
      farmSize: string;
      cropTypes: string[];
      location: { latitude: number; longitude: number };
      resources: string[];
    }
  ): Promise<string> {
    if (geminiAI.isReady()) {
      try {
        return await geminiAI.generatePersonalizedRecommendations(farmerProfile);
      } catch (error) {
        console.error('Gemini AI failed, using fallback:', error);
      }
    }
    
    // Fallback to mock recommendations
    return `Personalized Farming Recommendations

Farmer Profile:
• Experience Level: ${farmerProfile.experience}
• Farm Size: ${farmerProfile.farmSize}
• Primary Crops: ${farmerProfile.cropTypes.join(', ')}
• Location: ${farmerProfile.location.latitude}°N, ${farmerProfile.location.longitude}°W
• Available Resources: ${farmerProfile.resources.join(', ')}

Crop Rotation Suggestions:
${farmerProfile.cropTypes.includes('Corn') && farmerProfile.cropTypes.includes('Soybeans') ? 
  '• Implement corn-soybean rotation for nitrogen fixation' : 
  '• Consider adding legumes to rotation for soil health'}
• Rotate crop families to break pest and disease cycles
• Include cover crops during fallow periods

Resource Optimization:
${farmerProfile.resources.includes('Tractor') ? 
  '• Optimize field operations with GPS guidance systems' : 
  '• Consider equipment sharing or custom services'}
${farmerProfile.resources.includes('Irrigation System') ? 
  '• Implement precision irrigation scheduling' : 
  '• Explore water-efficient irrigation options'}

Technology Recommendations:
${farmerProfile.experience === 'Beginner' ? 
  '• Start with basic soil testing and weather monitoring\n• Consider farm management software for record keeping' :
  '• Explore precision agriculture technologies\n• Consider drone scouting for large fields'}

Market Insights:
• Diversify crop portfolio to reduce risk
• Consider value-added processing opportunities
• Explore direct-to-consumer marketing channels

Sustainability Practices:
• Implement soil health monitoring
• Reduce chemical inputs through IPM
• Consider renewable energy for farm operations
• Maintain wildlife habitat areas`;
  }
}

export const agricultureAI = new AgricultureAIService();
export default agricultureAI;
