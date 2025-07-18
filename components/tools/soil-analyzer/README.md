# Soil Analyzer

A comprehensive soil analysis tool that uses AI to analyze soil images and provide detailed information about soil properties, suitability for crops, and management recommendations.

## Features

- **Visual Soil Analysis**: Upload or take photos of soil samples for AI-powered analysis
- **Comprehensive Results**: Get detailed information about soil type, texture, pH, organic matter, drainage, and more
- **Crop Suitability**: Recommendations for crops that would thrive in the analyzed soil
- **Management Guidance**: Practical advice for soil improvement, fertilization, and farming practices
- **Warnings & Recommendations**: Important alerts and actionable recommendations for farmers

## Components

### SoilAnalyzer.tsx
The main component that handles:
- Image selection (camera or gallery)
- AI analysis integration
- Quick results display
- Navigation to detailed results

### SoilAnalysisResults.tsx
Detailed results component that displays:
- Basic soil information (type, color, texture, structure)
- Estimated soil properties (pH, organic matter, drainage, compaction, fertility)
- Suitable crops for the soil type
- Warnings and important considerations
- Soil improvement recommendations
- Fertilization recommendations
- Management practices (irrigation, cultivation, cropping)
- Key actionable recommendations

## Analysis Results Structure

The AI provides comprehensive analysis including:

```typescript
interface SoilAnalysisResult {
  soilType: string;
  confidence: number;
  soilColor: string;
  texture: 'sandy' | 'clay' | 'loamy' | 'silt' | 'mixed';
  structure: string;
  estimatedProperties: {
    pH: { level: string; range: string; description: string };
    organicMatter: { level: string; percentage: string; description: string };
    drainage: { level: string; description: string };
    compaction: { level: string; description: string };
    fertility: { level: string; description: string };
  };
  suitableFor: string[];
  improvements: { immediate: string[]; seasonal: string[]; longTerm: string[] };
  fertilization: { organic: string[]; chemical: string[]; timing: string[] };
  management: { irrigation: string[]; cultivation: string[]; cropping: string[] };
  warnings: string[];
  recommendations: string[];
}
```

## Usage

1. **Select Image**: Choose to take a photo or select from gallery
2. **Analyze**: Tap the "Analyze Soil" button to start AI analysis
3. **View Results**: See quick results and tap "View Detailed Analysis" for comprehensive information
4. **Follow Recommendations**: Use the provided guidance for soil management and crop selection

## AI Service Integration

The component uses the `SoilAnalysisService` which:
- Integrates with Google's Gemini Vision API
- Provides comprehensive soil analysis based on visual characteristics
- Includes error handling for various scenarios
- Returns structured data for easy display

## Error Handling

The component handles various error scenarios:
- Service overload
- Analysis timeout
- API configuration errors
- Invalid image formats
- Network connectivity issues

## Features in Detail

### Visual Analysis
- Identifies soil type based on color and texture
- Assesses soil structure and aggregation
- Estimates moisture content and drainage
- Detects compaction and other issues

### Practical Recommendations
- Suggests suitable crops for the soil type
- Provides immediate and long-term improvement strategies
- Offers both organic and chemical fertilization options
- Includes timing recommendations for best results

### Management Guidance
- Irrigation recommendations based on soil properties
- Cultivation practices suitable for the soil type
- Crop rotation and management advice
- Sustainable soil health practices
