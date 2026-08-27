const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { FileStore } = require('metro-cache');
const path = require('node:path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  cacheStores: [
    new FileStore({ root: path.join(__dirname, 'node_modules/.cache/metro/transform') }),
  ],
  fileMapCacheDirectory: path.join(__dirname, 'node_modules/.cache/metro/file-map'),
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
