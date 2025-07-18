/**
 * Disease Identification Service
 * Uses Gemini Vision API to analyze crop images for disease identification
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getAIConfig } from '../config';
import { convertImageToDataUri } from '../../lib/image-analysis-utils';

export interface DiseaseAnalysisResult {
  cropType: string;
  diseaseDetected: boolean;
  diseaseName?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  causes: string[];
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

export class DiseaseIdentificationService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config = getAIConfig();

  constructor() {
    console.log('🔬 Initializing Disease Identification Service...');
    
    if (!this.config.gemini.apiKey) {
      throw new Error('Google AI API key is required for disease identification');
    }

    this.genAI = new GoogleGenerativeAI(this.config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Disease Identification Service initialized');
  }

  /**
   * Analyze crop image for disease identification
   */
  async analyzeImage(imageUri: string): Promise<DiseaseAnalysisResult> {
    try {
      console.log('🔍 Starting disease analysis for image:', imageUri);
      
      // Convert image to base64
      const base64Image = await convertImageToDataUri(imageUri);
      console.log('📸 Image converted to base64');

      // Create the prompt for comprehensive disease analysis
      const prompt = `
You are an expert agricultural pathologist and crop specialist. Analyze this image of a crop/plant for disease identification.

Please provide a comprehensive analysis in the following JSON format:

{
  "cropType": "Name of the crop/plant identified",
  "diseaseDetected": true/false,
  "diseaseName": "Name of the disease if detected, null if healthy",
  "confidence": 0-100,
  "severity": "low/medium/high",
  "symptoms": ["List of visible symptoms you can identify"],
  "causes": ["Possible causes of this disease"],
  "prevention": {
    "cultural": ["Cultural/farming practices to prevent"],
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

Key analysis requirements:
1. Identify the crop type first
2. Look for signs of disease: discoloration, spots, wilting, deformation, pest damage
3. If disease is detected, provide the most likely disease name
4. Give confidence level based on image clarity and symptom visibility
5. Provide practical, actionable advice for farmers
6. Include both organic and conventional treatment options
7. Focus on prevention strategies
8. Consider local/common diseases for the identified crop

Be specific and practical in your recommendations. If the image is unclear or no disease is visible, indicate a healthy plant but still provide general prevention advice for that crop type.
`;

      console.log('📤 Sending image to Gemini for analysis...');
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image.split(',')[1], // Remove data:image/jpeg;base64, prefix
            mimeType: 'image/jpeg'
          }
        }
      ]);

      console.log('📥 Received response from Gemini');
      
      const response = await result.response;
      const text = response.text();
      
      console.log('🔍 Raw response length:', text.length);
      console.log('🔍 Raw response preview:', text.substring(0, 200));

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysisResult: DiseaseAnalysisResult = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Disease analysis completed successfully');
      console.log('🌱 Crop identified:', analysisResult.cropType);
      console.log('🦠 Disease detected:', analysisResult.diseaseDetected);
      
      return analysisResult;
      
    } catch (error) {
      console.error('❌ Disease identification error:', error);
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          throw new Error('AI service is temporarily overloaded. Please try again in a moment.');
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Analysis timed out. Please try again with a clearer image.');
        }
        
        if (error.message.includes('JSON')) {
          throw new Error('Unable to process analysis results. Please try again.');
        }
      }
      
      throw new Error(`Disease identification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get general disease prevention tips for a specific crop
   */
  async getPreventionTips(cropType: string): Promise<string[]> {
    try {
      const prompt = `
Provide general disease prevention tips for ${cropType} crops. 
Return a JSON array of practical prevention strategies:
["tip1", "tip2", "tip3", ...]

Focus on:
- Cultural practices
- Environmental management
- Early detection methods
- Organic prevention methods
- Common diseases to watch for
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ Prevention tips error:', error);
      return [
        'Maintain proper plant spacing for air circulation',
        'Water at soil level to avoid wet foliage',
        'Remove infected plant material promptly',
        'Practice crop rotation',
        'Monitor plants regularly for early signs of disease'
      ];
    }
  }
}

// Singleton instance
let diseaseService: DiseaseIdentificationService | null = null;

export const getDiseaseIdentificationService = (): DiseaseIdentificationService => {
  if (!diseaseService) {
    diseaseService = new DiseaseIdentificationService();
  }
  return diseaseService;
};
