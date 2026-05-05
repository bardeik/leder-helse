import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 92,
        functions: 94,
        branches: 79,
        statements: 93
      }
    }
  }
});
