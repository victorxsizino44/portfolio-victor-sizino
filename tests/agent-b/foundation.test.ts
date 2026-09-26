import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { createOperationCorrelation, createRequestCorrelation } from "../../lib/agent-b/application/correlation.ts";
import { createInternalError } from "../../lib/agent-b/application/errors.ts";
import { getAgentBRuntimeConfig } from "../../lib/agent-b/infrastructure/config.server.ts";

test("Agent B correlation separates operations while preserving the request", () => {
  const request = createRequestCorrelation();
  const otherRequest = createRequestCorrelation();
  const first = createOperationCorrelation(request);
  const second = createOperationCorrelation(request);
  assert.equal(first.requestId, request.requestId);
  assert.equal(second.requestId, request.requestId);
  assert.equal(new Set([request.requestId, otherRequest.requestId, first.operationId, second.operationId]).size, 4);
  assert.ok(Object.isFrozen(request));
  assert.ok(Object.isFrozen(first));
});

test("Agent B safe errors contain only the fixed public contract", () => {
  const error = createInternalError();
  assert.deepEqual(JSON.parse(JSON.stringify(error)), {
    code: "INTERNAL_ERROR",
    message: "Não foi possível concluir a operação.",
  });
  assert.ok(Object.isFrozen(error));
});

test("Agent B unconfigured foundation exposes no environment or provider values", () => {
  assert.deepEqual(getAgentBRuntimeConfig({}), {});
  assert.ok(Object.isFrozen(getAgentBRuntimeConfig({})));
});

test("Agent B configuration rejects a browser-like environment", () => {
  const moduleUrl = new URL("../../lib/agent-b/infrastructure/config.server.ts", import.meta.url).href;
  const result = spawnSync(process.execPath, [
    "--input-type=module", "--eval",
    `globalThis.window = {}; await import(${JSON.stringify(moduleUrl)});`,
  ], { encoding: "utf8" });
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Agent B infrastructure requires a server environment/);
});
