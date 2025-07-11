# AI Module Documentation

This folder contains the AI functionality for the Farmers App, built with Gemini AI and TensorFlow.js.

## Structure

```
ai/
├── config.ts                 # AI configuration and settings
├── index.ts                  # Main entry point for AI services
├── data/
│   └── crop-database.ts      # Comprehensive crop information database
├── services/
│   ├── gemini-service.ts     # Gemini AI integration
│   ├── tensorflow-service.ts # TensorFlow.js service (future ML models)
│   └── crop-recommendation-service.ts # Main crop recommendation logic
└── utils/
    └── weather-analysis.ts   # Weather data analysis utilities
```

## Features

### 🌱 AI-Powered Crop Recommendations (Stage 1 - Implemented)

The crop recommendation system uses **AI-generated suggestions** based on weather data analysis, eliminating the need for hardcoded crop databases.

**Key Components:**
- **Dynamic AI Generation**: Uses Gemini AI to generate crop suggestions tailored to specific weather conditions
- **Weather Analysis**: Analyzes current and forecasted weather conditions
- **Personalized Insights**: Provides context-aware recommendations based on location, weather, and farmer profile
- **Actionable Plans**: Generates 14-day farming guides with specific planting advice
- **Comprehensive Reasoning**: Each recommendation includes detailed explanations for temperature, rainfall, and pest considerations

**AI-Generated Content:**
- **Diverse Crop Suggestions**: AI suggests cereals, vegetables, legumes, and other crops (not limited to predefined lists)
- **Weather-Specific Reasoning**: Detailed analysis of why each crop suits the current forecast
- **Actionable Farming Plans**: Step-by-step guides for land preparation, planting, and early management
- **Local Context**: Recommendations consider regional farming practices and market conditions

### 🤖 AI Services

#### Gemini AI Service
- Text generation and structured data responses
- Personalized farming advice
- Context-aware recommendations based on location and weather

#### TensorFlow Service (Future Use)
- Ready for custom ML model integration
- Support for crop disease detection
- Yield prediction models

## Usage

### Basic Initialization

```typescript
import { initializeAI, checkAIHealth } from '@/ai';

// Initialize AI services
await initializeAI();

// Check service health
const health = await checkAIHealth();
console.log('AI Services:', health);
```

### Getting AI-Generated Crop Recommendations

```typescript
import { getAICropRecommendationService } from '@/ai/services/ai-crop-recommendation-service';

const aiCropService = getAICropRecommendationService();
const recommendations = await aiCropService.getRecommendations(weatherData, {
  maxRecommendations: 8,
  minSuitabilityScore: 40,
  experienceLevel: 'intermediate',
  farmSize: 'medium',
  marketFocus: 'local',
  language: 'English' // Supports multiple languages
});

// Each recommendation includes:
// - AI-generated crop suggestions
// - Detailed reasoning with markdown formatting
// - Weather-specific suitability analysis
// - 14-day actionable farming plans
// - Temperature, rainfall, and pest considerations
```

### Weather Analysis

```typescript
import { analyzeWeatherData, calculateWeatherSuitability } from '@/ai';

const analysis = analyzeWeatherData(weatherData);
const suitability = calculateWeatherSuitability(analysis, cropRequirements);
```

## Configuration

Set up your environment variables in `.env`:

```bash
# Required for Gemini AI
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_ai_api_key

# Optional AI settings
EXPO_PUBLIC_AI_MODEL_VERSION=gemini-pro
EXPO_PUBLIC_AI_TEMPERATURE=0.7
EXPO_PUBLIC_AI_MAX_TOKENS=1000
```

## Implementation Stages

### ✅ Stage 1: Crop Recommendations
- Weather-based crop analysis
- AI-powered insights
- Comprehensive crop database
- Suitability scoring algorithm

### 🔄 Stage 2: Enhanced Analytics (Future)
- Historical weather pattern analysis
- Seasonal planning recommendations
- Market price integration
- Soil condition analysis

### 🔄 Stage 3: Computer Vision (Future)
- Plant disease detection
- Growth stage monitoring
- Pest identification
- Yield estimation

### 🔄 Stage 4: Predictive Models (Future)
- Custom TensorFlow models
- Yield prediction
- Risk assessment
- Resource optimization

## Error Handling

The AI module includes comprehensive error handling:
- Graceful fallbacks when AI services are unavailable
- User-friendly error messages
- Offline capability for basic recommendations

## Performance

- Lazy loading of AI services
- Caching of recommendations
- Optimized API calls to minimize costs
- Memory management for TensorFlow models

## Contributing

When adding new AI features:
1. Follow the existing service pattern
2. Add comprehensive error handling
3. Include fallback mechanisms
4. Update this documentation
5. Add appropriate TypeScript types

## Dependencies

- `@google/generative-ai`: Gemini AI integration
- `@tensorflow/tfjs`: Machine learning capabilities
- `@tensorflow/tfjs-react-native`: React Native TensorFlow support
