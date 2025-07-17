import { GeminiAIService as GeminiService } from '../services/gemini-service';
import { TensorFlowService } from '../services/tensorflow-service';

export interface IrrigationInput {
  cropType: string;
  fieldArea: number;
  soilType: string;
  temperature: number;
  humidity?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    region?: string;
  };
}

export interface IrrigationRecommendation {
  dailyWaterNeed: number;
  weeklyWaterNeed: number;
  irrigationFrequency: string;
  recommendedDuration: string;
  confidence: number;
  analysis: {
    cropWaterRequirement: string;
    soilAnalysis: string;
    weatherImpact: string;
    seasonalConsiderations: string;
    costEstimation?: string;
    sustainabilityTips: string[];
    riskFactors: string[];
    optimizationSuggestions: string[];
  };
  schedule: {
    morningSession?: string;
    eveningSession?: string;
    weeklyPattern: string[];
  };
  monitoring: {
    soilMoistureThreshold: string;
    plantStressIndicators: string[];
    adjustmentTriggers: string[];
  };
}

export class IrrigationAIService {
  private geminiService: GeminiService;
  private tensorFlowService: TensorFlowService;

  constructor() {
    this.geminiService = new GeminiService();
    this.tensorFlowService = new TensorFlowService();
  }

  async calculateIrrigationRecommendation(input: IrrigationInput): Promise<IrrigationRecommendation> {
    try {
      // Validate input
      this.validateInput(input);

      // Get TensorFlow prediction for water requirements
      const tensorFlowPrediction = await this.getTensorFlowPrediction(input);

      // Get comprehensive analysis from Gemini
      const geminiAnalysis = await this.getGeminiAnalysis(input, tensorFlowPrediction);

      // Combine results
      return this.combineRecommendations(input, tensorFlowPrediction, geminiAnalysis);
    } catch (error) {
      console.error('Error calculating irrigation recommendation:', error);
      throw new Error('Failed to calculate irrigation recommendation');
    }
  }

  private validateInput(input: IrrigationInput): void {
    if (!input.cropType || input.cropType.trim() === '') {
      throw new Error('Crop type is required');
    }
    if (!input.fieldArea || input.fieldArea <= 0) {
      throw new Error('Valid field area is required');
    }
    if (!input.soilType || input.soilType.trim() === '') {
      throw new Error('Soil type is required');
    }
    if (!input.temperature || input.temperature < -50 || input.temperature > 60) {
      throw new Error('Valid temperature is required');
    }
    if (input.humidity && (input.humidity < 0 || input.humidity > 100)) {
      throw new Error('Humidity must be between 0 and 100');
    }
  }

  private async getTensorFlowPrediction(input: IrrigationInput): Promise<any> {
    // For now, we'll use a sophisticated calculation algorithm
    // until TensorFlow models are properly set up
    const features = this.prepareFeatures(input);
    
    // Calculate base water need using multiple factors
    let dailyWaterNeed = this.calculateBaseWaterNeed(input);
    
    // Apply ML-style adjustments based on features
    const adjustmentFactor = this.calculateMLAdjustments(features);
    dailyWaterNeed *= adjustmentFactor;
    
    return {
      dailyWaterNeed: Math.round(dailyWaterNeed),
      weeklyWaterNeed: Math.round(dailyWaterNeed * 7),
      confidence: 0.85, // Base confidence for calculation-based prediction
      irrigationFrequency: this.determineFrequency(input.soilType, dailyWaterNeed),
      recommendedDuration: this.calculateDuration(input.soilType, dailyWaterNeed, input.fieldArea)
    };
  }

