import { defineConfig } from "vitest/config";

const isCoverageRun = process.argv.includes("--coverage");

export default defineConfig({
  test: {
    fileParallelism: !isCoverageRun,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,js}"],
      exclude: [
        "dist/**",
        "scripts/**",
        "vscode-extension/**",
        "src/**/*.test.ts",
        "src/**/*.test.js",
        "src/**/*.spec.ts",
        "src/**/*.spec.js",
        "src/**/*.integration.test.ts",
        "src/**/*.coverage.test.ts",
        "src/smoke/**",
      ],
    },
  },
});