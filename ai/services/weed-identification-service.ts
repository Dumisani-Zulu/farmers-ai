/**
 * Weed Identification Service
 * Uses Gemini Vision API to analyze crop images for weed identification
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getAIConfig } from '../config';
import { convertImageToDataUri } from '../../lib/image-analysis-utils';

export interface WeedAnalysisResult {
  cropType: string;
  weedDetected: boolean;
  weedName?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  weedType: 'broadleaf' | 'grassy' | 'sedge' | 'mixed';
  characteristics: string[];
  competitiveImpact: string[];
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

export class WeedIdentificationService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config = getAIConfig();

  constructor() {
    console.log('🌿 Initializing Weed Identification Service...');
    
    if (!this.config.gemini.apiKey) {
      throw new Error('Google AI API key is required for weed identification');
    }

    this.genAI = new GoogleGenerativeAI(this.config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Weed Identification Service initialized');
  }

  /**
   * Analyze crop image for weed identification
   */
  async analyzeImage(imageUri: string): Promise<WeedAnalysisResult> {
    try {
      // Convert image to base64
      const imageData = await convertImageToDataUri(imageUri);
      
      const prompt = `
        Analyze this crop field image for weed identification. Please provide a detailed analysis in JSON format with the following structure:

        {
          "cropType": "identified crop type if visible",
          "weedDetected": true/false,
          "weedName": "specific weed name if identified",
          "confidence": 0-100,
          "severity": "low/medium/high",
          "weedType": "broadleaf/grassy/sedge/mixed",
          "characteristics": ["list of visible weed characteristics"],
          "competitiveImpact": ["how these weeds compete with crops"],
          "prevention": {
            "cultural": ["cultural prevention methods"],
            "biological": ["biological control methods"],
            "chemical": ["chemical prevention options"]
          },
          "treatment": {
            "immediate": ["immediate treatment actions"],
            "ongoing": ["long-term management strategies"],
            "organic": ["organic treatment options"]
          },
          "riskFactors": ["factors that increase weed pressure"],
          "recommendations": ["specific recommendations for this situation"]
        }

        Focus on:
        1. Identifying the specific weed species if possible
        2. Determining the weed type (broadleaf, grassy, sedge)
        3. Assessing the severity of infestation
        4. Providing practical management recommendations
        5. Considering the crop context if visible
        6. Offering both organic and conventional control options

        Be specific about weed identification features like leaf shape, growth pattern, flowering characteristics, etc.
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData.split(',')[1]
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const analysisResult = JSON.parse(jsonMatch[0]) as WeedAnalysisResult;

      // Validate and sanitize the response
      if (!analysisResult.cropType) {
        analysisResult.cropType = 'Unknown';
      }
      if (!analysisResult.weedDetected) {
        analysisResult.weedDetected = false;
      }
      if (!analysisResult.confidence || analysisResult.confidence < 0 || analysisResult.confidence > 100) {
        analysisResult.confidence = 50;
      }
      if (!['low', 'medium', 'high'].includes(analysisResult.severity)) {
        analysisResult.severity = 'medium';
      }
      if (!['broadleaf', 'grassy', 'sedge', 'mixed'].includes(analysisResult.weedType)) {
        analysisResult.weedType = 'mixed';
      }

      // Ensure arrays exist
      analysisResult.characteristics = analysisResult.characteristics || [];
      analysisResult.competitiveImpact = analysisResult.competitiveImpact || [];
      analysisResult.riskFactors = analysisResult.riskFactors || [];
      analysisResult.recommendations = analysisResult.recommendations || [];

      // Ensure nested objects exist
      if (!analysisResult.prevention) {
        analysisResult.prevention = { cultural: [], biological: [], chemical: [] };
      }
      if (!analysisResult.treatment) {
        analysisResult.treatment = { immediate: [], ongoing: [], organic: [] };
      }

      console.log('🌿 Weed analysis completed:', analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('❌ Weed identification failed:', error);
      if (error instanceof Error) {
        throw new Error(`Weed identification failed: ${error.message}`);
      }
      throw new Error('Weed identification failed: Unknown error');
    }
  }
}

// Singleton instance
let weedIdentificationService: WeedIdentificationService | null = null;

export function getWeedIdentificationService(): WeedIdentificationService {
  if (!weedIdentificationService) {
    weedIdentificationService = new WeedIdentificationService();
  }
  return weedIdentificationService;
}
