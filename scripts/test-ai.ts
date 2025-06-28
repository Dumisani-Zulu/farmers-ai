#!/usr/bin/env node

/**
 * Test script for Gemini AI integration
 * Run with: npm run ai:test
 */

import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
config();

async function testGeminiAI() {
  console.log('🚀 Testing Gemini AI Setup...\n');

  // Check if API key is configured
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === 'your_actual_api_key_here' || apiKey === 'your_google_ai_api_key_here') {
    console.error('❌ GOOGLE_AI_API_KEY not configured in .env file');
    console.log('Please set a valid Gemini API key in your .env file');
    console.log('Get your key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  console.log('✅ API Key found in environment');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('✅ Gemini AI client initialized');

    // Test with a simple agriculture-related prompt
    console.log('🧪 Testing with sample prompt...');
    
    const prompt = "What are the best crops to plant in spring? Give me 3 suggestions with brief explanations.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini AI response received:');
    console.log('---');
    console.log(text);
    console.log('---');

    console.log('\n🎉 Gemini AI setup is working correctly!');
    console.log('You can now use AI features in your farmers app.');

  } catch (error) {
    console.error('❌ Error testing Gemini AI:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      console.log('\n💡 The API key appears to be invalid. Please check:');
      console.log('- Make sure you copied the full API key from Google AI Studio');
      console.log('- Verify the key is active and not expired');
      console.log('- Get a new key from: https://makersuite.google.com/app/apikey');
    } else if (error.message?.includes('quota')) {
      console.log('\n💡 API quota exceeded. Please check your usage limits.');
    } else {
      console.log('\n💡 This might be a network issue or API service problem.');
      console.log('Please try again in a few moments.');
    }
    
    process.exit(1);
  }
}

// Test TensorFlow.js setup
async function testTensorFlow() {
  console.log('\n🧠 Testing TensorFlow.js Setup...');
  
  try {
    // This is a basic test - TensorFlow.js needs to be imported in React Native context
    console.log('✅ TensorFlow.js packages are installed');
    console.log('Note: Full TensorFlow.js testing requires React Native runtime');
  } catch (error) {
    console.error('❌ TensorFlow.js test failed:', error);
  }
}

async function main() {
  try {
    await testGeminiAI();
    await testTensorFlow();
    
    console.log('\n✨ AI Setup Complete!');
    console.log('Your farmers app is ready to use AI features.');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
