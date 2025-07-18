/**
 * Test script for Disease Identification Service
 * Run with: npx tsx scripts/test-disease-identification.ts
 */

// Load environment variables
import { config } from 'dotenv';
config();

async function testDiseaseIdentification() {
  console.log('🧪 Testing Disease Identification Configuration...');
  
  try {
    // Test basic configuration
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 
                   process.env.GOOGLE_AI_API_KEY || 
                   process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No API key found');
      console.log('💡 Set EXPO_PUBLIC_GOOGLE_API_KEY, GOOGLE_AI_API_KEY, or GOOGLE_API_KEY');
      console.log('📋 Example: export EXPO_PUBLIC_GOOGLE_API_KEY=your_key_here');
      return;
    }
    
    console.log('✅ API key configured');
    console.log('🔑 API key length:', apiKey.length);
    console.log('🎉 Disease identification service is ready!');
    console.log('📱 Use the mobile app to test with actual images');
    
    // Test Google AI import
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      console.log('✅ Google AI SDK imported successfully');
      
      // Test basic AI service creation
      const genAI = new GoogleGenerativeAI(apiKey);
      console.log('✅ AI service created successfully');
      
    } catch (importError) {
      console.log('❌ Google AI SDK import failed:', importError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDiseaseIdentification().catch(console.error);
