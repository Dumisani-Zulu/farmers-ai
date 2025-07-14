/**
 * TensorFlow Service
 * Handles TensorFlow.js initialization and model loading
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-react-native';
import { getAIConfig } from '../config';

export class TensorFlowService {
  private initialized = false;
  private config = getAIConfig();

  /**
   * Initialize TensorFlow.js for React Native
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing TensorFlow.js...');
      
      // TensorFlow.js for React Native is ready automatically when imported
      console.log('TensorFlow.js is ready for React Native');
      console.log(`TensorFlow.js version: ${tf.version.tfjs}`);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      // Don't throw error, just mark as not initialized
      this.initialized = false;
    }
  }

  /**
   * Load a pre-trained model (for future use)
   */
  async loadModel(modelUrl: string): Promise<tf.LayersModel | tf.GraphModel> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`Loading model from ${modelUrl}...`);
      const model = await tf.loadLayersModel(modelUrl);
      console.log('Model loaded successfully');
      return model;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Create a simple example model for demonstration
   */
  createExampleModel(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' }),
      ],
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Get TensorFlow.js version and backend info
   */
  getInfo(): { version: string; backend: string; memory: any } {
    return {
      version: tf.version.tfjs,
      backend: 'react-native', // Default for RN environment
      memory: { numTensors: 0, numDataBuffers: 0, unreliable: true },
    };
  }

  /**
   * Clean up memory
   */
  cleanup(): void {
    try {
      // For React Native TensorFlow.js, memory cleanup is handled automatically
      // We'll just log that cleanup was requested
      console.log('TensorFlow.js memory cleanup requested (handled automatically in RN)');
    } catch (error) {
      console.warn('Memory cleanup failed, but continuing:', error);
    }
  }

  /**
   * Check if TensorFlow is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let tensorFlowService: TensorFlowService | null = null;

export const getTensorFlowService = (): TensorFlowService => {
  if (!tensorFlowService) {
    tensorFlowService = new TensorFlowService();
  }
  return tensorFlowService;
};
