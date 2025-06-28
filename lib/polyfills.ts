// Polyfills for TensorFlow.js in React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Text encoding polyfill
import { TextEncoder, TextDecoder } from 'text-encoding';

// Base64 polyfill
import { decode, encode } from 'base-64';

// Platform check
import { Platform } from 'react-native';

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
  console.log('TensorFlow.js polyfills loaded successfully');
}

export {};
