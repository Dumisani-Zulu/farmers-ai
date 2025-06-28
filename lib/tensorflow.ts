// Import polyfills first
import './polyfills';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-backend-webgl';
import { Platform } from 'react-native';

class TensorFlowService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize platform for React Native
      if (Platform.OS !== 'web') {
        await tf.ready();
      }
      
      console.log('TensorFlow.js initialized successfully');
      console.log('Backend:', tf.getBackend());
      console.log('TensorFlow version:', tf.version.tfjs);
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      throw error;
    }
  }

  /**
   * Load a pre-trained model from a URL or local path
   */
  async loadModel(modelUrl: string): Promise<tf.LayersModel | tf.GraphModel> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const model = await tf.loadLayersModel(modelUrl);
      console.log('Model loaded successfully');
      return model;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Create a simple neural network for basic classification
   */
  createBasicModel(inputShape: number[], numClasses: number): tf.Sequential {
    if (!this.initialized) {
      throw new Error('TensorFlow service not initialized');
    }

    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: inputShape,
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Preprocess image data for model input
   */
  preprocessImage(imageData: ImageData | HTMLCanvasElement | HTMLImageElement, targetSize: [number, number] = [224, 224]): tf.Tensor {
    return tf.tidy(() => {
      // Convert to tensor
      let tensor = tf.browser.fromPixels(imageData);
      
      // Resize if needed
      tensor = tf.image.resizeBilinear(tensor, targetSize);
      
      // Normalize pixel values to [0, 1]
      tensor = tensor.div(255.0);
      
      // Add batch dimension
      tensor = tensor.expandDims(0);
      
      return tensor;
    });
  }

  /**
   * Clean up tensors to prevent memory leaks
   */
  dispose(tensors: tf.Tensor | tf.Tensor[]): void {
    if (Array.isArray(tensors)) {
      tensors.forEach(tensor => tensor.dispose());
    } else {
      tensors.dispose();
    }
  }

  /**
   * Get memory info for debugging
   */
  getMemoryInfo(): tf.MemoryInfo {
    return tf.memory();
  }

  /**
   * Check if TensorFlow is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export const tensorFlowService = new TensorFlowService();
export default tensorFlowService;
