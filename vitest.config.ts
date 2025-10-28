import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
    environment: "node",
    clearMocks: true,
    globals: true,
  },
  resolve: {
    alias: {
      "@raycast/api": resolve(__dirname, "__mocks__/@raycast/api.ts"),
    },
  },
});