  private calculateBaseWaterNeed(input: IrrigationInput): number {
    // Base water requirements per crop type (liters per m² per day)
    const cropWaterRequirements: { [key: string]: number } = {
      'rice': 40,
      'tomatoes': 30,
      'tomato': 30,
      'maize': 25,
      'corn': 25,
      'wheat': 22,
      'potatoes': 20,
      'potato': 20,
      'beans': 18,
      'bean': 18,
      'lettuce': 15,
      'carrot': 18,
      'onion': 20,
      'pepper': 25,
      'cucumber': 35,
      'spinach': 12,
      'cabbage': 20
    };

    // Get base requirement, default to 25 if crop not found
    const cropKey = input.cropType.toLowerCase();
    let baseWaterNeed = cropWaterRequirements[cropKey] || 25;

    // Apply environmental factors
    const temp = input.temperature;
    const humidity = input.humidity || 50;

    // Temperature adjustments
    if (temp > 35) baseWaterNeed *= 1.4;
    else if (temp > 30) baseWaterNeed *= 1.3;
    else if (temp > 25) baseWaterNeed *= 1.1;
    else if (temp < 15) baseWaterNeed *= 0.8;
    else if (temp < 10) baseWaterNeed *= 0.6;

    // Humidity adjustments
    if (humidity < 30) baseWaterNeed *= 1.3;
    else if (humidity < 40) baseWaterNeed *= 1.2;
    else if (humidity > 80) baseWaterNeed *= 0.8;
    else if (humidity > 70) baseWaterNeed *= 0.9;

    // Soil type adjustments
    switch (input.soilType.toLowerCase()) {
      case 'sandy':
        baseWaterNeed *= 1.2;
        break;
      case 'clay':
        baseWaterNeed *= 0.9;
        break;
      case 'silty':
        baseWaterNeed *= 1.1;
        break;
      case 'loamy':
      default:
        baseWaterNeed *= 1.0;
        break;
    }

    return baseWaterNeed * input.fieldArea;
  }

  private calculateMLAdjustments(features: number[]): number {
    // Simulate ML-style feature-based adjustments
    const [cropEncoding, fieldArea, soilEncoding, temperature, humidity, seasonalFactor, latitude, longitude] = features;
    
    let adjustment = 1.0;
    
    // Crop type adjustments based on encoding
    if (cropEncoding === 3) adjustment *= 1.2; // Rice needs more water
    else if (cropEncoding === 4) adjustment *= 1.1; // Tomatoes need moderate extra water
    
    // Soil type adjustments based on encoding
    if (soilEncoding === 2) adjustment *= 1.1; // Sandy soil
    else if (soilEncoding === 1) adjustment *= 0.95; // Clay soil
    
    // Temperature and humidity fine-tuning
    if (temperature > 35 && humidity < 40) adjustment *= 1.15; // Hot and dry
    else if (temperature < 15 && humidity > 70) adjustment *= 0.85; // Cool and humid
    
    // Location-based adjustments (if available)
    if (latitude !== 0 && longitude !== 0) {
      // Tropical regions (near equator) need more water
      const latitudeEffect = Math.abs(latitude) < 20 ? 1.1 : 1.0;
      adjustment *= latitudeEffect;
    }
    
    // Seasonal factor integration
    adjustment *= seasonalFactor;
    
    // Field size efficiency factor
    if (fieldArea > 10000) adjustment *= 0.95; // Large fields are more efficient
    else if (fieldArea < 100) adjustment *= 1.05; // Small fields need more per unit
    
    return adjustment;
  }

  private prepareFeatures(input: IrrigationInput): number[] {
    // Encode categorical variables to numerical
    const cropEncoding = this.encodeCropType(input.cropType);
    const soilEncoding = this.encodeSoilType(input.soilType);
    
    return [
      cropEncoding,
      input.fieldArea,
      soilEncoding,
      input.temperature,
      input.humidity || 50,
      // Add seasonal factor (simplified)
      this.getSeasonalFactor(),
      // Add location factor if available
      input.location?.latitude || 0,
      input.location?.longitude || 0
    ];
  }

