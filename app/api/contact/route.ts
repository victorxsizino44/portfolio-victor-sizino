import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server.js";

const MESSAGE_MAX_LENGTH = 2000;
const CONTACT_BODY_MAX_BYTES = 8192;
const DEFAULT_TIMEOUT_MS = 10_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;

type ContactInput = {
  name: string;
  company: string;
  email: string;
  contactType: string;
  message: string;
};

type MakeContactPayload = ContactInput & {
  source: "portfolio_contact_form";
  page: "/contato";
  submittedAt: string;
  metadata: {
    portfolioOwner: "Victor Sizino";
    positioning: "AI Product Manager | Technical Product Manager";
    channel: "website";
  };
};

type ValidationResult =
  | {
      data: ContactInput;
      isValid: true;
    }
  | {
      errors: string[];
      isValid: false;
    };

function sanitizeSingleLine(value: unknown, maxLength = 254) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessage(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactPayload(payload: unknown): ValidationResult {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const data: ContactInput = {
    name: sanitizeSingleLine(source.name, 160),
    company: sanitizeSingleLine(source.company, 160),
    email: sanitizeSingleLine(source.email, 254),
    contactType: sanitizeSingleLine(source.contactType, 160),
    message: sanitizeMessage(source.message),
  };

  const errors: string[] = [];

  if (!data.name) {
    errors.push("Nome obrigatorio.");
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Email obrigatorio ou invalido.");
  }

  if (!data.contactType) {
    errors.push("Tipo de contato obrigatorio.");
  }

  if (!data.message) {
    errors.push("Mensagem obrigatoria.");
  }

  if (data.message.length > MESSAGE_MAX_LENGTH) {
    errors.push("Mensagem deve ter no maximo 2000 caracteres.");
  }

  return errors.length > 0 ? { errors, isValid: false } : { data, isValid: true };
}

function createMakePayload(data: ContactInput): MakeContactPayload {
  return {
    source: "portfolio_contact_form",
    name: data.name,
    company: data.company,
    email: data.email,
    contactType: data.contactType,
    message: data.message,
    page: "/contato",
    submittedAt: new Date().toISOString(),
    metadata: {
      portfolioOwner: "Victor Sizino",
      positioning: "AI Product Manager | Technical Product Manager",
      channel: "website",
    },
  };
}

function getContactWebhookUrl() {
  return process.env.CONTACT_WEBHOOK_URL?.trim();
}

function getTimeoutMs() {
  const configured = Number.parseInt(process.env.CONTACT_UPSTREAM_TIMEOUT_MS ?? "", 10);

  if (!Number.isFinite(configured)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(Math.max(configured, MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
}

function safeError(requestId: string, status: number, code: string, message: string) {
  return NextResponse.json({ error: message, code, requestId }, { status });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    return safeError(requestId, 415, "INVALID_CONTENT_TYPE", "Payload invalido.");
  }

  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > CONTACT_BODY_MAX_BYTES) {
    return safeError(requestId, 413, "REQUEST_TOO_LARGE", "Payload invalido.");
  }

  let payload: unknown;

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > CONTACT_BODY_MAX_BYTES) {
      return safeError(requestId, 413, "REQUEST_TOO_LARGE", "Payload invalido.");
    }
    payload = JSON.parse(body) as unknown;
  } catch {
    return safeError(requestId, 400, "INVALID_JSON", "Payload invalido.");
  }

  const result = validateContactPayload(payload);

  if (!result.isValid) {
    return NextResponse.json({ errors: result.errors, requestId }, { status: 400 });
  }

  const webhookUrl = getContactWebhookUrl();

  if (!webhookUrl) {
    console.error({
      event: "contact_request_failed",
      requestId,
      errorCode: "SERVICE_UNAVAILABLE",
      durationMs: Date.now() - startedAt,
    });
    return safeError(requestId, 503, "SERVICE_UNAVAILABLE", "Nao foi possivel enviar a mensagem.");
  }

  try {
    const makeResponse = await fetch(webhookUrl, {
      body: JSON.stringify(createMakePayload(result.data)),
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(getTimeoutMs()),
    });

    if (!makeResponse.ok) {
      console.error({
        event: "contact_upstream_failed",
        requestId,
        errorCode: "UPSTREAM_FAILURE",
        status: makeResponse.status,
        durationMs: Date.now() - startedAt,
      });
      return safeError(requestId, 502, "UPSTREAM_FAILURE", "Nao foi possivel enviar a mensagem.");
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error({
      event: "contact_request_failed",
      requestId,
      errorCode: isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_FAILURE",
      durationMs: Date.now() - startedAt,
    });
    return safeError(
      requestId,
      isTimeout ? 504 : 502,
      isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_FAILURE",
      "Nao foi possivel enviar a mensagem.",
    );
  }
}
