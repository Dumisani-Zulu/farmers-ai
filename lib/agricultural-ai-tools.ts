import { geminiAI } from './gemini-ai';
import { z } from 'zod';

export interface PlantDiseaseResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PestResult {
  pest: string;
  confidence: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WeedResult {
  weed: string;
  confidence: number;
  description: string;
  treatment: string;
  invasiveness: 'low' | 'medium' | 'high';
}

export interface SoilAnalysisResult {
  soilType: string;
  pH: number;
  fertility: 'poor' | 'fair' | 'good' | 'excellent';
  moisture: 'dry' | 'optimal' | 'wet';
  recommendations: string[];
  confidence: number;
}

const DiagnosePlantDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
  language: z.string().optional().describe("The target language for the output (e.g., 'Nyanja', 'Bemba'). If not provided, English will be used."),
});
export type DiagnosePlantDiseaseInput = z.infer<typeof DiagnosePlantDiseaseInputSchema>;

const DiagnosePlantDiseaseOutputSchema = z.object({
  plantName: z.string().describe("The common name of the plant identified in the image."),
  isHealthy: z.boolean().describe("A boolean indicating if the plant appears to be healthy."),
  disease: z.string().describe("The name of the disease identified. If the plant is healthy, this should be 'None'."),
  confidence: z.enum(["High", "Medium", "Low"]).describe("The model's confidence in its diagnosis."),
  diagnosis: z.string().describe("A detailed diagnosis of the plant's condition in markdown format. It should describe the symptoms seen in the image and explain the likely cause."),
  treatment: z.string().describe("A detailed, actionable treatment plan in markdown format. It should suggest specific organic and chemical control methods, as well as preventative measures a farmer can take."),
});
export type DiagnosePlantDiseaseOutput = z.infer<typeof DiagnosePlantDiseaseOutputSchema>;

