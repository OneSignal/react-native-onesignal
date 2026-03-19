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
});
