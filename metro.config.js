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
};

module.exports = config;
