const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Metro to resolve browser versions and handle polyfills
config.resolver = {
  ...config.resolver,
  // Use browser field in package.json
  resolverMainFields: ['browser', 'main'],
  // Add polyfills for Node.js core modules
  extraNodeModules: {
    crypto: require.resolve('react-native-get-random-values'),
    stream: require.resolve('readable-stream'),
    buffer: require.resolve('buffer'),
  },
};

module.exports = config;