  private encodeCropType(cropType: string): number {
    // Convert crop type to a numerical encoding
    // Use a hash-like function for any crop type
    const lowerCrop = cropType.toLowerCase();
    
    // Define specific encodings for common crops
    const specificEncodings: { [key: string]: number } = {
      'maize': 1,
      'corn': 1,
      'wheat': 2,
      'rice': 3,
      'tomatoes': 4,
      'tomato': 4,
      'potatoes': 5,
      'potato': 5,
      'beans': 6,
      'bean': 6,
      'lettuce': 7,
      'carrot': 8,
      'onion': 9,
      'pepper': 10,
      'cucumber': 11,
      'spinach': 12,
      'cabbage': 13
    };
    
    // Return specific encoding if available
    if (specificEncodings[lowerCrop]) {
      return specificEncodings[lowerCrop];
    }
    
    // Generate a consistent encoding for unknown crops using string hash
    let hash = 0;
    for (let i = 0; i < lowerCrop.length; i++) {
      const char = lowerCrop.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Return a value between 1-20 for unknown crops
    return Math.abs(hash % 20) + 1;
  }

  private encodeSoilType(soilType: string): number {
    const encoding = {
      'Clay': 1,
      'Sandy': 2,
      'Loamy': 3,
      'Silty': 4
    };
    return encoding[soilType as keyof typeof encoding] || 3;
  }

  private getSeasonalFactor(): number {
    const month = new Date().getMonth() + 1;
    // Higher factor for summer months, lower for winter
    if (month >= 6 && month <= 8) return 1.2; // Summer
    if (month >= 12 || month <= 2) return 0.8; // Winter
    return 1.0; // Spring/Fall
  }

  private determineFrequency(soilType: string, dailyWaterNeed: number): string {
    if (soilType === 'Sandy') {
      return dailyWaterNeed > 50 ? 'Twice daily' : 'Daily';
    } else if (soilType === 'Clay') {
      return dailyWaterNeed > 100 ? 'Every 2 days' : 'Every 2-3 days';
    } else {
      return 'Daily';
    }
  }

  private calculateDuration(soilType: string, dailyWaterNeed: number, fieldArea: number): string {
    const waterPerMinute = this.getWaterFlowRate(soilType);
    const totalMinutes = Math.ceil(dailyWaterNeed / waterPerMinute);
    
    if (totalMinutes < 20) return '15-20 minutes';
    if (totalMinutes < 40) return '20-30 minutes';
    if (totalMinutes < 60) return '30-45 minutes';
    return '45-60 minutes';
  }

  private getWaterFlowRate(soilType: string): number {
    // Liters per minute absorption rate
    const rates = {
      'Sandy': 2.5,
      'Loamy': 2.0,
      'Silty': 1.5,
      'Clay': 1.0
    };
    return rates[soilType as keyof typeof rates] || 2.0;
  }

  private async getGeminiAnalysis(input: IrrigationInput, prediction: any): Promise<any> {
    const prompt = `
    As an agricultural irrigation expert, provide a comprehensive analysis for the following irrigation scenario:

    Crop: ${input.cropType}
    Field Area: ${input.fieldArea} m²
    Soil Type: ${input.soilType}
    Temperature: ${input.temperature}°C
    Humidity: ${input.humidity || 50}%
    Predicted Daily Water Need: ${prediction.dailyWaterNeed} liters
    Location: ${input.location?.region || 'Not specified'}

    Please provide detailed analysis covering:

    1. Crop Water Requirement Analysis:
       - Specific water needs for ${input.cropType}
       - Growth stage considerations
       - Optimal water distribution timing

    2. Soil Analysis Impact:
       - How ${input.soilType} soil affects water retention
       - Drainage characteristics
       - Root zone considerations

    3. Weather Impact Assessment:
       - Effect of ${input.temperature}°C temperature
       - Humidity impact on water loss
       - Evapotranspiration rates

    4. Seasonal Considerations:
       - Current season adjustments
       - Upcoming weather pattern considerations
       - Long-term planning recommendations

    5. Cost Estimation:
       - Estimated water costs
       - Energy costs for irrigation
       - Cost optimization strategies

    6. Sustainability Tips (provide 3-5 specific tips):
       - Water conservation methods
       - Soil health maintenance
       - Environmental impact reduction

    7. Risk Factors (identify 3-4 key risks):
       - Over-watering risks
       - Under-watering consequences
       - Weather-related risks
       - Soil degradation risks

    8. Optimization Suggestions (provide 4-6 actionable suggestions):
       - Technology recommendations
       - Timing optimizations
       - Monitoring strategies
       - Efficiency improvements

    9. Irrigation Schedule:
       - Best times for morning sessions
       - Evening session recommendations
       - Weekly pattern suggestions

    10. Monitoring Guidelines:
        - Soil moisture thresholds
        - Plant stress indicators to watch
        - When to adjust irrigation

    Format the response as a structured JSON object that can be easily parsed.
    `;

    const response = await this.geminiService.generateText(prompt);
    return this.parseGeminiResponse(response);
  }

  private parseGeminiResponse(response: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If not JSON, parse structured text response
      return this.parseStructuredResponse(response);
    } catch (err) {
      console.warn('Failed to parse Gemini response as JSON, using fallback parsing', err);
      return this.parseStructuredResponse(response);
    }
  }

