/**
 * Pest Identification Service
 * Uses Gemini Vision API to analyze crop images for pest identification
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getAIConfig } from '../config';
import { convertImageToDataUri } from '../../lib/image-analysis-utils';

export interface PestAnalysisResult {
  cropType: string;
  pestDetected: boolean;
  pestName?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  indicators: string[];
  lifeCycleStage?: string;
  prevention: {
    cultural: string[];
    biological: string[];
    chemical: string[];
  };
  treatment: {
    immediate: string[];
    ongoing: string[];
    organic: string[];
  };
  riskFactors: string[];
  recommendations: string[];
}

export class PestIdentificationService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config = getAIConfig();

  constructor() {
    if (!this.config.gemini.apiKey) {
      throw new Error('Google AI API key is required for pest identification');
    }
    this.genAI = new GoogleGenerativeAI(this.config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Analyze crop image for pest identification
   */
  async analyzeImage(imageUri: string): Promise<PestAnalysisResult> {
    try {
      // Convert image to base64
      const base64Image = await convertImageToDataUri(imageUri);
      const prompt = `
You are an expert entomologist and agronomist. Analyze this image of a crop/plant for pest identification.

Please provide a comprehensive analysis in the following JSON format:

{
  "cropType": "Name of the crop/plant identified",
  "pestDetected": true/false,
  "pestName": "Name of the pest if detected, null if healthy",
  "confidence": 0-100,
  "severity": "low/medium/high",
  "indicators": ["List of visible pest indicators such as damage signs"],
  "lifeCycleStage": "Stage of the pest (e.g., larva, adult)",
  "prevention": {
    "cultural": ["Cultural practices to prevent infestation"],
    "biological": ["Biological control methods"],
    "chemical": ["Chemical treatments if needed"]
  },
  "treatment": {
    "immediate": ["Immediate actions to take"],
    "ongoing": ["Long-term management strategies"],
    "organic": ["Organic/natural treatment options"]
  },
  "riskFactors": ["Environmental and management factors that increase risk"],
  "recommendations": ["Specific actionable recommendations for the farmer"]
}

Be specific and practical in your advice. If no pest is visible, indicate a healthy plant but provide general prevention tips.`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image.split(',')[1], // Remove prefix
            mimeType: 'image/jpeg'
          }
        }
      ]);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in AI response');
      return JSON.parse(jsonMatch[0]) as PestAnalysisResult;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('overloaded')) {
          throw new Error('AI service is temporarily overloaded. Please try again in a moment.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Analysis timed out. Please try again with a clearer image.');
        }
      }
      throw new Error(`Pest identification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

let pestService: PestIdentificationService | null = null;
export const getPestIdentificationService = (): PestIdentificationService => {
  if (!pestService) pestService = new PestIdentificationService();
  return pestService;
};
