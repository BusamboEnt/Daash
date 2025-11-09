const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js core modules
config.resolver.extraNodeModules = {
  crypto: require.resolve('react-native-get-random-values'),
  url: require.resolve('url'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  events: require.resolve('events'),
  stream: require.resolve('readable-stream'),
};

module.exports = config;
