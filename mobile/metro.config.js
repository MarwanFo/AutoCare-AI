// metro.config.js
// AutoCare AI — Metro bundler configuration.
// Uses resolveRequest to intercept and stub out native-only NitroModules
// packages so the app runs in Expo Go without crashing.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Packages that require native TurboModule binaries not available in Expo Go.
// We redirect them to safe JS stubs. In a real native Development Build
// (eas build / expo run:ios), remove these overrides and the real native
// implementations will be used automatically.
const NATIVE_ONLY_STUBS = {
  'react-native-nitro-modules': path.resolve(
    __dirname,
    'src/stubs/react-native-nitro-modules.js'
  ),
  'react-native-nitro-google-signin': path.resolve(
    __dirname,
    'src/stubs/react-native-nitro-google-signin.js'
  ),
};

const originalResolveRequest = config.resolver?.resolveRequest;

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (NATIVE_ONLY_STUBS[moduleName]) {
      return {
        filePath: NATIVE_ONLY_STUBS[moduleName],
        type: 'sourceFile',
      };
    }
    // Fall through to default resolver
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
