/// <reference types="vitest" />
import { defineConfig } from 'vite'

// Basically it allows `testsSetup.ts` to run before all tests.
// It also allows the use of globals.
export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["testsSetup.ts"]
  },
})