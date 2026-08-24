import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server.js";

const AGENT_R_QUESTION_MAX_LENGTH = 1000;
const AGENT_R_BODY_MAX_BYTES = 4096;

const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;
const RESPONSE_MAX_LENGTH = 8_000;

type ErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "INVALID_JSON"
  | "INVALID_REQUEST"
  | "QUESTION_REQUIRED"
  | "QUESTION_TOO_LONG"
  | "REQUEST_TOO_LARGE"
  | "SERVICE_UNAVAILABLE"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_FAILURE"
  | "INVALID_UPSTREAM_RESPONSE";

class RequestBodyError extends Error {
  readonly code: "INVALID_JSON" | "REQUEST_TOO_LARGE";

  constructor(code: "INVALID_JSON" | "REQUEST_TOO_LARGE") {
    super(code);
    this.code = code;
  }
}

function errorResponse(requestId: string, status: number, code: ErrorCode, message: string) {
  return NextResponse.json(
    {
      answer: message,
      error: { code, message },
      requestId,
    },
    { status },
  );
}

function getTimeoutMs() {
  const configured = Number.parseInt(process.env.AGENT_R_UPSTREAM_TIMEOUT_MS ?? "", 10);

  if (!Number.isFinite(configured)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(Math.max(configured, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
}

async function readJsonBody(request: Request) {
  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);

  if (Number.isFinite(declaredLength) && declaredLength > AGENT_R_BODY_MAX_BYTES) {
    throw new RequestBodyError("REQUEST_TOO_LARGE");
  }

  if (!request.body) {
    throw new RequestBodyError("INVALID_JSON");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let body = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > AGENT_R_BODY_MAX_BYTES) {
        await reader.cancel();
        throw new RequestBodyError("REQUEST_TOO_LARGE");
      }

      body += decoder.decode(value, { stream: true });
    }

    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new RequestBodyError("INVALID_JSON");
  }
}

function normalizeQuestion(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function logFailure(event: string, requestId: string, errorCode: ErrorCode, startedAt: number, status?: number) {
  console.error({
    event,
    requestId,
    errorCode,
    durationMs: Date.now() - startedAt,
    ...(status === undefined ? {} : { status }),
  });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    return errorResponse(requestId, 415, "INVALID_CONTENT_TYPE", "Envie a pergunta em formato JSON.");
  }

  let payload: unknown;

  try {
    payload = await readJsonBody(request);
  } catch (error) {
    const code = error instanceof RequestBodyError ? error.code : "INVALID_JSON";
    const message = code === "REQUEST_TOO_LARGE"
      ? "A solicitacao excede o limite permitido."
      : "Nao consegui ler sua pergunta. Tente novamente.";
    return errorResponse(requestId, code === "REQUEST_TOO_LARGE" ? 413 : 400, code, message);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return errorResponse(requestId, 400, "INVALID_REQUEST", "A solicitacao enviada e invalida.");
  }

  const keys = Object.keys(payload);
  if (keys.some((key) => key !== "question")) {
    return errorResponse(requestId, 400, "INVALID_REQUEST", "A solicitacao enviada e invalida.");
  }

  const questionValue = (payload as Record<string, unknown>).question;
  if (typeof questionValue !== "string") {
    return errorResponse(requestId, 400, "QUESTION_REQUIRED", "Digite uma pergunta para conversar com o Agent R.");
  }

  const question = normalizeQuestion(questionValue);
  if (!question) {
    return errorResponse(requestId, 400, "QUESTION_REQUIRED", "Digite uma pergunta para conversar com o Agent R.");
  }

  if (question.length > AGENT_R_QUESTION_MAX_LENGTH) {
    return errorResponse(requestId, 400, "QUESTION_TOO_LONG", "A pergunta excede o limite de 1000 caracteres.");
  }

  const webhookUrl = process.env.MAKE_AGENT_R_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    logFailure("agent_r_request_failed", requestId, "SERVICE_UNAVAILABLE", startedAt);
    return errorResponse(requestId, 503, "SERVICE_UNAVAILABLE", "O Agent R esta temporariamente indisponivel. Tente novamente.");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
      body: JSON.stringify({ question }),
      cache: "no-store",
      signal: AbortSignal.timeout(getTimeoutMs()),
    });

    if (!response.ok) {
      logFailure("agent_r_upstream_failed", requestId, "UPSTREAM_FAILURE", startedAt, response.status);
      return errorResponse(requestId, 502, "UPSTREAM_FAILURE", "O Agent R esta temporariamente indisponivel. Tente novamente.");
    }

    const answer = (await response.text()).trim();
    const hasInvalidControls = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(answer);

    if (!answer || answer.length > RESPONSE_MAX_LENGTH || hasInvalidControls) {
      logFailure("agent_r_upstream_failed", requestId, "INVALID_UPSTREAM_RESPONSE", startedAt);
      return errorResponse(requestId, 502, "INVALID_UPSTREAM_RESPONSE", "O Agent R nao conseguiu gerar uma resposta valida. Tente novamente.");
    }

    return NextResponse.json({ answer, requestId });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    const code = isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_FAILURE";
    const message = isTimeout
      ? "O Agent R demorou mais do que o esperado. Tente novamente."
      : "O Agent R esta temporariamente indisponivel. Tente novamente.";

    logFailure("agent_r_request_failed", requestId, code, startedAt);
    return errorResponse(requestId, isTimeout ? 504 : 502, code, message);
  }
}
