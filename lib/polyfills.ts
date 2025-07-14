// Basic polyfills for React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Text encoding polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';

// Base64 polyfill
import { decode, encode } from 'base-64';

// Platform check
import { Platform } from 'react-native';

// TensorFlow.js platform setup for React Native
if (Platform.OS !== 'web') {
  // Import TensorFlow.js packages in the correct order
  Promise.all([
    import('@tensorflow/tfjs'),
    import('@tensorflow/tfjs-backend-cpu'),
    import('@tensorflow/tfjs-react-native')
  ]).then(() => {
    console.log('TensorFlow.js React Native platform initialized');
  }).catch(error => {
    console.warn('TensorFlow.js React Native platform failed to initialize:', error);
  });
}

// Set up global references if needed
if (Platform.OS !== 'web') {
  // Ensure global is available
  if (typeof global === 'undefined') {
    (global as any) = globalThis;
  }

  // Add text encoding polyfills
  if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder;
  }
  
  if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder;
  }

  // Add base64 polyfills
  if (!global.btoa) {
    global.btoa = encode;
  }

  if (!global.atob) {
    global.atob = decode;
  }
}

if (__DEV__) {
  console.log('React Native polyfills loaded successfully');
}

export {};
