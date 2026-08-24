// @ts-nocheck -- Node's native TypeScript runner requires explicit .ts specifiers.
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { POST as postAgentR } from "../app/api/agente-r/route.ts";
import { POST as postContact } from "../app/api/contact/route.ts";

const AGENT_R_QUESTION_MAX_LENGTH = 1000;
const AGENT_R_BODY_MAX_BYTES = 4096;

const originalFetch = globalThis.fetch;
const originalAgentWebhook = process.env.MAKE_AGENT_R_WEBHOOK_URL;
const originalAgentTimeout = process.env.AGENT_R_UPSTREAM_TIMEOUT_MS;
const originalContactWebhook = process.env.CONTACT_WEBHOOK_URL;
const originalContactTimeout = process.env.CONTACT_UPSTREAM_TIMEOUT_MS;
const originalConsoleError = console.error;

function request(path: string, body: string | undefined, contentType = "application/json") {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    ...(body === undefined ? {} : { body }),
  });
}

function jsonRequest(path: string, body: unknown) {
  return request(path, JSON.stringify(body));
}

async function payload(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function assertRequestId(value: unknown) {
  assert.equal(typeof value, "string");
  assert.match(value as string, /^[0-9a-f-]{36}$/);
}

beforeEach(() => {
  process.env.MAKE_AGENT_R_WEBHOOK_URL = "https://secret.example.invalid/agent-hook";
  process.env.AGENT_R_UPSTREAM_TIMEOUT_MS = "1000";
  process.env.CONTACT_WEBHOOK_URL = "https://secret.example.invalid/contact-hook";
  process.env.CONTACT_UPSTREAM_TIMEOUT_MS = "1000";
  console.error = () => undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;

  for (const [name, value] of [
    ["MAKE_AGENT_R_WEBHOOK_URL", originalAgentWebhook],
    ["AGENT_R_UPSTREAM_TIMEOUT_MS", originalAgentTimeout],
    ["CONTACT_WEBHOOK_URL", originalContactWebhook],
    ["CONTACT_UPSTREAM_TIMEOUT_MS", originalContactTimeout],
  ]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("Agent R forwards a valid normalized question and preserves the success contract", async () => {
  let forwardedBody = "";
  globalThis.fetch = async (_input, init) => {
    forwardedBody = String(init?.body);
    assert.ok(init?.signal);
    return new Response("Resposta segura", { status: 200, headers: { "Content-Type": "text/plain" } });
  };

  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "  Quem\n e   Victor?  " }));
  const data = await payload(response);

  assert.equal(response.status, 200);
  assert.equal(data.answer, "Resposta segura");
  assertRequestId(data.requestId);
  assert.deepEqual(JSON.parse(forwardedBody), { question: "Quem e Victor?" });
});

for (const [name, body, status, code] of [
  ["invalid JSON", "{", 400, "INVALID_JSON"],
  ["missing body", undefined, 400, "INVALID_JSON"],
  ["non-object body", JSON.stringify([]), 400, "INVALID_REQUEST"],
  ["missing question", JSON.stringify({}), 400, "QUESTION_REQUIRED"],
  ["wrong question type", JSON.stringify({ question: 1 }), 400, "QUESTION_REQUIRED"],
  ["empty question", JSON.stringify({ question: " \n\t " }), 400, "QUESTION_REQUIRED"],
  ["unknown field", JSON.stringify({ question: "ok", extra: true }), 400, "INVALID_REQUEST"],
] as const) {
  test(`Agent R rejects ${name}`, async () => {
    const response = await postAgentR(request("/api/agente-r", body));
    const data = await payload(response);
    assert.equal(response.status, status);
    assert.equal((data.error as Record<string, unknown>).code, code);
    assertRequestId(data.requestId);
  });
}

test("Agent R rejects unsupported content type", async () => {
  const response = await postAgentR(request("/api/agente-r", "question=test", "text/plain"));
  const data = await payload(response);
  assert.equal(response.status, 415);
  assert.equal((data.error as Record<string, unknown>).code, "INVALID_CONTENT_TYPE");
});

test("Agent R rejects a question above the UI/server limit", async () => {
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "x".repeat(AGENT_R_QUESTION_MAX_LENGTH + 1) }));
  assert.equal(response.status, 400);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "QUESTION_TOO_LONG");
});

