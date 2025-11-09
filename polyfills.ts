// Polyfills for React Native
// IMPORTANT: Import order matters - these must be loaded first!

// Crypto polyfill - must be first
import 'react-native-get-random-values';

// Buffer polyfill
import { Buffer } from 'buffer';
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer;
}

// Export empty object to make this a module
export {};
