import path from 'node:path';

import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
  lint: {
    plugins: ['react'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'react/exhaustive-deps': 'warn',
    },
  },
  pack: {
    entry: 'src/index.ts',
    dts: true,
    format: 'es',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  resolve: {
    alias: {
      'react-native': path.resolve(import.meta.dirname, './__mocks__/react-native.ts'),
    },
  },
  test: {
    clearMocks: true,
    exclude: ['examples/**', 'node_modules/**'],
    coverage: {
      exclude: ['__mocks__'],
      enabled: true,
      reporter: ['text-summary', 'lcov'],
      reportOnFailure: true,
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
