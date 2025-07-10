import { agriculturalAITools } from './agricultural-ai-tools';

// Test function to verify image analysis is working
export async function testImageAnalysis(): Promise<void> {
  console.log('🧪 Starting image analysis test...');
  
  try {
    // Initialize the AI tools
    await agriculturalAITools.initialize();
    console.log('✅ Agricultural AI Tools initialized');
    
    // Test with a sample data URI (you would replace this with actual image data)
    const testImageUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    console.log('📷 Testing with sample image...');
    
    // Test plant disease identification
    const testInput = {
      photoDataUri: testImageUri,
      language: 'English'
    };
    
    const result = await agriculturalAITools.diagnosePlantDisease(testInput);
    console.log('🔬 Test result:', result);
    
    // Verify the result is not a hardcoded fallback
    if (result.disease === 'Early Blight (Alternaria solani)' && result.confidence === 'Medium') {
      console.log('⚠️  Warning: Result appears to be hardcoded fallback');
    } else {
      console.log('✅ Result appears to be from AI analysis');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use in other files
export default testImageAnalysis;
