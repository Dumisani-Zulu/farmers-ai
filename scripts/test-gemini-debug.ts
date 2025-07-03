import 'dotenv/config';
import { geminiAI } from '../lib/gemini-ai';

// Test weather data
const testWeatherData = {
  current: {
    temperature: 22,
    humidity: 65,
    precipitation: 0,
    windSpeed: 12,
    condition: 'partly-cloudy',
    description: 'Partly cloudy'
  },
  forecast: [
    {
      date: '2025-07-01',
      temperature: { min: 18, max: 26 },
      humidity: 70,
      precipitation: 2.5,
      windSpeed: 10,
      condition: 'rain',
      description: 'Light rain'
    },
    {
      date: '2025-07-02',
      temperature: { min: 20, max: 28 },
      humidity: 60,
      precipitation: 0,
      windSpeed: 8,
      condition: 'sunny',
      description: 'Sunny'
    },
    {
      date: '2025-07-03',
      temperature: { min: 19, max: 25 },
      humidity: 75,
      precipitation: 5.0,
      windSpeed: 15,
      condition: 'rain',
      description: 'Moderate rain'
    },
    {
      date: '2025-07-04',
      temperature: { min: 21, max: 27 },
      humidity: 55,
      precipitation: 0,
      windSpeed: 6,
      condition: 'sunny',
      description: 'Clear sunny'
    },
    {
      date: '2025-07-05',
      temperature: { min: 23, max: 29 },
      humidity: 60,
      precipitation: 0.5,
      windSpeed: 8,
      condition: 'partly-cloudy',
      description: 'Partly cloudy'
    },
    {
      date: '2025-07-06',
      temperature: { min: 22, max: 28 },
      humidity: 65,
      precipitation: 1.0,
      windSpeed: 10,
      condition: 'cloudy',
      description: 'Overcast'
    },
    {
      date: '2025-07-07',
      temperature: { min: 20, max: 26 },
      humidity: 70,
      precipitation: 8.0,
      windSpeed: 20,
      condition: 'thunderstorm',
      description: 'Thunderstorm'
    }
  ],
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    region: 'New York',
    country: 'United States',
    name: 'New York, New York, United States'
  },
  lastUpdated: Date.now()
};

async function testGeminiAI() {
  console.log('🧪 Testing Gemini AI Crop Recommendations...');
  console.log('');
  
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    console.log('🔑 API Key available:', !!apiKey);
    console.log('🔑 API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
    console.log('');
    
    // Try to initialize Gemini AI
    console.log('🚀 Initializing Gemini AI...');
    await geminiAI.initialize();
    console.log('✅ Gemini AI initialized successfully');
    console.log('');
    
    // Check status
    const status = geminiAI.getStatus();
    console.log('📊 Gemini AI Status:', status);
    console.log('');
    
    // Test basic text generation
    console.log('🔤 Testing basic text generation...');
    const basicTest = await geminiAI.generateText('Generate a simple greeting for farmers: just say "Hello farmers!"');
    console.log('📝 Basic test result:', basicTest);
    console.log('');
    
    // Test crop recommendations
    console.log('🌱 Testing crop recommendations with weather data...');
    console.log('📍 Location:', testWeatherData.location.name);
    console.log('🌡️ Current temp:', testWeatherData.current.temperature + '°C');
    console.log('💧 Current humidity:', testWeatherData.current.humidity + '%');
    console.log('📅 Forecast days:', testWeatherData.forecast.length);
    console.log('');
    
    const cropRecommendations = await geminiAI.generateCropRecommendations(testWeatherData);
    console.log('🌾 Raw Gemini Response:');
    console.log('=====================================');
    console.log(cropRecommendations);
    console.log('=====================================');
    console.log('');
    
    // Try to parse the JSON response
    try {
      const jsonStart = cropRecommendations.indexOf('{');
      const jsonEnd = cropRecommendations.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > 0) {
        const jsonStr = cropRecommendations.substring(jsonStart, jsonEnd);
        console.log('📋 Extracted JSON:');
        console.log(jsonStr);
        console.log('');
        
        const parsed = JSON.parse(jsonStr);
        console.log('✅ Successfully parsed JSON');
        console.log('📊 Number of recommendations:', parsed.recommendations?.length || 0);
        
        if (parsed.recommendations && parsed.recommendations.length > 0) {
          console.log('');
          console.log('🌱 Sample recommendation:');
          console.log('- Name:', parsed.recommendations[0].name);
          console.log('- Variety:', parsed.recommendations[0].variety);
          console.log('- Score:', parsed.recommendations[0].suitabilityScore);
          console.log('- Planting:', parsed.recommendations[0].plantingWindow);
          console.log('- Harvest:', parsed.recommendations[0].expectedHarvest);
          console.log('- Reasons:', parsed.recommendations[0].reasons?.length || 0, 'reasons provided');
        }
      } else {
        console.log('❌ No JSON found in response');
      }
    } catch (parseError: any) {
      console.log('❌ Failed to parse JSON:', parseError.message);
      console.log('This means the AI response format is not what we expected.');
    }
    
    console.log('');
    console.log('🎉 Test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message && error.message.includes('API key')) {
      console.log('');
      console.log('💡 Solution: Make sure GOOGLE_AI_API_KEY is set in your .env file');
      console.log('💡 Get an API key from: https://makersuite.google.com/app/apikey');
    }
  }
}

// Run the test
testGeminiAI().catch(console.error);
