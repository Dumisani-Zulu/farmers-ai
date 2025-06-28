import { Alert } from 'react-native';
import { agricultureAI } from '../lib/agriculture-ai';
import { agriculturalAITools } from '../lib/agricultural-ai-tools';
import { tensorFlowService } from '../lib/tensorflow';
import { locationService } from '../lib/location-service';

export class AppInitializer {
  private static initialized = false;

  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('🚀 Initializing Agriculture AI App...');

      // Initialize TensorFlow.js
      console.log('📊 Initializing TensorFlow.js...');
      await tensorFlowService.initialize();
      console.log('✅ TensorFlow.js initialized successfully');

      // Initialize Agriculture AI services
      console.log('🤖 Initializing Agriculture AI services...');
      await agricultureAI.initialize();
      console.log('✅ Agriculture AI services initialized successfully');

      // Initialize Agricultural AI Tools (plant disease identification, etc.)
      console.log('🌱 Initializing Agricultural AI Tools...');
      await agriculturalAITools.initialize();
      console.log('✅ Agricultural AI Tools initialized successfully');

      // Initialize Location Service
      console.log('📍 Initializing Location Service...');
      await locationService.initialize();
      console.log('✅ Location Service initialized successfully');

      // Memory check
      const memInfo = tensorFlowService.getMemoryInfo();
      console.log('💾 TensorFlow Memory Info:', {
        numTensors: memInfo.numTensors,
        numDataBuffers: memInfo.numDataBuffers,
        numBytes: memInfo.numBytes,
      });

      this.initialized = true;
      console.log('🎉 App initialization completed successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      
      // Show user-friendly error
      Alert.alert(
        'Initialization Error',
        'Failed to initialize AI services. Some features may not work properly.',
        [
          {
            text: 'OK',
            style: 'default',
          },
          {
            text: 'Retry',
            style: 'default',
            onPress: () => this.initialize(),
          },
        ]
      );
      
      return false;
    }
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static async checkApiKeys(): Promise<{ hasGoogleAI: boolean; hasFirebase: boolean }> {
    // Note: In a real app, you'd check actual environment variables
    // For this example, we'll simulate the check
    return {
      hasGoogleAI: process.env.GOOGLE_AI_API_KEY ? true : false,
      hasFirebase: process.env.FIREBASE_PROJECT_ID ? true : false,
    };
  }

  static getInitializationStatus(): {
    tensorFlow: boolean;
    genkit: boolean;
    overall: boolean;
  } {
    return {
      tensorFlow: tensorFlowService.isInitialized(),
      genkit: this.initialized, // Simplified check
      overall: this.initialized && tensorFlowService.isInitialized(),
    };
  }
}

export default AppInitializer;
