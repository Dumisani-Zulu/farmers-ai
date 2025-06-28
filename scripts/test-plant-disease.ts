// Test script for plant disease identification
import { agriculturalAITools } from '../lib/agricultural-ai-tools';

async function testPlantDiseaseIdentification() {
  console.log('🧪 Starting Plant Disease AI Test...\n');
  
  try {
    // Initialize the AI tools
    console.log('🔧 Initializing AI tools...');
    await agriculturalAITools.initialize();
    console.log('✅ AI tools initialized successfully\n');
    
    // Test with mock image
    console.log('📸 Testing with mock image...');
    const testImageUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    const result = await agriculturalAITools.identifyPlantDisease(testImageUri);
    
    console.log('🔬 Analysis Results:');
    console.log('==================');
    console.log(`Disease: ${result.disease}`);
    console.log(`Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`Severity: ${result.severity}`);
    console.log(`Description: ${result.description}`);
    console.log(`Treatment: ${result.treatment}`);
    console.log('==================\n');
    
    // Check memory usage
    const memoryInfo = agriculturalAITools.getMemoryInfo();
    console.log('💾 Memory Usage:');
    console.log(`Tensors: ${memoryInfo.numTensors}`);
    console.log(`Data Buffers: ${memoryInfo.numDataBuffers}`);
    console.log(`Memory: ${Math.round(memoryInfo.numBytes / 1024)} KB\n`);
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the test
testPlantDiseaseIdentification();
