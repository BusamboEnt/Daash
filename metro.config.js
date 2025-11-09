const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js core modules
config.resolver.extraNodeModules = {
  crypto: path.resolve(__dirname, 'node_modules/react-native-get-random-values'),
  url: path.resolve(__dirname, 'node_modules/url'),
  http: path.resolve(__dirname, 'node_modules/stream-http'),
  https: path.resolve(__dirname, 'node_modules/https-browserify'),
  events: path.resolve(__dirname, 'node_modules/events'),
  stream: path.resolve(__dirname, 'node_modules/readable-stream'),
};

module.exports = config;
