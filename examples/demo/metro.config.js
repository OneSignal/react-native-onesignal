const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { FileStore } = require('metro-cache');
const path = require('node:path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  cacheStores: [
    new FileStore({ root: path.join(__dirname, 'node_modules/.cache/metro/transform') }),
  ],
  fileMapCacheDirectory: path.join(__dirname, 'node_modules/.cache/metro/file-map'),
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
