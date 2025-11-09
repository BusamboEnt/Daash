const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal polyfills for Stellar SDK no-eventsource build
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    crypto: require.resolve('react-native-get-random-values'),
  },
};

module.exports = config;
