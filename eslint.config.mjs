import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    files: ["lib/agent-b/{core,application,ports}/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", "process", "window", "document", "fetch"],
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["next", "next/**", "react", "react/**", "resend", "@supabase/**", "@google/**", "posthog*", "node:*", "**/infrastructure/**", "**/transport/**", "**/app/**"],
          message: "Agent B application/core/ports must remain independent of transport, infrastructure and provider SDKs.",
        }],
      }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
