/**
 * Gemini AI Service
 * Handles communication with Google's Gemini AI API
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getAIConfig } from '../config';

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config = getAIConfig();

  constructor() {
    console.log('🤖 Initializing Gemini AI service...');
    console.log('🔑 API Key status:', this.config.gemini.apiKey ? 'SET' : 'NOT SET');
    
    if (!this.config.gemini.apiKey) {
      console.error('❌ Google AI API key is required. Please set EXPO_PUBLIC_GOOGLE_API_KEY in your environment.');
      throw new Error('Google AI API key is required. Please set EXPO_PUBLIC_GOOGLE_API_KEY in your environment.');
    }

    this.genAI = new GoogleGenerativeAI(this.config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.gemini.model });
    console.log('✅ Gemini AI service initialized with model:', this.config.gemini.model);
  }

  /**
   * Generate text using Gemini AI
   */
  async generateText(prompt: string): Promise<string> {
    try {
      console.log('🔍 Gemini generateText called with prompt length:', prompt.length);
      console.log('🤖 Using model:', this.config.gemini.model);
      console.log('🔑 API key configured:', !!this.config.gemini.apiKey);
      
      const result = await this.model.generateContent(prompt);
      console.log('📥 Received result from Gemini');
      
      const response = await result.response;
      const text = response.text();
      console.log('✅ Successfully extracted text, length:', text.length);
      
      return text;
    } catch (error) {
      console.error('❌ Gemini AI generation error:', error);
      
      if (error instanceof Error) {
        console.error('🔍 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate structured data using Gemini AI
   */
  async generateStructuredData<T>(prompt: string, schema: string): Promise<T> {
    try {
      console.log('🔍 Gemini generateStructuredData called');
      console.log('📏 Prompt length:', prompt.length);
      console.log('🏗️ Schema:', schema);
      
      const structuredPrompt = `${prompt}\n\nPlease respond with valid JSON that follows this schema:\n${schema}\n\nResponse:`;
      console.log('📤 Sending request to Gemini...');
      
      const response = await this.generateText(structuredPrompt);
      console.log('📥 Raw Gemini response length:', response.length);
      console.log('📥 Raw Gemini response (first 200 chars):', response.substring(0, 200));
      
      // Clean up the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No valid JSON found in AI response');
        console.error('📋 Full response:', response);
        throw new Error('No valid JSON found in AI response');
      }

      console.log('✅ JSON extracted, parsing...');
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed JSON structure');
      
      return parsed;
    } catch (error) {
      console.error('❌ Structured data generation error:', error);
      
      if (error instanceof Error) {
        console.error('🔍 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      throw new Error(`Failed to generate structured AI response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.gemini.apiKey;
  }
}

// Singleton instance
let geminiService: GeminiAIService | null = null;

export const getGeminiService = (): GeminiAIService => {
  if (!geminiService) {
    geminiService = new GeminiAIService();
  }
  return geminiService;
};
