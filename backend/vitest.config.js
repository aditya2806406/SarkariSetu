import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@google/genai/dist/node/index.cjs": path.resolve(__dirname, "node_modules/@google/genai/dist/node/index.cjs"),
      "@google/genai": path.resolve(__dirname, "node_modules/@google/genai/dist/node/index.cjs"),
    },
  },
  test: {
    environment: "node",
  },
});
