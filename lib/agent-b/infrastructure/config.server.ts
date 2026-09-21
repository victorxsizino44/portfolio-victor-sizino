import "./server-boundary.ts";

// B00 requires no environment variables. Future approved provider configuration
// must be read and validated here, never returned wholesale from process.env.
const configuration: Readonly<Record<string, never>> = Object.freeze({});

export function getAgentBRuntimeConfig(): Readonly<Record<string, never>> {
  return configuration;
}
