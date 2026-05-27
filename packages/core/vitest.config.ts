import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const sharedSrc = fileURLToPath(new URL("../shared/src/index.ts", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@llm-ping/shared": sharedSrc,
    },
  },
});
