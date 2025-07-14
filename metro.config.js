const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// NativeWind v2 configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg', 'css'],
  alias: {
    // TensorFlow.js compatibility
    'crypto': require.resolve('expo-crypto'),
  },
  platforms: ['ios', 'android', 'native', 'web'],
};

module.exports = config;
