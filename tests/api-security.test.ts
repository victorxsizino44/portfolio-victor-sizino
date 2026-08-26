// @ts-nocheck -- Node's native TypeScript runner requires explicit .ts specifiers.
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { POST as postAgentR } from "../app/api/agente-r/route.ts";
import { POST as postContact } from "../app/api/contact/route.ts";

const AGENT_R_QUESTION_MAX_LENGTH = 1000;
const AGENT_R_BODY_MAX_BYTES = 4096;

const originalFetch = globalThis.fetch;
const originalAgentWebhook = process.env.MAKE_AGENT_R_WEBHOOK_URL;
const originalAgentTimeout = process.env.MAKE_AGENT_R_TIMEOUT_MS;
const originalContactWebhook = process.env.CONTACT_WEBHOOK_URL;
const originalContactTimeout = process.env.CONTACT_WEBHOOK_TIMEOUT_MS;
const originalConsoleError = console.error;

function request(path: string, body: string | undefined, contentType: string | null = "application/json") {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    ...(contentType === null ? {} : { headers: { "Content-Type": contentType } }),
    ...(body === undefined ? {} : { body: contentType === null ? new TextEncoder().encode(body) : body }),
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
  globalThis.fetch = async () => { throw new Error("Unexpected fetch: tests must mock every external call"); };
  process.env.MAKE_AGENT_R_WEBHOOK_URL = "https://secret.example.invalid/agent-hook";
  process.env.MAKE_AGENT_R_TIMEOUT_MS = "1000";
  process.env.CONTACT_WEBHOOK_URL = "https://secret.example.invalid/contact-hook";
  process.env.CONTACT_WEBHOOK_TIMEOUT_MS = "1000";
  console.error = () => undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;

  for (const [name, value] of [
    ["MAKE_AGENT_R_WEBHOOK_URL", originalAgentWebhook],
    ["MAKE_AGENT_R_TIMEOUT_MS", originalAgentTimeout],
    ["CONTACT_WEBHOOK_URL", originalContactWebhook],
    ["CONTACT_WEBHOOK_TIMEOUT_MS", originalContactTimeout],
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

test("Agent R rejects a missing content type", async () => {
  const response = await postAgentR(request("/api/agente-r", JSON.stringify({ question: "Teste" }), null));
  assert.equal(response.status, 415);
  assertRequestId((await payload(response)).requestId);
});

test("Agent R accepts a JSON content type with charset", async () => {
  globalThis.fetch = async () => new Response("Resposta segura", { status: 200 });
  const response = await postAgentR(request("/api/agente-r", JSON.stringify({ question: "Teste" }), "application/json; charset=utf-8"));
  assert.equal(response.status, 200);
});

test("Agent R removes control characters and normalizes whitespace", async () => {
  let forwardedBody = "";
  globalThis.fetch = async (_input, init) => {
    forwardedBody = String(init?.body);
    return new Response("Resposta segura", { status: 200 });
  };
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "  Quem\u0000\t\n  e Victor?  " }));
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(forwardedBody), { question: "Quem e Victor?" });
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

test("Agent R rejects an excessive upstream response", async () => {
  globalThis.fetch = async () => new Response("x".repeat(8001), { status: 200 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
});

test("Agent R rejects unexpected upstream media types", async () => {
  globalThis.fetch = async () => new Response("<html>unexpected</html>", { headers: { "Content-Type": "text/html" } });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "INVALID_UPSTREAM_RESPONSE");
});

test("Agent R bounds the upstream body before JSON parsing", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ answer: "ok", extra: "x".repeat(32768) }), {
    headers: { "Content-Type": "application/json" },
  });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "INVALID_UPSTREAM_RESPONSE");
});

test("Agent R accepts a validated JSON upstream response", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ answer: "Resposta JSON" }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
  const data = await payload(await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" })));
  assert.equal(data.answer, "Resposta JSON");
});

test("Agent R rejects malformed JSON declared by the upstream", async () => {
  globalThis.fetch = async () => new Response("{", { status: 200, headers: { "Content-Type": "application/json" } });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
});

test("Agent R rejects JSON without an answer string", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ result: "unexpected" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
});

test("Agent R rejects a malformed upstream response", async () => {
  globalThis.fetch = async () => new Response("resposta\u0000invalida", { status: 200 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  assert.equal(response.status, 502);
  assert.equal(((await payload(response)).error as Record<string, unknown>).code, "INVALID_UPSTREAM_RESPONSE");
});

test("Agent R hides upstream HTTP details", async () => {
  const upstreamBody = "provider secret details";
  globalThis.fetch = async () => new Response(upstreamBody, { status: 500 });
  const response = await postAgentR(jsonRequest("/api/agente-r", { question: "Teste" }));
  const data = await payload(response);
  const error = data.error as { code: string; message: string };
  const expectedMessage = "O Agent R esta temporariamente indisponivel. Tente novamente.";
  assert.equal(response.status, 502);
  assert.equal(error.code, "UPSTREAM_FAILURE");
  assert.equal(data.answer, expectedMessage);
  assert.equal(error.message, expectedMessage);
  assert.match(data.requestId as string, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  const publicMessage = [data.answer, error.message].join(" ");
  assert.doesNotMatch(publicMessage, /provider|500|secret\.example|Make webhook failed/i);
  assert.equal(JSON.stringify(data).includes(upstreamBody), false);
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

test("Contact rejects a missing or unsupported content type", async () => {
  for (const contentType of [null, "text/plain"]) {
    const response = await postContact(request("/api/contact", JSON.stringify(validContact), contentType));
    assert.equal(response.status, 415);
    assertRequestId((await payload(response)).requestId);
  }
});

test("Contact rejects an oversized body", async () => {
  const response = await postContact(jsonRequest("/api/contact", { ...validContact, message: "x".repeat(9000) }));
  assert.equal(response.status, 413);
  assertRequestId((await payload(response)).requestId);
});

test("Contact rejects invalid JSON safely", async () => {
  const response = await postContact(request("/api/contact", "{"));
  assert.equal(response.status, 400);
  assert.equal((await payload(response)).code, "INVALID_JSON");
});

test("Contact returns a safe error when configuration is missing", async () => {
  delete process.env.CONTACT_WEBHOOK_URL;
  const data = await payload(await postContact(jsonRequest("/api/contact", validContact)));
  assert.equal(data.code, "SERVICE_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(data), /CONTACT_WEBHOOK|secret\.example/i);
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
