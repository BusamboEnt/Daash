// Polyfills for React Native
// IMPORTANT: Import order matters - these must be loaded first!

// Gesture handler - must be first for drawer navigation
import 'react-native-gesture-handler';

// Crypto polyfill
import 'react-native-get-random-values';

// Buffer polyfill
import { Buffer } from 'buffer';
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer;
}

// Export empty object to make this a module
export {};
