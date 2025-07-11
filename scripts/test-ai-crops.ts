/**
 * Test script for AI Crop Recommendations
 * Run this to test the AI crop recommendation service
 */

import { config } from 'dotenv';
import { getAICropRecommendationService } from '../ai/services/ai-crop-recommendation-service';

// Load environment variables from .env file
config();

// Set EXPO_PUBLIC_GOOGLE_API_KEY if not already set (for testing)
if (!process.env.EXPO_PUBLIC_GOOGLE_API_KEY && process.env.GOOGLE_AI_API_KEY) {
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
}

// Mock weather data for testing
const mockWeatherData = {
  current: {
    temperature: 25,
    humidity: 65,
    precipitation: 5,
    windSpeed: 10,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with occasional sunshine',
  },
  forecast: [
    {
      date: '2025-07-12',
      temperature: { min: 18, max: 28 },
      humidity: 60,
      precipitation: 2,
      windSpeed: 8,
      condition: 'Sunny',
      description: 'Clear skies',
    },
    {
      date: '2025-07-13',
      temperature: { min: 20, max: 30 },
      humidity: 70,
      precipitation: 10,
      windSpeed: 12,
      condition: 'Light Rain',
      description: 'Light rainfall expected',
    },
    {
      date: '2025-07-14',
      temperature: { min: 19, max: 27 },
      humidity: 65,
      precipitation: 0,
      windSpeed: 15,
      condition: 'Cloudy',
      description: 'Overcast conditions',
    },
    // Add more forecast days...
    {
      date: '2025-07-15',
      temperature: { min: 21, max: 29 },
      humidity: 55,
      precipitation: 0,
      windSpeed: 10,
      condition: 'Sunny',
      description: 'Bright and sunny',
    },
    {
      date: '2025-07-16',
      temperature: { min: 22, max: 31 },
      humidity: 60,
      precipitation: 5,
      windSpeed: 8,
      condition: 'Partly Cloudy',
      description: 'Mixed sun and clouds',
    },
  ],
  location: {
    latitude: -15.4067,
    longitude: 28.2871,
    address: 'Lusaka, Zambia',
    city: 'Lusaka',
    region: 'Lusaka Province',
    country: 'Zambia',
    timestamp: Date.now(),
    accuracy: 10,
  },
  lastUpdated: Date.now(),
};

async function testAICropRecommendations() {
  console.log('🧪 Testing AI Crop Recommendations Service...');
  
  try {
    const aiCropService = getAICropRecommendationService();
    
    console.log('📍 Location:', mockWeatherData.location.city, mockWeatherData.location.country);
    console.log('🌡️ Current Temperature:', mockWeatherData.current.temperature + '°C');
    console.log('☁️ Condition:', mockWeatherData.current.condition);
    
    const recommendations = await aiCropService.getRecommendations(mockWeatherData, {
      maxRecommendations: 5,
      minSuitabilityScore: 40,
      experienceLevel: 'intermediate',
      farmSize: 'medium',
      marketFocus: 'local',
      language: 'English',
    });
    
    console.log('\\n🌱 AI Crop Recommendations:');
    console.log('=============================');
    
    recommendations.forEach((crop, index) => {
      console.log(`\\n${index + 1}. ${crop.name}`);
      console.log(`   Suitability Score: ${crop.suitabilityScore}/100`);
      console.log(`   Planting Date: ${crop.plantingDate}`);
      console.log(`   Description: ${crop.description}`);
      
      if (crop.actionablePlan) {
        console.log(`   🚜 Land Prep: ${crop.actionablePlan.landPreparation.substring(0, 100)}...`);
        console.log(`   🌱 Planting: ${crop.actionablePlan.plantingAdvice.substring(0, 100)}...`);
      }
      
      if (crop.reasons && crop.reasons.length > 0) {
        console.log(`   ✅ Reasons: ${crop.reasons[0].substring(0, 100)}...`);
      }
    });
    
    console.log('\\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      console.log('\\n💡 Make sure to set your EXPO_PUBLIC_GOOGLE_API_KEY in your .env file');
    }
  }
}

// Export for use in other scripts
export { testAICropRecommendations, mockWeatherData };

// Run test if this file is executed directly
if (require.main === module) {
  testAICropRecommendations();
}
