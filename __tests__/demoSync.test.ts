/// <reference types="node" />

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from 'vite-plus/test';

// demo-pods is demo's iOS app on CocoaPods; its JavaScript must not drift from demo.
const examples = path.resolve(import.meta.dirname, '../examples');
const demo = path.join(examples, 'demo');
const demoPods = path.join(examples, 'demo-pods');
const sharedPaths = [
  'App.tsx',
  'index.js',
  'app.json',
  'babel.config.js',
  'src',
  'assets',
  'types',
];

function listFiles(root: string, relative: string): string[] {
  const full = path.join(root, relative);
  try {
    return readdirSync(full, { withFileTypes: true }).flatMap((entry) =>
      listFiles(root, path.join(relative, entry.name)),
    );
  } catch {
    return [relative];
  }
}

const sharedFiles = (root: string) => sharedPaths.flatMap((p) => listFiles(root, p)).sort();

test('demo-pods has the same JavaScript files as demo', () => {
  expect(sharedFiles(demoPods)).toEqual(sharedFiles(demo));
});

test.each(sharedFiles(demo))('demo-pods/%s matches demo', (file) => {
  expect(readFileSync(path.join(demoPods, file))).toEqual(readFileSync(path.join(demo, file)));
});

test('demo-pods has the same dependencies as demo', () => {
  const deps = (root: string) => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as Record<
      string,
      unknown
    >;
    return { dependencies: pkg.dependencies, devDependencies: pkg.devDependencies };
  };

  expect(deps(demoPods)).toEqual(deps(demo));
});
