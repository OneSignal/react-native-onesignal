import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    plugins: ["react"],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "react/exhaustive-deps": "warn",
    },
  },
});
