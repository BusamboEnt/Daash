// Polyfills for React Native
// IMPORTANT: Import order matters - these must be loaded first!

// URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Crypto polyfill
import 'react-native-get-random-values';

// Events polyfill for Node.js compatibility
import EventEmitter from 'events';
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.EventEmitter = EventEmitter;
}

// Export empty object to make this a module
export {};
