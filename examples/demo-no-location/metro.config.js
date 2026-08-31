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
const envPath = path.join(__dirname, '.env');
const envHash = fs.existsSync(envPath)
  ? crypto.createHash('sha1').update(fs.readFileSync(envPath)).digest('hex')
  : 'missing';

const config = {
  // react-native-dotenv does not include .env in Metro's transform cache key.
  cacheVersion: `env-${envHash}`,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
