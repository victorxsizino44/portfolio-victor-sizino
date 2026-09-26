import { release } from "node:process";

// Native Node import prevents this module from becoming a browser dependency.
// The runtime check also rejects browser-like execution environments.
if (release.name !== "node" || typeof window !== "undefined") {
  throw new Error("Agent B infrastructure requires a server environment.");
}
