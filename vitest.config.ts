import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    clearMocks: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['examples/**'],
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
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, './__mocks__/react-native.ts'),
    },
  },
});
