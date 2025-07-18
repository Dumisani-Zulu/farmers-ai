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

      // Try to get Gemini analysis, but don't fail if it's overloaded
      let geminiAnalysis;
      try {
        geminiAnalysis = await this.getGeminiAnalysis(input, tensorFlowPrediction);
      } catch (geminiError) {
        console.warn('Gemini AI unavailable, using fallback analysis:', geminiError);
        geminiAnalysis = this.getFallbackAnalysis(input, tensorFlowPrediction);
      }

      // Combine results
      return this.combineRecommendations(input, tensorFlowPrediction, geminiAnalysis);
    } catch (error) {
      console.error('Error calculating irrigation recommendation:', error);
      
      // If everything fails, provide a basic recommendation
      if (error instanceof Error && error.message.includes('overloaded')) {
        return this.getBasicRecommendation(input);
      }
      
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
    // Crop-specific and detailed prompt
    const prompt = `You are an expert agricultural irrigation consultant specializing in ${input.cropType} cultivation. Provide specific irrigation recommendations.

CROP: ${input.cropType}
FIELD SIZE: ${input.fieldArea} m²
SOIL TYPE: ${input.soilType}
TEMPERATURE: ${input.temperature}°C
HUMIDITY: ${input.humidity || 50}%
PREDICTED WATER NEED: ${prediction.dailyWaterNeed} L/day

Provide detailed, ${input.cropType}-specific analysis:

1. Crop Water Requirements for ${input.cropType}:
   - Growth stage water needs
   - Root depth and water uptake patterns
   - Critical irrigation periods

2. ${input.soilType} Soil Impact on ${input.cropType}:
   - Water retention for this crop
   - Drainage considerations
   - Root development implications

3. Weather Effects on ${input.cropType}:
   - Temperature stress indicators
   - Humidity impact on disease risk
   - Evapotranspiration rates

4. ${input.cropType} Sustainability Tips (3-4 specific):
   - Water conservation methods for this crop
   - Disease prevention through irrigation
   - Yield optimization techniques

5. ${input.cropType} Risk Factors (3 specific):
   - Irrigation-related diseases
   - Growth stage vulnerabilities
   - Quality issues from poor irrigation

6. ${input.cropType} Optimization (3-4 tips):
   - Best irrigation methods for this crop
   - Timing optimizations
   - Technology recommendations

Focus on ${input.cropType}-specific characteristics, growth patterns, and irrigation requirements.`;

    try {
      const response = await this.geminiService.generateText(prompt);
      return this.parseGeminiResponse(response);
    } catch (error) {
      console.warn('Gemini AI unavailable, using crop-specific fallback analysis:', error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('GEMINI_OVERLOADED')) {
          console.log('🔄 Gemini is overloaded, using intelligent crop-specific fallback...');
        } else if (error.message.includes('GEMINI_TIMEOUT')) {
          console.log('⏱️ Gemini request timed out, using crop-specific fallback...');
        }
      }
      
      // Return comprehensive crop-specific fallback analysis when Gemini fails
      return this.getFallbackAnalysis(input, prediction);
    }
  }

  private getBasicRecommendation(input: IrrigationInput): IrrigationRecommendation {
    // Ultra-simple fallback when everything fails
    const basicWaterNeed = this.calculateBaseWaterNeed(input);
    const weeklyNeed = basicWaterNeed * 7;
    
    return {
      dailyWaterNeed: Math.round(basicWaterNeed),
      weeklyWaterNeed: Math.round(weeklyNeed),
      irrigationFrequency: 'Daily',
      recommendedDuration: '20-30 minutes',
      confidence: 0.7,
      analysis: {
        cropWaterRequirement: `${input.cropType} needs approximately ${Math.round(basicWaterNeed)} liters per day.`,
        soilAnalysis: `${input.soilType} soil requires standard irrigation practices.`,
        weatherImpact: `Current temperature ${input.temperature}°C affects water needs.`,
        seasonalConsiderations: 'Monitor weather conditions and adjust as needed.',
        costEstimation: `Estimated cost: $${(basicWaterNeed * 0.002).toFixed(2)} per day.`,
        sustainabilityTips: ['Use efficient irrigation methods', 'Monitor soil moisture', 'Water during cooler hours'],
        riskFactors: ['Over-watering', 'Weather changes', 'Soil drainage issues'],
        optimizationSuggestions: ['Install timers', 'Check soil regularly', 'Adjust for weather']
      },
      schedule: {
        morningSession: '7:00 AM - 8:00 AM',
        eveningSession: '6:00 PM - 7:00 PM',
        weeklyPattern: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      monitoring: {
        soilMoistureThreshold: '20-25%',
        plantStressIndicators: ['Wilting', 'Yellow leaves', 'Slow growth'],
        adjustmentTriggers: ['Dry soil', 'Hot weather', 'Plant stress signs']
      }
    };
  }

  private getFallbackAnalysis(input: IrrigationInput, prediction: any): any {
    // Get comprehensive crop-specific data
    const cropData = this.getCropSpecificData(input.cropType.toLowerCase());
    const soilType = input.soilType.toLowerCase();
    
    return {
      cropWaterRequirement: `${input.cropType} requires ${prediction.dailyWaterNeed} liters per day for ${input.fieldArea}m². ${cropData.growthStages} ${cropData.rootCharacteristics} Critical irrigation periods: ${cropData.criticalPeriods}`,
      
      soilAnalysis: `${input.soilType} soil ${cropData.soilCompatibility} for ${input.cropType} cultivation. ${cropData.soilAdvice} ${this.getSoilSpecificAdvice(soilType, input.cropType)} Drainage rate: ${cropData.drainageNeeds}`,
      
      weatherImpact: `At ${input.temperature}°C, ${input.cropType} ${cropData.temperatureResponse}. ${cropData.humidityAdvice} ${this.getTemperatureSpecificAdvice(input.temperature, input.cropType)} Optimal growing temperature: ${cropData.optimalTemp}°C`,
      
      seasonalConsiderations: `${cropData.seasonalTips} ${this.getSeasonalAdvice(input.cropType)} Current season recommendations: ${cropData.currentSeasonAdvice}`,
      
      costEstimation: `Estimated monthly water cost for ${input.fieldArea}m² ${input.cropType} field: $${Math.round(prediction.dailyWaterNeed * 30 * 0.002)}. ${cropData.costOptimization} Expected water savings with drip irrigation: ${cropData.dripSavings}`,
      
      sustainabilityTips: cropData.sustainabilityTips,
      riskFactors: cropData.riskFactors,
      optimizationSuggestions: cropData.optimizationTips
    };
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
      cropWaterRequirement: this.extractSection(response, 'Crop Water Requirement', 'This crop requires careful water management based on its specific characteristics and environmental conditions.'),
      soilAnalysis: this.extractSection(response, 'Soil Analysis', 'The soil type affects water retention significantly. Consider soil drainage and root zone depth for optimal irrigation.'),
      weatherImpact: this.extractSection(response, 'Weather Impact', 'Current weather conditions impact irrigation needs. Monitor temperature and humidity for best results.'),
      seasonalConsiderations: this.extractSection(response, 'Seasonal', 'Seasonal adjustments are important for optimal results. Consider current season and upcoming weather patterns.'),
      costEstimation: this.extractSection(response, 'Cost', 'Estimated irrigation costs depend on water source, energy requirements, and system efficiency.'),
      sustainabilityTips: this.extractListItems(response, 'Sustainability', [
        'Use drip irrigation for water efficiency',
        'Monitor soil moisture regularly',
        'Implement rainwater harvesting',
        'Choose drought-resistant crop varieties',
        'Apply mulch to reduce evaporation'
      ]),
      riskFactors: this.extractListItems(response, 'Risk', [
        'Over-watering leading to root rot',
        'Inconsistent watering patterns',
        'Weather unpredictability',
        'Soil degradation from poor drainage'
      ]),
      optimizationSuggestions: this.extractListItems(response, 'Optimization', [
        'Install soil moisture sensors',
        'Use weather-based irrigation controllers',
        'Implement precision irrigation techniques',
        'Regular system maintenance',
        'Monitor plant health indicators',
        'Adjust timing based on growth stages'
      ])
    };
  }

  private extractSection(text: string, sectionName: string, fallback: string): string {
    const regex = new RegExp(`${sectionName}[^:]*:([^\\n]*(?:\\n(?!\\d+\\.|[A-Z][^:]*:)[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : fallback;
  }

  private extractListItems(text: string, sectionName: string, fallback: string[]): string[] {
    try {
      if (!text || !sectionName) {
        return fallback || [];
      }
      
      const sectionRegex = new RegExp(`${sectionName}[^:]*:([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z][^:]*:|$)`, 'i');
      const sectionMatch = text.match(sectionRegex);
      
      if (sectionMatch) {
        const items = sectionMatch[1].match(/[-•*]\s*([^\n]+)/g);
        if (items && items.length > 0) {
          return items.map(item => item.replace(/^[-•*]\s*/, '').trim()).filter(item => item.length > 0);
        }
      }
      
      return fallback || [];
    } catch (error) {
      console.warn(`Error extracting list items for ${sectionName}:`, error);
      return fallback || [];
    }
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
    if (!frequency) {
      return ['Monday', 'Wednesday', 'Friday']; // Default pattern
    }
    
    if (frequency.includes('Daily') || frequency.includes('daily')) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else if (frequency.includes('2-3 days')) {
      return ['Monday', 'Wednesday', 'Friday', 'Sunday'];
    } else if (frequency.includes('2 days')) {
      return ['Monday', 'Wednesday', 'Friday'];
    } else if (frequency.includes('Twice daily') || frequency.includes('twice daily')) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else {
      return ['Monday', 'Wednesday', 'Friday']; // Default pattern
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

  private getCropSpecificData(cropType: string): any {
    const cropDatabase: { [key: string]: any } = {
      'rice': {
        waterNeed: 40,
        growthStages: 'Rice requires 3 distinct irrigation phases: flooding during vegetative stage (2-5cm water depth), reduced water during flowering, and intermittent irrigation during grain filling.',
        rootCharacteristics: 'Shallow root system (15-20cm) requires surface water management rather than deep irrigation.',
        criticalPeriods: 'Transplanting (1-2 weeks), Tillering (3-5 weeks), Panicle initiation (8-9 weeks), and Grain filling (11-13 weeks)',
        soilCompatibility: 'Clay soil is ideal for water retention',
        soilAdvice: 'Maintain 2-5cm standing water depth. Use bunds to prevent water loss.',
        drainageNeeds: 'Controlled drainage with ability to maintain standing water',
        temperatureResponse: 'grows optimally but may need additional water for cooling',
        humidityAdvice: 'High humidity (70-80%) is beneficial for rice cultivation and reduces water stress',
        optimalTemp: '25-30',
        seasonalTips: 'Plant during monsoon season to utilize natural rainfall. Reduce irrigation in winter months.',
        currentSeasonAdvice: 'Monitor for pests in standing water during warm months',
        costOptimization: 'Use alternate wetting and drying (AWD) to save 15-30% water costs',
        dripSavings: 'Not suitable - rice requires flooding irrigation system',
        sustainabilityTips: [
          'Implement System of Rice Intensification (SRI) for 40% water savings',
          'Use alternate wetting and drying to reduce methane emissions',
          'Install water level gauges for precise water management',
          'Collect rainwater in farm ponds for dry season irrigation'
        ],
        riskFactors: [
          'Standing water increases risk of bacterial leaf blight and blast disease',
          'Overwatering can cause iron toxicity and root rot',
          'Water stagnation attracts pests like stem borers and rice water weevil'
        ],
        optimizationTips: [
          'Use laser land leveling for uniform water distribution',
          'Apply silicon fertilizer to improve water use efficiency',
          'Monitor water pH (6.0-7.0) for optimal nutrient uptake',
          'Install automated water level control systems'
        ]
      },
      'tomatoes': {
        waterNeed: 30,
        growthStages: 'Tomatoes need consistent moisture during all stages, with increased water during flowering and fruit development. Reduce before harvest.',
        rootCharacteristics: 'Deep taproot (60-90cm) with extensive lateral roots. Benefits from deep, infrequent watering.',
        criticalPeriods: 'Transplanting (0-2 weeks), First flowering (4-6 weeks), Fruit setting (6-10 weeks), and Fruit ripening (10-14 weeks)',
        soilCompatibility: 'requires well-draining soil to prevent root diseases',
        soilAdvice: 'Ensure excellent drainage. Raised beds recommended for heavy soils.',
        drainageNeeds: 'Fast drainage essential - waterlogging causes root rot within 24 hours',
        temperatureResponse: 'may experience heat stress, increase watering frequency and provide shade',
        humidityAdvice: 'Moderate humidity (60-65%) prevents fungal diseases like early blight and septoria',
        optimalTemp: '18-25',
        seasonalTips: 'Increase watering during fruit development. Reduce irrigation 2 weeks before harvest to concentrate flavors.',
        currentSeasonAdvice: 'Use mulch to maintain consistent soil moisture and prevent cracking',
        costOptimization: 'Drip irrigation reduces water costs by 30-50% compared to overhead watering',
        dripSavings: '40-60% water savings with drip irrigation',
        sustainabilityTips: [
          'Install drip irrigation to deliver water directly to root zone',
          'Use organic mulch to retain soil moisture and suppress weeds',
          'Collect rainwater for irrigation during dry periods',
          'Plant determinate varieties to reduce overall water requirements'
        ],
        riskFactors: [
          'Irregular watering causes blossom end rot and fruit cracking',
          'Overhead watering promotes fungal diseases like early and late blight',
          'Water stress during flowering reduces fruit set by up to 50%'
        ],
        optimizationTips: [
          'Water at soil level using drip lines or soaker hoses',
          'Maintain consistent soil moisture at 60-70% field capacity',
          'Install soil moisture sensors to automate irrigation timing',
          'Use calcium-rich water or supplements to prevent blossom end rot'
        ]
      },
      'maize': {
        waterNeed: 25,
        growthStages: 'Maize has three critical water periods: emergence (0-3 weeks), tasseling/silking (8-10 weeks), and grain filling (10-14 weeks).',
        rootCharacteristics: 'Extensive root system reaching 1.5-2m depth. Can access deep soil moisture but needs surface irrigation during critical periods.',
        criticalPeriods: 'Germination (0-2 weeks), Tasseling/Silking (8-10 weeks - most critical), and Grain filling (10-14 weeks)',
        soilCompatibility: 'performs well in most soil types with good drainage',
        soilAdvice: 'Ensure adequate drainage to prevent waterlogging during heavy rains.',
        drainageNeeds: 'Good drainage required - tolerates brief waterlogging but not extended periods',
        temperatureResponse: 'requires additional water for transpiration cooling and stress prevention',
        humidityAdvice: 'Monitor for fungal diseases (rust, smut) in high humidity conditions',
        optimalTemp: '20-30',
        seasonalTips: 'Time planting with rainy season. Critical irrigation during silk emergence regardless of season.',
        currentSeasonAdvice: 'Increase irrigation frequency during grain filling for maximum yield',
        costOptimization: 'Furrow irrigation provides good water efficiency at lower cost than sprinklers',
        dripSavings: '25-40% water savings with drip irrigation systems',
        sustainabilityTips: [
          'Use furrow irrigation for efficient water distribution',
          'Plant drought-resistant hybrid varieties to reduce water needs',
          'Time planting to coincide with rainy season',
          'Implement conservation tillage to improve soil water retention'
        ],
        riskFactors: [
          'Water stress during tasseling can reduce yield by 25-50%',
          'Overwatering causes nitrogen leaching and reduced nutrient uptake',
          'Poor drainage during grain filling promotes ear rot diseases'
        ],
        optimizationTips: [
          'Focus irrigation during critical growth stages rather than uniform schedule',
          'Use soil moisture sensors to determine irrigation timing',
          'Apply water slowly to prevent runoff and ensure deep penetration',
          'Combine with appropriate nitrogen application for optimal water use efficiency'
        ]
      },
      'wheat': {
        waterNeed: 22,
        growthStages: 'Wheat needs moderate water during tillering, critical water during stem elongation and grain filling, minimal water at maturity.',
        rootCharacteristics: 'Deep root system (1-1.5m) allows access to subsoil moisture. Drought tolerance increases with root development.',
        criticalPeriods: 'Germination (0-2 weeks), Tillering (4-8 weeks), Stem elongation (8-12 weeks), and Grain filling (12-16 weeks)',
        soilCompatibility: 'adapts well to various soil types including heavier soils',
        soilAdvice: 'Can tolerate heavier soils better than other cereals. Ensure good drainage during wet periods.',
        drainageNeeds: 'Moderate drainage needs - more tolerant of wet conditions than other cereals',
        temperatureResponse: 'benefits from cooler temperatures, reduced water stress',
        humidityAdvice: 'Monitor for rust diseases in humid conditions, especially during grain filling',
        optimalTemp: '15-20',
        seasonalTips: 'Reduce irrigation as crop approaches maturity to prevent lodging and facilitate harvest.',
        currentSeasonAdvice: 'Time final irrigation to avoid extending crop maturity unnecessarily',
        costOptimization: 'Strategic irrigation timing reduces total water costs by focusing on critical periods',
        dripSavings: '20-35% water savings possible with precision irrigation systems',
        sustainabilityTips: [
          'Use precision irrigation scheduling based on growth stages',
          'Plant early maturing varieties to utilize winter/spring moisture',
          'Implement no-till practices to conserve soil moisture',
          'Use weather-based irrigation controllers to optimize timing'
        ],
        riskFactors: [
          'Late season irrigation can delay maturity and increase lodging risk',
          'Excessive irrigation during grain filling promotes fungal diseases',
          'Water stress during grain filling reduces grain weight and quality'
        ],
        optimizationTips: [
          'Irrigate based on soil moisture levels rather than fixed schedules',
          'Avoid irrigation 2-3 weeks before anticipated harvest',
          'Focus irrigation during stem elongation and early grain filling',
          'Use nitrogen management in conjunction with irrigation for optimal results'
        ]
      },
      'potatoes': {
        waterNeed: 20,
        growthStages: 'Potatoes need consistent moisture throughout growth, with critical periods during tuber initiation and bulking.',
        rootCharacteristics: 'Shallow root system (30-45cm) requires frequent irrigation. Most roots in top 30cm of soil.',
        criticalPeriods: 'Emergence (0-4 weeks), Tuber initiation (4-8 weeks - most critical), Tuber bulking (8-12 weeks), and Maturation (12-16 weeks)',
        soilCompatibility: 'requires well-draining, loose soil for proper tuber development',
        soilAdvice: 'Sandy loam ideal. Heavy soils need amendments for proper drainage and tuber shape.',
        drainageNeeds: 'Excellent drainage essential - waterlogged soil causes tuber rot and deformed potatoes',
        temperatureResponse: 'needs consistent watering as heat increases water demand significantly',
        humidityAdvice: 'Ensure good air circulation to prevent late blight in humid conditions',
        optimalTemp: '15-20',
        seasonalTips: 'Maintain consistent soil moisture to prevent growth cracks and hollow heart. Reduce water gradually before harvest.',
        currentSeasonAdvice: 'Hill soil around plants to prevent tuber exposure and maintain moisture',
        costOptimization: 'Drip irrigation provides precise water control and reduces disease pressure',
        dripSavings: '30-50% water savings with drip irrigation and mulching',
        sustainabilityTips: [
          'Use drip irrigation for precise water delivery to root zone',
          'Apply organic mulch to maintain consistent soil moisture',
          'Hill plants properly to conserve moisture and protect tubers',
          'Harvest rainwater for irrigation during dry periods'
        ],
        riskFactors: [
          'Irregular watering causes growth cracks, hollow heart, and misshapen tubers',
          'Overwatering promotes bacterial soft rot and fungal diseases',
          'Water stress during tuber bulking severely reduces yield and quality'
        ],
        optimizationTips: [
          'Maintain consistent soil moisture at 65-75% field capacity',
          'Reduce irrigation 2 weeks before harvest to improve storage quality',
          'Use soil moisture monitoring to prevent over or under-watering',
          'Time irrigation to avoid wet foliage during disease-prone periods'
        ]
      }
    };

    // Default data for unknown crops
    const defaultData = {
      waterNeed: 25,
      growthStages: `Monitor ${cropType} growth stages for optimal watering timing`,
      rootCharacteristics: 'Root characteristics vary by crop - monitor soil moisture at appropriate depths',
      criticalPeriods: 'Germination, flowering, and fruit/grain development typically require consistent moisture',
      soilCompatibility: 'requires appropriate soil drainage for optimal growth',
      soilAdvice: 'Ensure soil drainage matches crop requirements',
      drainageNeeds: 'Good drainage typically required for most crops',
      temperatureResponse: 'may require adjusted watering frequency based on temperature stress',
      humidityAdvice: 'Monitor for disease pressure in high humidity conditions',
      optimalTemp: '20-25',
      seasonalTips: `Adjust irrigation for ${cropType} based on local growing season and weather patterns`,
      currentSeasonAdvice: 'Monitor current weather conditions and adjust irrigation accordingly',
      costOptimization: 'Consider efficient irrigation methods to reduce water costs',
      dripSavings: '20-40% water savings possible with efficient irrigation systems',
      sustainabilityTips: [
        'Use efficient irrigation methods appropriate for crop type',
        'Monitor soil moisture regularly to optimize water use',
        'Consider drought-resistant varieties if available',
        'Implement water conservation practices suitable for the crop'
      ],
      riskFactors: [
        'Over or under-watering can reduce yield and quality',
        'Poor irrigation timing can stress plants during critical growth periods',
        'Inadequate drainage can promote disease development'
      ],
      optimizationTips: [
        'Use soil moisture monitoring for precision irrigation timing',
        'Time irrigation based on crop growth stages and weather conditions',
        'Consider crop-specific irrigation methods and technologies',
        'Integrate irrigation with appropriate fertilization practices'
      ]
    };

    return cropDatabase[cropType] || defaultData;
  }

  private getSoilSpecificAdvice(soilType: string, cropType: string): string {
    const soilCropMatrix: { [key: string]: { [key: string]: string } } = {
      'sandy': {
        'rice': 'Sandy soil is challenging for rice - consider soil amendments or puddling to improve water retention.',
        'tomatoes': 'Sandy soil provides excellent drainage for tomatoes but requires more frequent irrigation.',
        'maize': 'Sandy soil allows good root development for maize but needs careful moisture management.',
        'wheat': 'Sandy soil works well for wheat with proper irrigation timing.',
        'potatoes': 'Sandy soil is ideal for potato tuber development and harvest.',
        'default': 'Sandy soil drains quickly, requiring more frequent but lighter irrigation applications.'
      },
      'clay': {
        'rice': 'Clay soil is perfect for rice cultivation with excellent water retention for flooding.',
        'tomatoes': 'Clay soil requires drainage improvements for tomatoes - consider raised beds.',
        'maize': 'Clay soil can be challenging for maize - ensure proper drainage during wet periods.',
        'wheat': 'Clay soil works well for wheat with its tolerance for heavier soils.',
        'potatoes': 'Clay soil is problematic for potatoes - amendments needed for proper tuber development.',
        'default': 'Clay soil retains water well but may require drainage improvements for optimal crop growth.'
      },
      'loamy': {
        'rice': 'Loamy soil works for rice but may need puddling for water retention.',
        'tomatoes': 'Loamy soil is excellent for tomatoes with good drainage and water retention.',
        'maize': 'Loamy soil is ideal for maize providing good drainage and nutrient retention.',
        'wheat': 'Loamy soil provides optimal conditions for wheat growth.',
        'potatoes': 'Loamy soil is perfect for potatoes with ideal drainage and structure.',
        'default': 'Loamy soil provides excellent balance of drainage and water retention for most crops.'
      },
      'silty': {
        'rice': 'Silty soil works well for rice with good water retention capabilities.',
        'tomatoes': 'Silty soil may need drainage improvements for tomatoes to prevent disease.',
        'maize': 'Silty soil provides good conditions for maize with adequate moisture retention.',
        'wheat': 'Silty soil works well for wheat with good water and nutrient retention.',
        'potatoes': 'Silty soil may compact easily - monitor for proper tuber development.',
        'default': 'Silty soil provides good water retention but may need attention to drainage and compaction.'
      }
    };

    const soilAdvice = soilCropMatrix[soilType];
    return soilAdvice ? (soilAdvice[cropType.toLowerCase()] || soilAdvice['default']) : 'Monitor soil drainage and water retention for optimal crop performance.';
  }

  private getTemperatureSpecificAdvice(temperature: number, cropType: string): string {
    const tempCropMatrix: { [key: string]: { hot: string, cold: string, optimal: string } } = {
      'rice': {
        hot: 'High temperatures increase water loss - maintain deeper water levels and consider shade.',
        cold: 'Cold temperatures slow growth - reduce irrigation frequency and avoid cold water.',
        optimal: 'Optimal temperatures support efficient water use and growth.'
      },
      'tomatoes': {
        hot: 'Heat stress requires increased irrigation frequency and mulching to cool soil.',
        cold: 'Cool temperatures reduce water needs - avoid overwatering which promotes disease.',
        optimal: 'Ideal temperatures allow efficient water uptake and transpiration.'
      },
      'maize': {
        hot: 'High temperatures increase transpiration - ensure adequate water during tasseling.',
        cold: 'Cold weather slows growth - reduce irrigation and avoid waterlogged conditions.',
        optimal: 'Favorable temperatures support optimal water use efficiency.'
      },
      'wheat': {
        hot: 'Warm temperatures may accelerate maturity - adjust irrigation timing accordingly.',
        cold: 'Cool weather is beneficial - standard irrigation schedules work well.',
        optimal: 'Ideal growing conditions support efficient water use.'
      },
      'potatoes': {
        hot: 'Heat stress affects tuber quality - increase irrigation frequency and use mulch.',
        cold: 'Cold temperatures slow growth - reduce irrigation to prevent disease.',
        optimal: 'Optimal temperatures support consistent tuber development.'
      }
    };

    const cropAdvice = tempCropMatrix[cropType.toLowerCase()] || {
      hot: 'High temperatures increase water needs - adjust irrigation frequency accordingly.',
      cold: 'Cool temperatures reduce water needs - avoid overwatering.',
      optimal: 'Current temperatures support normal irrigation schedules.'
    };

    if (temperature > 30) return cropAdvice.hot;
    if (temperature < 15) return cropAdvice.cold;
    return cropAdvice.optimal;
  }

  private getSeasonalAdvice(cropType: string): string {
    const month = new Date().getMonth() + 1;
    const season = month >= 6 && month <= 8 ? 'summer' : 
                   (month >= 12 || month <= 2) ? 'winter' : 'spring_fall';

    const seasonalAdvice: { [key: string]: { [key: string]: string } } = {
      'rice': {
        summer: 'Peak growing season - maintain optimal water levels and monitor for pest activity.',
        winter: 'Reduced growth period - lower irrigation frequency but maintain minimum moisture.',
        spring_fall: 'Planting or harvest season - adjust irrigation for establishment or crop maturation.'
      },
      'tomatoes': {
        summer: 'Peak production period - consistent irrigation critical for fruit quality.',
        winter: 'Protected growing season - monitor humidity and reduce irrigation frequency.',
        spring_fall: 'Planting or late harvest season - establish good irrigation patterns early.'
      },
      'maize': {
        summer: 'Critical growth and reproduction period - ensure adequate water during tasseling.',
        winter: 'Off-season in most regions - plan for next season irrigation infrastructure.',
        spring_fall: 'Planting or harvest season - time irrigation with growth stages.'
      },
      'wheat': {
        summer: 'Late growth or harvest period - reduce irrigation as crop matures.',
        winter: 'Active growth period in winter wheat - maintain adequate moisture.',
        spring_fall: 'Critical growth periods - ensure consistent irrigation during stem elongation.'
      },
      'potatoes': {
        summer: 'Tuber development period - maintain consistent moisture to prevent defects.',
        winter: 'Storage period or off-season - plan irrigation systems for next planting.',
        spring_fall: 'Planting or harvest season - establish consistent watering patterns.'
      }
    };

    const cropSeasonAdvice = seasonalAdvice[cropType.toLowerCase()];
    return cropSeasonAdvice ? cropSeasonAdvice[season] : 'Adjust irrigation based on current growing season and local climate conditions.';
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