class AgriculturalAITools {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await geminiAI.initialize();
      this.isInitialized = true;
      console.log('✅ Agricultural AI Tools initialized with Gemini AI (server-side)');
    } catch (error) {
      console.error('❌ Failed to initialize Agricultural AI Tools:', error);
      throw error;
    }
  }

  async identifyPlantDisease(imageUri: string): Promise<PlantDiseaseResult> {
    console.log('🔬 Starting plant disease analysis with Gemini AI...');
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Use Gemini AI for actual image analysis
      console.log('📤 Sending image to Gemini AI for plant disease analysis...');
      
      const prompt = `As an expert plant pathologist, analyze this plant image for diseases and health issues. 

Please examine the image carefully and provide:
1. Disease identification (if any disease is present)
2. Confidence level in your assessment (0-1 scale)
3. Detailed description of what you observe
4. Specific treatment recommendations
5. Severity assessment (low/medium/high)

Important: Focus on visible symptoms like leaf spots, discoloration, wilting, fungal growth, or other disease indicators.

Respond in this exact JSON format:
{
  "disease": "Disease name or 'Healthy' if no disease detected",
  "confidence": 0.85,
  "description": "Detailed description of observations",
  "treatment": "Specific treatment recommendations",
  "severity": "low"
}`;

      const analysis = await this.analyzeImageWithGemini(prompt, imageUri);
      
      console.log('✅ Plant disease analysis completed with Gemini AI:', analysis);
      return analysis as PlantDiseaseResult;

    } catch (error) {
      console.error('❌ Plant disease analysis failed:', error);
      
      return {
        disease: 'Analysis Error',
        confidence: 0,
        description: `Gemini AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. This could be due to network connectivity or API limitations.`,
        treatment: 'Please try again with a clear, well-lit photo of the plant. If problems persist, consult with a local agricultural extension office.',
        severity: 'low'
      };
    }
  }

  async identifyPest(imageUri: string): Promise<PestResult> {
    console.log('🐛 Starting pest identification with Gemini AI...');
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const prompt = `As an expert entomologist and agricultural pest specialist, analyze this image for pest identification.

Please examine the image carefully for:
1. Any visible insects or pest damage
2. Signs of pest activity (holes, chew marks, eggs, etc.)
3. Type of pest if present
4. Assessment of pest pressure/severity

Respond in this exact JSON format:
{
  "pest": "Pest name or 'No Pests Detected' if none found",
  "confidence": 0.85,
  "description": "Detailed description of what you observe",
  "treatment": "Specific treatment recommendations",
  "severity": "low"
}`;

      const analysis = await this.analyzeImageWithGemini(prompt, imageUri);
      return analysis as PestResult;

    } catch (error) {
      console.error('❌ Pest identification failed:', error);
      
      return {
        pest: 'Analysis Error',
        confidence: 0,
        description: `Gemini AI pest analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}.`,
        treatment: 'Please try again with a clear photo showing the pest or damage. Consult with a local agricultural expert if problems persist.',
        severity: 'low'
      };
    }
  }

  async identifyWeed(imageUri: string): Promise<WeedResult> {
    console.log('🌿 Starting weed identification with Gemini AI...');
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const prompt = `As a botanist and weed management specialist, analyze this plant image for weed identification.

Please examine the image and identify:
1. The type of weed (if it is a weed)
2. Key identifying characteristics
3. Level of invasiveness or concern
4. Management recommendations

Respond in this exact JSON format:
{
  "weed": "Weed name or 'No Weeds Detected' if none found",
  "confidence": 0.85,
  "description": "Detailed description of the plant and identifying features",
  "treatment": "Specific management or removal recommendations",
  "invasiveness": "low"
}`;

      const analysis = await this.analyzeImageWithGemini(prompt, imageUri);
      return analysis as WeedResult;

    } catch (error) {
      console.error('❌ Weed identification failed:', error);
      
      return {
        weed: 'Analysis Error',
        confidence: 0,
        description: `Gemini AI weed analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}.`,
        treatment: 'Please try again with a clear photo of the suspected weed. Consult with a local agricultural expert if needed.',
        invasiveness: 'low'
      };
    }
  }

  async analyzeSoil(imageUri: string): Promise<SoilAnalysisResult> {
    console.log('🌱 Starting soil analysis with Gemini AI...');
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const prompt = `As a soil scientist and agricultural specialist, analyze this soil image for soil characteristics and health.

Please examine the soil sample and assess:
1. Soil type (clay, sandy, loam, etc.)
2. Visual indicators of soil health
3. Estimated pH range based on color and texture
4. Moisture content assessment
5. Fertility indicators
6. Specific recommendations for improvement

Respond in this exact JSON format:
{
  "soilType": "Soil type name",
  "pH": 6.5,
  "fertility": "good",
  "moisture": "optimal",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "confidence": 0.85
}`;

      const analysis = await this.analyzeImageWithGemini(prompt, imageUri);
      return analysis as SoilAnalysisResult;

    } catch (error) {
      console.error('❌ Soil analysis failed:', error);
      
      return {
        soilType: 'Analysis Error',
        pH: 7.0,
        fertility: 'fair',
        moisture: 'optimal',
        recommendations: [
          `Gemini AI soil analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Please try again with a clear photo of the soil sample'
        ],
        confidence: 0
      };
    }
  }

  async diagnosePlantDisease(input: DiagnosePlantDiseaseInput): Promise<DiagnosePlantDiseaseOutput> {
    console.log('🌿 Starting plant disease diagnosis with Gemini AI...');

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const languageText = input.language || 'English';
      const prompt = `You are an expert plant pathologist and botanist serving farmers in Zambia. Your task is to analyze the provided image of a plant leaf and provide a clear, actionable diagnosis.

**IMPORTANT: The entire response MUST be in ${languageText}.**

Analyze the image and provide the following information:
1.  **Plant Identification (plantName):** Identify the plant species.
2.  **Health Status (isHealthy):** Determine if the plant is healthy or showing signs of disease.
3.  **Disease Identification (disease):** If the plant is not healthy, identify the specific disease or pest affecting it. If it is healthy, return 'None'.
4.  **Confidence (confidence):** State your confidence level (High, Medium, or Low) in this diagnosis based on the image quality and clarity of symptoms.
5.  **Detailed Diagnosis (diagnosis):** In markdown, provide a detailed description of what you see. Describe the symptoms (e.g., "yellow spots with brown rings," "powdery white substance on the leaf surface," "holes chewed through the leaf"). Explain what these symptoms indicate.
6.  **Actionable Treatment Plan (treatment):** In markdown, provide a comprehensive and practical treatment plan that a Zambian farmer can follow. Include these sections with markdown '##' headings:
    *   **## Immediate Actions:** What should the farmer do right now? (e.g., "Remove and destroy affected leaves.")
    *   **## Organic Control:** Suggest accessible organic methods. (e.g., "Apply a neem oil spray every 7 days.")
    *   **## Chemical Control:** If necessary, suggest a common, accessible chemical treatment, including the active ingredient to look for. (e.g., "If the infestation is severe, use a fungicide containing Mancozeb.")
    *   **## Preventative Measures:** Advise on how to prevent this issue in the future. (e.g., "Ensure proper spacing between plants to improve air circulation.")

Return the full analysis in a structured JSON object with the following format:
{
  "plantName": "Common name of the plant",
  "isHealthy": true/false,
  "disease": "Disease name or 'None' if healthy",
  "confidence": "High/Medium/Low",
  "diagnosis": "Detailed diagnosis in markdown format",
  "treatment": "Detailed treatment plan in markdown format"
}`;

      const response = await geminiAI.analyzeImageWithPrompt(input.photoDataUri, prompt);
      
      console.log('🔍 Raw Gemini AI response:', response);

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed plant disease diagnosis');
          return analysisResult as DiagnosePlantDiseaseOutput;
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse JSON from Gemini response:', parseError);
      }

      // Extract structured data from free-form response
      const structuredResult = this.extractPlantDiagnosisData(response, languageText);
      console.log('✅ Plant disease diagnosis completed:', structuredResult);
      return structuredResult;

    } catch (error) {
      console.error('❌ Plant disease diagnosis failed:', error);

      return {
        plantName: 'Unknown',
        isHealthy: false,
        disease: 'Analysis Error',
        confidence: 'Low',
        diagnosis: `Gemini AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}.`,
        treatment: 'Please try again with a clear, well-lit photo of the plant. If problems persist, consult with a local agricultural extension office.',
      };
    }
  }

  private extractPlantDiagnosisData(response: string, language: string): DiagnosePlantDiseaseOutput {
    // Extract plant diagnosis information from text response
    const plantNameMatch = response.match(/plant\s*name[:\s]+([^\n.]+)/i) || 
                          response.match(/species[:\s]+([^\n.]+)/i) ||
                          response.match(/identified\s*as[:\s]+([^\n.]+)/i);
    
    const diseaseMatch = response.match(/disease[:\s]+([^\n.]+)/i) ||
                        response.match(/condition[:\s]+([^\n.]+)/i);
    
    const confidenceMatch = response.match(/confidence[:\s]+(high|medium|low)/i);
    
    const healthyMatch = response.match(/healthy|no\s*disease|disease-free/i);
    const isHealthy = healthyMatch !== null && !response.match(/not\s*healthy|unhealthy|diseased/i);
    
    // Extract diagnosis and treatment from the response
    const diagnosisStart = response.search(/diagnosis|symptoms|observations/i);
    const treatmentStart = response.search(/treatment|recommendations|control/i);
    
    let diagnosis = '';
    let treatment = '';
    
    if (diagnosisStart !== -1) {
      const diagnosisEnd = treatmentStart !== -1 ? treatmentStart : response.length;
      diagnosis = response.substring(diagnosisStart, diagnosisEnd).trim();
    } else {
      diagnosis = response.substring(0, Math.min(300, response.length)).trim();
    }
    
    if (treatmentStart !== -1) {
      treatment = response.substring(treatmentStart).trim();
    } else {
      treatment = `## Immediate Actions
Remove any affected plant parts if disease is present.

## Organic Control
Apply neem oil or organic fungicides if needed.

## Chemical Control
Consult with agricultural extension office for appropriate chemicals.

## Preventative Measures
Maintain proper plant spacing and good air circulation.`;
    }

    return {
      plantName: plantNameMatch ? plantNameMatch[1].trim() : 'Unknown Plant',
      isHealthy: isHealthy,
      disease: diseaseMatch ? diseaseMatch[1].trim() : (isHealthy ? 'None' : 'Unknown Disease'),
      confidence: confidenceMatch ? (confidenceMatch[1].charAt(0).toUpperCase() + confidenceMatch[1].slice(1).toLowerCase()) as "High" | "Medium" | "Low" : 'Medium',
      diagnosis: diagnosis || 'Analysis of the plant image shows various characteristics that require further examination.',
      treatment: treatment || 'Consult with agricultural expert for specific treatment recommendations.'
    };
  }

  private async analyzeImageWithGemini(prompt: string, imageUri: string): Promise<any> {
    try {
      console.log('🤖 Sending image analysis request to Gemini AI...');
      console.log('📸 Image URI length:', imageUri.length);
      console.log('📝 Prompt length:', prompt.length);

      // Validate image URI format
      if (!imageUri.startsWith('data:image/')) {
        throw new Error('Invalid image format. Expected data URI format starting with data:image/');
      }

      // Directly send the image data to Gemini AI for analysis
      const response = await geminiAI.analyzeImageWithPrompt(imageUri, prompt);
      
      console.log('🔍 Raw Gemini AI response:', response);
      console.log('📊 Response length:', response.length);

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed Gemini AI response:', analysisResult);
          return analysisResult;
        } else {
          console.log('⚠️ No JSON found in response, attempting to extract structured data...');
          
          // Try to extract structured information from the response
          const structuredResult = this.extractStructuredDataFromResponse(response, prompt);
          if (structuredResult) {
            console.log('✅ Successfully extracted structured data from response');
            return structuredResult;
          } else {
            console.error('❌ Failed to extract structured data from response');
            throw new Error('Could not extract structured data from Gemini AI response');
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse JSON from Gemini response:', parseError);
        console.log('📝 Full response content:', response);
        
        // Try to extract structured information from the response
        const structuredResult = this.extractStructuredDataFromResponse(response, prompt);
        if (structuredResult) {
          console.log('✅ Successfully extracted structured data from response');
          return structuredResult;
        } else {
          console.error('❌ Failed to extract structured data from response');
          throw new Error(`Could not parse response from Gemini AI: ${parseError}`);
        }
      }

    } catch (error) {
      console.error('❌ Gemini AI analysis failed:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private extractStructuredDataFromResponse(response: string, prompt: string): any {
    // This method extracts structured data from free-form text responses
    try {
      if (prompt.includes('plant disease') || prompt.includes('pathologist')) {
        return this.extractPlantDiseaseData(response);
      } else if (prompt.includes('pest') || prompt.includes('entomologist')) {
        return this.extractPestData(response);
      } else if (prompt.includes('weed') || prompt.includes('botanist')) {
        return this.extractWeedData(response);
      } else if (prompt.includes('soil') || prompt.includes('soil scientist')) {
        return this.extractSoilData(response);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract structured data:', error);
      return null;
    }
  }

  private extractPlantDiseaseData(response: string): any {
    // Extract plant disease information from text response
    const diseaseMatch = response.match(/disease[:\s]+([^\n.]+)/i);
    const confidenceMatch = response.match(/confidence[:\s]+([^\n.]+)/i);
    const descriptionMatch = response.match(/description[:\s]+([^\n.]+)/i);
    const treatmentMatch = response.match(/treatment[:\s]+([^\n.]+)/i);
    const severityMatch = response.match(/severity[:\s]+([^\n.]+)/i);

    return {
      disease: diseaseMatch ? diseaseMatch[1].trim() : 'Unknown Disease',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) || 0.7 : 0.7,
      description: descriptionMatch ? descriptionMatch[1].trim() : response.substring(0, 200) + '...',
      treatment: treatmentMatch ? treatmentMatch[1].trim() : 'Consult with agricultural expert for treatment recommendations.',
      severity: severityMatch ? severityMatch[1].toLowerCase().trim() : 'medium'
    };
  }

  private extractPestData(response: string): any {
    const pestMatch = response.match(/pest[:\s]+([^\n.]+)/i);
    const confidenceMatch = response.match(/confidence[:\s]+([^\n.]+)/i);
    const descriptionMatch = response.match(/description[:\s]+([^\n.]+)/i);
    const treatmentMatch = response.match(/treatment[:\s]+([^\n.]+)/i);
    const severityMatch = response.match(/severity[:\s]+([^\n.]+)/i);

    return {
      pest: pestMatch ? pestMatch[1].trim() : 'Unknown Pest',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) || 0.7 : 0.7,
      description: descriptionMatch ? descriptionMatch[1].trim() : response.substring(0, 200) + '...',
      treatment: treatmentMatch ? treatmentMatch[1].trim() : 'Consult with agricultural expert for treatment recommendations.',
      severity: severityMatch ? severityMatch[1].toLowerCase().trim() : 'medium'
    };
  }

  private extractWeedData(response: string): any {
    const weedMatch = response.match(/weed[:\s]+([^\n.]+)/i);
    const confidenceMatch = response.match(/confidence[:\s]+([^\n.]+)/i);
    const descriptionMatch = response.match(/description[:\s]+([^\n.]+)/i);
    const treatmentMatch = response.match(/treatment[:\s]+([^\n.]+)/i);
    const invasivenessMatch = response.match(/invasiveness[:\s]+([^\n.]+)/i);

    return {
      weed: weedMatch ? weedMatch[1].trim() : 'Unknown Weed',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) || 0.7 : 0.7,
      description: descriptionMatch ? descriptionMatch[1].trim() : response.substring(0, 200) + '...',
      treatment: treatmentMatch ? treatmentMatch[1].trim() : 'Consult with agricultural expert for treatment recommendations.',
      invasiveness: invasivenessMatch ? invasivenessMatch[1].toLowerCase().trim() : 'medium'
    };
  }

  private extractSoilData(response: string): any {
    const soilTypeMatch = response.match(/soil\s*type[:\s]+([^\n.]+)/i);
    const pHMatch = response.match(/ph[:\s]+([0-9.]+)/i);
    const fertilityMatch = response.match(/fertility[:\s]+([^\n.]+)/i);
    const moistureMatch = response.match(/moisture[:\s]+([^\n.]+)/i);
    const confidenceMatch = response.match(/confidence[:\s]+([^\n.]+)/i);

    return {
      soilType: soilTypeMatch ? soilTypeMatch[1].trim() : 'Unknown Soil Type',
      pH: pHMatch ? parseFloat(pHMatch[1]) : 7.0,
      fertility: fertilityMatch ? fertilityMatch[1].toLowerCase().trim() : 'fair',
      moisture: moistureMatch ? moistureMatch[1].toLowerCase().trim() : 'optimal',
      recommendations: [
        'Based on the analysis, follow recommended agricultural practices for this soil type.',
        'Consider soil testing for more detailed recommendations.'
      ],
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) || 0.7 : 0.7
    };
  }

  getStatus(): { initialized: boolean; backend: string; architecture: string } {
    return {
      initialized: this.isInitialized,
      backend: 'Gemini AI',
      architecture: 'Server-side (Genkit-ready)'
    };
  }
}

export const agriculturalAITools = new AgriculturalAITools();
export default agriculturalAITools;