  private parseStructuredResponse(response: string): any {
    // Fallback parsing for non-JSON responses
    return {
      cropWaterRequirement: this.extractSection(response, 'Crop Water Requirement', 'This crop requires careful water management...'),
      soilAnalysis: this.extractSection(response, 'Soil Analysis', 'The soil type affects water retention significantly...'),
      weatherImpact: this.extractSection(response, 'Weather Impact', 'Current weather conditions impact irrigation needs...'),
      seasonalConsiderations: this.extractSection(response, 'Seasonal', 'Seasonal adjustments are important for optimal results...'),
      costEstimation: this.extractSection(response, 'Cost', 'Estimated irrigation costs and optimization strategies...'),
      sustainabilityTips: this.extractListItems(response, 'Sustainability', [
        'Use drip irrigation for water efficiency',
        'Monitor soil moisture regularly',
        'Implement rainwater harvesting'
      ]),
      riskFactors: this.extractListItems(response, 'Risk', [
        'Over-watering leading to root rot',
        'Inconsistent watering patterns',
        'Weather unpredictability'
      ]),
      optimizationSuggestions: this.extractListItems(response, 'Optimization', [
        'Install soil moisture sensors',
        'Use weather-based irrigation controllers',
        'Implement precision irrigation techniques',
        'Regular system maintenance'
      ])
    };
  }

