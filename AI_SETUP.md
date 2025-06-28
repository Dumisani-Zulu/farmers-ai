# Farmers AI App - Gemini AI & TensorFlow.js Setup

This React Native/Expo app integrates Google's Gemini AI and TensorFlow.js for advanced agricultural intelligence features.

## 🚀 Features

- **Gemini AI Integration**: Real-time agricultural insights using Google's latest AI model
- **Crop Health Analysis**: AI-powered crop disease detection and health scoring
- **Weather-Based Advice**: Smart farming recommendations based on weather patterns
- **Seasonal Guidance**: Personalized farming advice based on location and crop type
- **Pest & Disease Management**: Expert diagnosis and treatment recommendations
- **Smart Recommendations**: Tailored suggestions based on farmer profile and resources
- **Image Recognition**: TensorFlow.js powered crop analysis from photos

## 📦 Installed Packages

### Gemini AI
- `@google/generative-ai` - Direct Google Gemini AI SDK
- `@genkit-ai/core` - Core Genkit framework (for advanced flows)
- `@genkit-ai/googleai` - Google AI models integration
- `@genkit-ai/ai` - AI generation capabilities

### TensorFlow.js
- `@tensorflow/tfjs` - Core TensorFlow.js library
- `@tensorflow/tfjs-react-native` - React Native platform adapter
- `@tensorflow/tfjs-backend-webgl` - WebGL backend for GPU acceleration

## 🔧 Setup Instructions

### 1. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in `.env`:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_API_KEY=your_firebase_api_key
   ```

### 2. Get API Keys

#### Google AI API Key (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

**Note: Your API key is already configured in the .env.example file!**

#### Firebase Configuration (Optional)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Go to Project Settings > General
4. Copy Project ID and Web API Key

### 3. File Structure

```
lib/
├── genkit.ts              # Genkit configuration
├── tensorflow.ts          # TensorFlow.js service
└── agriculture-ai.ts      # Combined AI service for agriculture

hooks/
└── useAgricultureAI.ts    # React hook for AI services

components/
└── AITestComponent.tsx    # Test component for AI features
```

## 💻 Usage Examples

### Basic Hook Usage

```tsx
import { useAgricultureAI } from '@/hooks/useAgricultureAI';

export default function CropScreen() {
  const {
    isInitialized,
    isLoading,
    cropAnalysis,
    analyzeCrop,
  } = useAgricultureAI();

  const handleAnalyzeCrop = async () => {
    await analyzeCrop({
      cropType: 'Tomato',
      location: { latitude: 40.7128, longitude: -74.0060 },
      soilData: { ph: 6.5, moisture: 45, temperature: 22 },
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={handleAnalyzeCrop}>
        <Text>Analyze Crop</Text>
      </TouchableOpacity>
      {cropAnalysis && (
        <Text>Health Score: {cropAnalysis.healthScore}</Text>
      )}
    </View>
  );
}
```

### Image Analysis

```tsx
import { tensorFlowService } from '@/lib/tensorflow';

// After taking a photo with expo-camera
const analyzeImage = async (imageUri: string) => {
  // Convert image to suitable format
  const imageData = await processImageFromUri(imageUri);
  
  await analyzeCrop({
    imageData,
    cropType: 'Corn',
    location: currentLocation,
  });
};
```

## 🧪 Testing

Use the `AITestComponent` to test all AI features:

```tsx
import { AITestComponent } from '@/components/AITestComponent';

// Add to any screen
<AITestComponent />
```

## 🔥 Key Features Explained

### 1. Crop Health Analysis
- Combines image recognition with environmental data
- Uses TensorFlow.js for image processing
- Genkit AI for intelligent insights and recommendations

### 2. Weather Prediction
- ML-based forecasting models
- Integration with location services
- Farming-specific advice based on weather patterns

### 3. Seasonal Advice
- Location-aware recommendations
- Crop-specific guidance
- Current date and season considerations

### 4. Personalized Recommendations
- Farmer experience level adaptation
- Resource-based suggestions
- Multi-crop rotation planning

## 🚨 Important Notes

### Memory Management
TensorFlow.js operations create tensors that need proper cleanup:

```tsx
// Always dispose tensors after use
const tensor = tf.tensor([1, 2, 3, 4]);
// ... use tensor
tensor.dispose();

// Or use tf.tidy for automatic cleanup
const result = tf.tidy(() => {
  const a = tf.tensor([1, 2, 3, 4]);
  const b = tf.tensor([5, 6, 7, 8]);
  return a.add(b);
});
```

### Performance Tips
1. Initialize AI services once in app startup
2. Use background processing for heavy computations
3. Implement proper loading states
4. Cache results when appropriate

### Error Handling
The `useAgricultureAI` hook includes comprehensive error handling:
- Network failures
- API rate limits
- Invalid inputs
- Service initialization errors

## 🔧 Customization

### Adding New AI Flows
1. Create new flow in `agriculture-ai.ts`:
   ```tsx
   const newFlow = defineFlow({
     name: 'newFeature',
     inputSchema: 'object',
     outputSchema: 'object',
   }, async (input) => {
     // Your AI logic here
   });
   ```

2. Add method to `AgricultureAIService` class
3. Update the hook with new state and methods

### Custom TensorFlow Models
Replace mock models with actual trained models:

```tsx
// In tensorflow.ts
async loadCustomModel(modelUrl: string) {
  const model = await tf.loadLayersModel(modelUrl);
  return model;
}
```

## 📱 Integration with Expo Features

### Camera Integration
```tsx
import { Camera } from 'expo-camera';

// Take photo and analyze
const takePicture = async () => {
  const photo = await cameraRef.current?.takePictureAsync();
  if (photo) {
    await analyzeCrop({ imageData: photo.uri });
  }
};
```

### Location Services
```tsx
import * as Location from 'expo-location';

// Get current location for analysis
const getCurrentLocation = async () => {
  const location = await Location.getCurrentPositionAsync();
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"TensorFlow not initialized"**
   - Ensure `tensorFlowService.initialize()` is called
   - Check if WebGL backend is supported

2. **"API key not found"**
   - Verify `.env` file is present and properly configured
   - Restart the development server after adding keys

3. **"Genkit flow failed"**
   - Check network connectivity
   - Verify API key permissions
   - Review input data format

### Debug Mode
Enable debug logging:

```tsx
// In genkit.ts
export const genkit = configureGenkit({
  plugins: [firebase(), googleAI()],
  logLevel: 'debug', // Enable debug logs
});
```

## 📄 License

This project is part of the Farmers AI app and includes integrations with:
- Google Genkit (Apache 2.0 License)
- TensorFlow.js (Apache 2.0 License)