test("Agent R rejects an oversized body", async () => {
  const response = await postAgentR(request("/api/agente-r", JSON.stringify({ question: "x", padding: "x".repeat(AGENT_R_BODY_MAX_BYTES) })));
  assert.equal(response.status, 413);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "REQUEST_TOO_LARGE");
});

test("Agent R returns a safe error when the webhook is missing", async () => {
  delete process.env.MAKE_AGENT_R_WEBHOOK_URL;
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  const data = await payload(response);
  assert.equal(response.status, 503);
  assert.equal((data.error as Record<string, unknown>).code, "SERVICE_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(data), /MAKE_AGENT|webhook|secret\.example/i);
});

test("Agent R rejects an empty upstream response", async () => {
  globalThis.fetch = async () => new Response("   ", { status: 200 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "INVALID_UPSTREAM_RESPONSE");
});

test("Agent R rejects a malformed upstream response", async () => {
  globalThis.fetch = async () => new Response("resposta\u0000invalida", { status: 200 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "INVALID_UPSTREAM_RESPONSE");
});

test("Agent R hides upstream HTTP details", async () => {
  globalThis.fetch = async () => new Response("provider secret details", { status: 500 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  const serialized = JSON.stringify(await payload(response));
  assert.equal(response.status, 502);
  assert.doesNotMatch(serialized, /provider|500|secret\.example/i);
});

test("Agent R maps timeout cancellation to a stable safe error", async () => {
  globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
  });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  const data = await payload(response);
  assert.equal(response.status, 504);
  assert.equal((data.error as Record<string, unknown>).code, "UPSTREAM_TIMEOUT");
});

test("Agent R maps generic fetch failures without exposing internals", async () => {
  globalThis.fetch = async () => { throw new Error("internal network secret"); };
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  const serialized = JSON.stringify(await payload(response));
  assert.equal(response.status, 502);
  assert.doesNotMatch(serialized, /internal network|secret\.example/i);
});

test("Agent R logs contain metadata but no webhook, question, or response", async () => {
  const logs: unknown[] = [];
  console.error = (...values) => logs.push(values);
  globalThis.fetch = async () => new Response("raw private response", { status: 500 });
  await postAgentR(jsonRequest("/api/agente-r", { question: "private user question" }));
  const serialized = JSON.stringify(logs);
  assert.match(serialized, /agent_r_upstream_failed/);
  assert.doesNotMatch(serialized, /secret\.example|private user question|raw private response/i);
});

const validContact = {
  name: "Victor",
  company: "Example",
  email: "visitor@example.com",
  contactType: "Projeto",
  message: "Mensagem valida",
};

test("Contact preserves a valid submission and adds request identification", async () => {
  globalThis.fetch = async (_input, init) => {
    assert.ok(init?.signal);
    return new Response(null, { status: 204 });
  };
  const response = await postContact(jsonRequest("/api/contact", validContact));
  const data = await payload(response);
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assertRequestId(data.requestId);
});

test("Contact preserves validation errors", async () => {
  const response = await postContact(jsonRequest("/api/contact", { ...validContact, email: "invalid" }));
  const data = await payload(response);
  assert.equal(response.status, 400);
  assert.ok(Array.isArray(data.errors));
});

test("Contact maps timeout to a safe response without personal data in logs", async () => {
  const logs: unknown[] = [];
  console.error = (...values) => logs.push(values);
  globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
  });
  const response = await postContact(jsonRequest("/api/contact", validContact));
  const data = await payload(response);
  assert.equal(response.status, 504);
  assert.equal(data.code, "UPSTREAM_TIMEOUT");
  assert.doesNotMatch(JSON.stringify(logs), /visitor@example\.com|Mensagem valida|secret\.example/i);
});

test("Contact hides upstream failure details", async () => {
  globalThis.fetch = async () => new Response("provider private payload", { status: 500 });
  const response = await postContact(jsonRequest("/api/contact", validContact));
  const serialized = JSON.stringify(await payload(response));
  assert.equal(response.status, 502);
  assert.doesNotMatch(serialized, /provider|private payload|secret\.example/i);
});
