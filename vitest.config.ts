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
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/app/**",
        "src/domain/types.ts",
        // Thin Dexie wrappers — integration-tested, not unit-tested
        "src/data/repositories/**",
        // Pure presentation components — logic-free, covered by E2E
        "src/components/Nav.tsx",
        "src/components/FloatingSaveNotice.tsx",
        "src/features/logging/LogTodayForm.tsx",
        "src/features/logging/WeeklyCheckInForm.tsx",
        "src/features/dashboard/DashboardView.tsx",
        "src/features/workout/components/WorkoutSummary.tsx"
      ],
      thresholds: {
        lines: 88,
        functions: 88,
        branches: 75,
        statements: 88
      }
    }
  }
});