  private extractSection(text: string, sectionName: string, fallback: string): string {
    const regex = new RegExp(`${sectionName}[^:]*:([^\\n]*(?:\\n(?!\\d+\\.|[A-Z][^:]*:)[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : fallback;
  }

  private extractListItems(text: string, sectionName: string, fallback: string[]): string[] {
    const sectionRegex = new RegExp(`${sectionName}[^:]*:([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z][^:]*:|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);
    
    if (sectionMatch) {
      const items = sectionMatch[1].match(/[-•*]\s*([^\n]+)/g);
      if (items) {
        return items.map(item => item.replace(/^[-•*]\s*/, '').trim());
      }
    }
    
    return fallback;
  }

  private combineRecommendations(
    input: IrrigationInput,
    tensorFlowPrediction: any,
    geminiAnalysis: any
  ): IrrigationRecommendation {
    return {
      dailyWaterNeed: tensorFlowPrediction.dailyWaterNeed,
      weeklyWaterNeed: tensorFlowPrediction.weeklyWaterNeed,
      irrigationFrequency: tensorFlowPrediction.irrigationFrequency,
      recommendedDuration: tensorFlowPrediction.recommendedDuration,
      confidence: tensorFlowPrediction.confidence,
      analysis: {
        cropWaterRequirement: geminiAnalysis.cropWaterRequirement,
        soilAnalysis: geminiAnalysis.soilAnalysis,
        weatherImpact: geminiAnalysis.weatherImpact,
        seasonalConsiderations: geminiAnalysis.seasonalConsiderations,
        costEstimation: geminiAnalysis.costEstimation,
        sustainabilityTips: geminiAnalysis.sustainabilityTips,
        riskFactors: geminiAnalysis.riskFactors,
        optimizationSuggestions: geminiAnalysis.optimizationSuggestions
      },
      schedule: {
        morningSession: this.generateMorningSchedule(input),
        eveningSession: this.generateEveningSchedule(input),
        weeklyPattern: this.generateWeeklyPattern(tensorFlowPrediction.irrigationFrequency)
      },
      monitoring: {
        soilMoistureThreshold: this.getSoilMoistureThreshold(input.soilType),
        plantStressIndicators: this.getPlantStressIndicators(input.cropType),
        adjustmentTriggers: this.getAdjustmentTriggers()
      }
    };
  }

  private generateMorningSchedule(input: IrrigationInput): string {
    if (input.temperature > 30) {
      return '6:00 AM - 7:30 AM (Before peak heat)';
    } else if (input.temperature > 20) {
      return '7:00 AM - 8:30 AM (Optimal absorption time)';
    } else {
      return '8:00 AM - 9:30 AM (After dew evaporation)';
    }
  }

  private generateEveningSchedule(input: IrrigationInput): string {
    if (input.temperature > 30) {
      return '6:30 PM - 8:00 PM (After peak heat)';
    } else {
      return '5:30 PM - 7:00 PM (Before evening cool down)';
    }
  }

  private generateWeeklyPattern(frequency: string): string[] {
    if (frequency.includes('Daily')) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else if (frequency.includes('2-3 days')) {
      return ['Monday', 'Wednesday', 'Friday', 'Sunday'];
    } else if (frequency.includes('2 days')) {
      return ['Monday', 'Wednesday', 'Friday'];
    } else {
      return ['Monday', 'Wednesday', 'Friday'];
    }
  }

  private getSoilMoistureThreshold(soilType: string): string {
    const thresholds = {
      'Sandy': '15-20% (Check daily)',
      'Loamy': '25-30% (Check every 2 days)',
      'Clay': '30-35% (Check every 3 days)',
      'Silty': '20-25% (Check every 2 days)'
    };
    return thresholds[soilType as keyof typeof thresholds] || '20-25%';
  }

  private getPlantStressIndicators(cropType: string): string[] {
    const commonIndicators = [
      'Wilting during early morning hours',
      'Yellowing or browning of leaf edges',
      'Reduced plant growth rate'
    ];

    const cropSpecific = {
      'Tomatoes': ['Blossom end rot', 'Fruit cracking', 'Leaf curling'],
      'Maize': ['Leaf rolling', 'Tassel delay', 'Silk emergence issues'],
      'Rice': ['Panicle emergence problems', 'Grain filling issues'],
      'Wheat': ['Head emergence delay', 'Grain shriveling'],
      'Potatoes': ['Tuber cracking', 'Hollow heart', 'Growth cracking'],
      'Beans': ['Pod filling issues', 'Flower drop', 'Stem elongation']
    };

    return [
      ...commonIndicators,
      ...(cropSpecific[cropType as keyof typeof cropSpecific] || [])
    ];
  }

  private getAdjustmentTriggers(): string[] {
    return [
      'Soil moisture drops below threshold',
      'Extended periods without rainfall',
      'Temperature increases above 35°C',
      'Humidity drops below 30%',
      'Visible plant stress symptoms',
      'Weather forecast shows heat wave',
      'Growth stage changes requiring different water needs'
    ];
  }
}
