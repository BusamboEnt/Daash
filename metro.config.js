const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Polyfill mappings for Node.js core modules
const nodeModulePolyfills = {
  crypto: 'react-native-get-random-values',
  url: 'url',
  http: 'stream-http',
  https: 'https-browserify',
  events: 'events',
  stream: 'readable-stream',
};

// Add polyfills for Node.js core modules
config.resolver.extraNodeModules = nodeModulePolyfills;

// Add a custom resolver to handle Node.js core modules
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if this is a Node.js core module that needs polyfilling
  if (nodeModulePolyfills[moduleName]) {
    return context.resolveRequest(
      context,
      nodeModulePolyfills[moduleName],
      platform
    );
  }

  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
