const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;
const envPath = path.join(__dirname, '.env');
const envContents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : null;
const envHash = envContents
  ? crypto.createHash('sha1').update(envContents).digest('hex')
  : 'missing';

const config = {
  // react-native-dotenv does not include .env in Metro's transform cache key.
  cacheVersion: `env-${envHash}`,
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
