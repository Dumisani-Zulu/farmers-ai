/**
 * TensorFlow Service
 * Handles TensorFlow.js initialization and model loading
 */

import * as tf from '@tensorflow/tfjs';
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
      
      // Wait for tf to be ready
      await tf.ready();
      
      // Set backend preference
      if (this.config.tensorflow.backend === 'webgl') {
        await tf.setBackend('webgl');
      } else if (this.config.tensorflow.backend === 'cpu') {
        await tf.setBackend('cpu');
      }
      // 'rn' backend will be set automatically by the React Native package

      console.log(`TensorFlow.js initialized with backend: ${tf.getBackend()}`);
      console.log(`Memory info:`, tf.memory());
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      throw error;
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
      backend: tf.getBackend(),
      memory: tf.memory(),
    };
  }

  /**
   * Clean up memory
   */
  cleanup(): void {
    tf.disposeVariables();
    console.log('TensorFlow.js memory cleaned up');
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
