import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    // Initialize will be called when needed
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get API key from environment or AsyncStorage
      const apiKey = process.env.GOOGLE_AI_API_KEY || await this.getStoredApiKey();
      
      if (!apiKey) {
        throw new Error('Google AI API key not found. Please set GOOGLE_AI_API_KEY in your environment.');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
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

  async generateWeatherBasedAdvice(forecast: Array<{
    date: string;
    temperature: number;
    humidity: number;
    precipitation: number;
  }>, cropType?: string): Promise<string> {
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
