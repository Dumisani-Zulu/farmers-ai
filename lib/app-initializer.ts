import { Alert } from 'react-native';
import { locationService } from '../lib/location-service';
import { initializeAI, checkAIHealth } from '../ai';

export class AppInitializer {
  private static initialized = false;

  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('🚀 Initializing Agriculture AI App...');

      // Initialize Location Service
      console.log('📍 Initializing Location Service...');
      await locationService.initialize();
      console.log('✅ Location Service initialized successfully');

      // Initialize AI Services
      console.log('🤖 Initializing AI Services...');
      await initializeAI();
      
      // Check AI health
      const aiHealth = await checkAIHealth();
      console.log('🔍 AI Health Check:', aiHealth);
      
      if (!aiHealth.gemini) {
        console.warn('⚠️ Gemini AI service not available - some features may be limited');
      }
      
      console.log('✅ AI Services initialized successfully');

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
    location: boolean;
    overall: boolean;
  } {
    return {
      location: this.initialized,
      overall: this.initialized,
    };
  }
}

export default AppInitializer;
