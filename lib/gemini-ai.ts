import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Debug: Log what's available in Constants and environment
      console.log('🔍 Debug - Constants.expoConfig:', Constants.expoConfig);
      console.log('🔍 Debug - Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
      console.log('🔍 Debug - Constants.expoConfig?.extra?.googleAiApiKey:', Constants.expoConfig?.extra?.googleAiApiKey ? 'SET' : 'NOT SET');
      console.log('🔍 Debug - process.env.GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY ? `SET (${process.env.GOOGLE_AI_API_KEY?.substring(0, 10)}...)` : 'NOT SET');
      
      // Priority order: environment variable first (from .env), then Expo config
      const apiKey = process.env.GOOGLE_AI_API_KEY || 
                     Constants.expoConfig?.extra?.googleAiApiKey || 
                     Constants.expoConfig?.extra?.GOOGLE_AI_API_KEY ||
                     await this.getStoredApiKey();
      
      console.log('🔍 Debug - Final API key source:', 
        process.env.GOOGLE_AI_API_KEY ? 'process.env.GOOGLE_AI_API_KEY' :
        Constants.expoConfig?.extra?.googleAiApiKey ? 'Constants.expoConfig.extra.googleAiApiKey' :
        Constants.expoConfig?.extra?.GOOGLE_AI_API_KEY ? 'Constants.expoConfig.extra.GOOGLE_AI_API_KEY' :
        'stored/fallback'
      );
      console.log('🔍 Debug - Final API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
      
      if (!apiKey) {
        throw new Error('Google AI API key not found. Please set GOOGLE_AI_API_KEY in your .env file or googleAiApiKey in app.json extra config.');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-1.5-pro for better vision capabilities
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      this.isInitialized = true;
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      throw error;
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Gemini AI model not initialized');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Failed to generate text with Gemini:', error);
      throw new Error(`Gemini AI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateCropAnalysis(input: {
    cropType?: string;
    location?: { latitude: number; longitude: number };
    soilData?: { ph: number; moisture: number; temperature: number };
    symptoms?: string[];
    imageDescription?: string;
  }): Promise<string> {
    const prompt = `As an expert agricultural consultant, analyze the following crop information and provide detailed recommendations:

Crop Information:
- Type: ${input.cropType || 'Unknown'}
- Location: ${input.location ? `${input.location.latitude}°N, ${input.location.longitude}°E` : 'Not specified'}
- Soil pH: ${input.soilData?.ph || 'Unknown'}
- Soil Moisture: ${input.soilData?.moisture || 'Unknown'}%
- Soil Temperature: ${input.soilData?.temperature || 'Unknown'}°C
${input.symptoms ? `- Observed symptoms: ${input.symptoms.join(', ')}` : ''}
${input.imageDescription ? `- Visual observations: ${input.imageDescription}` : ''}

Please provide:
1. Health assessment and potential issues
2. Specific treatment recommendations
3. Preventive measures for future
4. Optimal growing conditions for this crop
5. Expected timeline for improvement

Format your response in a clear, actionable manner for farmers.`;

    return await this.generateText(prompt);
  }

  async generateSeasonalAdvice(cropType: string, location: { latitude: number; longitude: number }): Promise<string> {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const prompt = `As an agricultural expert, provide seasonal farming advice for ${cropType} crops.

Location: ${location.latitude}°N, ${location.longitude}°E
Current Time: ${currentMonth} ${currentYear}

Please provide comprehensive advice including:
1. Current season activities and priorities
2. Upcoming seasonal tasks (next 1-3 months)
3. Weather considerations for this region
4. Pest and disease monitoring specific to this season
5. Soil management recommendations
6. Irrigation and fertilization schedule
7. Market timing considerations

Make the advice practical and region-specific.`;

    return await this.generateText(prompt);
  }

  async generateWeatherBasedAdvice(forecast: {
    date: string;
    temperature: number;
    humidity: number;
    precipitation: number;
  }[], cropType?: string): Promise<string> {
    const forecastSummary = forecast.map(day => 
      `${day.date}: ${day.temperature.toFixed(1)}°C, ${day.humidity.toFixed(1)}% humidity, ${day.precipitation.toFixed(1)}mm rain`
    ).join('\n');

    const prompt = `As a precision agriculture specialist, analyze this weather forecast and provide farming recommendations:

${cropType ? `Crop: ${cropType}` : 'General farming operations'}

7-Day Weather Forecast:
${forecastSummary}

Please provide specific advice on:
1. Irrigation scheduling based on precipitation and humidity
2. Field operations timing (planting, spraying, harvesting)
3. Crop protection measures for weather extremes
4. Disease and pest risk assessment based on conditions
5. Soil management considerations
6. Equipment and storage preparations

Include specific timing recommendations and risk mitigation strategies.`;

    return await this.generateText(prompt);
  }

  async generatePersonalizedRecommendations(profile: {
    experience: string;
    farmSize: string;
    cropTypes: string[];
    location: { latitude: number; longitude: number };
    resources: string[];
    budget?: string;
    goals?: string[];
  }): Promise<string> {
    const prompt = `As a farm management consultant, create personalized recommendations for this farmer:

Farmer Profile:
- Experience Level: ${profile.experience}
- Farm Size: ${profile.farmSize}
- Primary Crops: ${profile.cropTypes.join(', ')}
- Location: ${profile.location.latitude}°N, ${profile.location.longitude}°E
- Available Resources: ${profile.resources.join(', ')}
${profile.budget ? `- Budget Range: ${profile.budget}` : ''}
${profile.goals ? `- Goals: ${profile.goals.join(', ')}` : ''}

Please provide tailored advice on:
1. Crop rotation and diversification strategies
2. Resource optimization and efficiency improvements
3. Technology adoption recommendations (appropriate for experience level)
4. Market opportunities and value-added options
5. Sustainability practices and certification options
6. Risk management and insurance considerations
7. Training and education opportunities
8. Financial planning and investment priorities

Adjust complexity and recommendations based on the farmer's experience level.`;

    return await this.generateText(prompt);
  }

  async generatePestDiseaseManagement(symptoms: string[], cropType: string, location?: { latitude: number; longitude: number }): Promise<string> {
    const prompt = `As a plant pathologist and entomologist, help diagnose and treat crop issues:

Crop: ${cropType}
${location ? `Location: ${location.latitude}°N, ${location.longitude}°E` : ''}
Observed Symptoms: ${symptoms.join(', ')}

Please provide:
1. Most likely pest or disease identification
2. Confirmation methods (what to look for)
3. Immediate treatment options (organic and conventional)
4. Long-term management strategies
5. Prevention measures for next season
6. When to seek professional help
7. Economic thresholds for treatment decisions

Include both emergency response and integrated management approaches.`;

    return await this.generateText(prompt);
  }

  async generateCropRecommendations(weatherData: {
    current: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
      description: string;
    };
    forecast: {
      date: string;
      temperature: { min: number; max: number };
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
      description: string;
    }[];
    location: { latitude: number; longitude: number; name?: string; city?: string; region?: string; country?: string };
    lastUpdated: number;
  }): Promise<string> {
    const locationName = weatherData.location.name || 
      `${weatherData.location.city || 'Unknown City'}${weatherData.location.region ? ', ' + weatherData.location.region : ''}${weatherData.location.country ? ', ' + weatherData.location.country : ''}`;

    // Calculate average conditions for the next 7 days
    const weeklyForecast = weatherData.forecast.slice(0, 7);
    const avgTemp = weeklyForecast.reduce((acc, day) => acc + (day.temperature.min + day.temperature.max) / 2, 0) / 7;
    const totalRainfall = weeklyForecast.reduce((acc, day) => acc + day.precipitation, 0);
    const avgHumidity = weeklyForecast.reduce((acc, day) => acc + day.humidity, 0) / 7;
    const avgWindSpeed = weeklyForecast.reduce((acc, day) => acc + day.windSpeed, 0) / 7;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentSeason = this.getSeason(currentMonth, weatherData.location.latitude);

    const weatherSummary = `
CURRENT CONDITIONS:
- Temperature: ${weatherData.current.temperature}°C
- Humidity: ${weatherData.current.humidity}%
- Precipitation: ${weatherData.current.precipitation}mm
- Wind Speed: ${weatherData.current.windSpeed} mph
- Condition: ${weatherData.current.description}

WEEKLY FORECAST SUMMARY:
- Average Temperature: ${Math.round(avgTemp)}°C
- Total Expected Rainfall: ${Math.round(totalRainfall * 10) / 10}mm
- Average Humidity: ${Math.round(avgHumidity)}%
- Average Wind Speed: ${Math.round(avgWindSpeed)} mph

LOCATION: ${locationName}
Coordinates: ${weatherData.location.latitude.toFixed(2)}°N, ${weatherData.location.longitude.toFixed(2)}°E
Current Season: ${currentSeason}
Date: ${currentDate.toLocaleDateString()}

DETAILED 7-DAY FORECAST:
${weeklyForecast.map(day => 
  `${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C, ${day.humidity}% humidity, ${day.precipitation}mm rain, ${day.windSpeed} mph wind, ${day.description}`
).join('\n')}
`;

    const prompt = `As an expert agricultural consultant and agronomist, analyze the comprehensive weather data and provide scientifically-backed crop recommendations for this specific location and time period.

${weatherSummary}

ANALYSIS REQUIREMENTS:
1. Consider temperature ranges optimal for seed germination and plant growth
2. Evaluate water requirements vs. expected natural rainfall
3. Assess wind conditions for plant stability and pollination
4. Factor in humidity levels for disease prevention
5. Account for seasonal timing and local growing patterns
6. Consider soil temperature implications
7. Evaluate market timing for optimal harvest periods

Please provide 6-8 crop recommendations in this EXACT JSON format (respond with valid JSON only, no additional text):

{
  "recommendations": [
    {
      "id": "crop_1",
      "name": "Crop Name",
      "variety": "Recommended Variety",
      "suitabilityScore": 88,
      "plantingWindow": "Optimal planting timeframe",
      "expectedHarvest": "Expected harvest timing",
      "reasons": [
        "Temperature perfectly matches germination requirements (X-Y°C optimal)",
        "Expected rainfall of XYmm meets water needs without oversaturation",
        "Current season timing aligns with natural growing cycle"
      ],
      "warnings": [
        "Monitor for potential frost if temperatures drop below X°C",
        "Ensure adequate drainage if heavy rainfall exceeds Xmm"
      ],
      "plantingTips": [
        "Plant when soil temperature consistently above X°C",
        "Space plants appropriately for wind protection",
        "Consider mulching to retain moisture during dry periods"
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
- Suitability scores should be 0-100 based on weather compatibility
- Focus on crops that can be planted NOW and harvested within 3-6 months
- Include both short-term (30-60 days) and medium-term (90-120 days) crops
- Consider local/regional crop preferences when possible
- Provide specific, actionable planting tips
- Highlight any weather-related risks or opportunities
- Consider companion planting possibilities
- Factor in water conservation strategies if rainfall is limited

Generate recommendations that are practical, evidence-based, and tailored to the specific weather conditions and location.`;

    return await this.generateText(prompt);
  }

  private getSeason(month: number, latitude: number): string {
    const isNorthernHemisphere = latitude >= 0;
    
    if (isNorthernHemisphere) {
      if (month >= 3 && month <= 5) return 'Spring';
      if (month >= 6 && month <= 8) return 'Summer';
      if (month >= 9 && month <= 11) return 'Fall';
      return 'Winter';
    } else {
      if (month >= 3 && month <= 5) return 'Fall';
      if (month >= 6 && month <= 8) return 'Winter';
      if (month >= 9 && month <= 11) return 'Spring';
      return 'Summer';
    }
  }

  // Legacy method for backward compatibility
  async generateCropRecommendationsLegacy(weatherData: {
    current: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
    };
    forecast: {
      date: string;
      temperature: { min: number; max: number };
      humidity: number;
      precipitation: number;
      windSpeed: number;
      condition: string;
    }[];
  }, location: { latitude: number; longitude: number; name: string }): Promise<string> {
    const weatherSummary = `
Current Weather:
- Temperature: ${weatherData.current.temperature}°C
- Humidity: ${weatherData.current.humidity}%
- Precipitation: ${weatherData.current.precipitation}mm
- Condition: ${weatherData.current.condition}

14-Day Forecast:
${weatherData.forecast.map(day => 
  `${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C, ${day.humidity}% humidity, ${day.precipitation}mm rain, ${day.condition}`
).join('\n')}

Location: ${location.name} (${location.latitude}°N, ${location.longitude}°E)
`;

    const prompt = `As an expert agricultural consultant, analyze the current weather conditions and 14-day forecast to recommend the best crops to plant now. Consider the location's climate zone, current season, and upcoming weather patterns.

${weatherSummary}

Please provide 5-7 crop recommendations in the following JSON format (respond with valid JSON only):

{
  "recommendations": [
    {
      "id": "unique_id",
      "name": "Crop Name",
      "variety": "Specific Variety",
      "suitabilityScore": 85,
      "plantingWindow": "Next 2-3 weeks",
      "expectedHarvest": "3-4 months from planting",
      "reasons": [
        "Excellent temperature range for germination",
        "Adequate moisture from expected rainfall",
        "Low pest pressure during this season"
      ],
      "warnings": [
        "Monitor for late frost risk"
      ],
      "plantingTips": [
        "Plant after soil temperature reaches 15°C",
        "Ensure good drainage to prevent waterlogging",
        "Consider row covers if temperatures drop below 10°C"
      ]
    }
  ]
}

Consider factors like:
- Temperature requirements for germination and growth
- Water requirements vs expected rainfall
- Growing season length vs forecast period
- Soil temperature expectations
- Regional suitability
- Market timing for harvest
- Disease and pest pressure for the season
- Frost risk assessment

Focus on practical, regionally appropriate crops that farmers can realistically plant and harvest successfully given the weather conditions.`;

    return await this.generateText(prompt);
  }

  async analyzeImageWithPrompt(imageUri: string, prompt: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Gemini AI model not initialized');
    }

    try {
      console.log('🖼️ Starting real image analysis with Gemini Vision...');
      console.log('📊 Image URI length:', imageUri.length);
      console.log('📝 Prompt length:', prompt.length);
      
      // Extract base64 data from data URI
      let base64Data = '';
      let mimeType = 'image/jpeg';
      
      if (imageUri.startsWith('data:')) {
        // Handle data URI format: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
        const [mimeTypePart, base64Part] = imageUri.split(',');
        if (!mimeTypePart || !base64Part) {
          throw new Error('Invalid data URI format');
        }
        mimeType = mimeTypePart.split(':')[1].split(';')[0];
        base64Data = base64Part;
        console.log('📷 Image format:', mimeType);
        console.log('📊 Base64 data length:', base64Data.length);
      } else {
        throw new Error('Image URI must be in data URI format (data:image/jpeg;base64,...)');
      }

      // Validate base64 data
      if (base64Data.length < 100) {
        throw new Error('Base64 data appears to be too short - possible corruption');
      }

      // Create the image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      console.log('📤 Sending image to Gemini Vision API...');
      console.log('🔍 Using model:', this.model);
      
      // Send both the prompt and the image to Gemini
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const analysisResult = response.text();
      
      console.log('✅ Gemini Vision analysis completed successfully');
      console.log('📊 Response length:', analysisResult.length);
      console.log('📝 Response preview:', analysisResult.substring(0, 200) + '...');
      
      return analysisResult;
      
    } catch (error) {
      console.error('❌ Failed to analyze image with Gemini Vision:', error);
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      
      // Log additional error details if available
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('❌ HTTP Status:', (error as any).status);
      }
      
      throw new Error(`Gemini AI image analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getStoredApiKey(): Promise<string | null> {
    // In a real app, you might store the API key in AsyncStorage or secure storage
    // For now, return null to force environment variable usage
    return null;
  }

  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  getStatus(): { initialized: boolean; hasApiKey: boolean } {
    return {
      initialized: this.isInitialized,
      hasApiKey: this.genAI !== null,
    };
  }
}

export const geminiAI = new GeminiAIService();
export default geminiAI;
