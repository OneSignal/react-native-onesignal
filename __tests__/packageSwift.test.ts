/// <reference types="node" />

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from 'vite-plus/test';

// CI does not build Package.swift, so keep its native dependency pinned to the podspec's.
const root = path.resolve(import.meta.dirname, '..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

test('Package.swift pins the same OneSignal-XCFramework version as the podspec', () => {
  const podspecVersion = read('react-native-onesignal.podspec').match(
    /onesignal_xcframework_version = '([^']+)'/,
  )?.[1];
  const packageSwiftVersion = read('Package.swift').match(
    /let oneSignalXCFrameworkVersion: Version = "([^"]+)"/,
  )?.[1];

  expect(podspecVersion).toBeDefined();
  expect(packageSwiftVersion).toBe(podspecVersion);
});

test('swiftpmConfig name matches the Package.swift product', () => {
  const { swiftpmConfig } = JSON.parse(read('package.json')) as {
    swiftpmConfig: { name: string };
  };

  expect(read('Package.swift')).toContain(`.library(name: "${swiftpmConfig.name}"`);
});
