import { getGeminiService } from '../ai/services/gemini-service';

interface PlantDiseaseResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

export const agriculturalAITools = {
  async identifyPlantDisease(dataUri: string): Promise<PlantDiseaseResult> {
    const gemini = getGeminiService();
    // Simple prompt for extraction
    const prompt = `You are an expert plant pathologist. Analyze this image to identify the plant disease, confidence, description, recommended treatment, and severity ('low','medium','high'). Only output JSON with keys: disease, confidence (0-1), description, treatment, severity.`;
    const schema = `{
      "disease": "string",
      "confidence": "number",
      "description": "string",
      "treatment": "string",
      "severity": "low|medium|high"
    }`;
    // Remove data URI prefix for inline image
    const base64 = dataUri.replace(/^data:image\/[a-z]+;base64,/, '');

    const result = await gemini.generateStructuredDataWithImage<PlantDiseaseResult>(prompt, schema, base64);
    return result;
  }
};
