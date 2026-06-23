import { NextResponse } from "next/server";

const MESSAGE_MAX_LENGTH = 2000;

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
  return process.env.CONTACT_WEBHOOK_URL;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const result = validateContactPayload(payload);

  if (!result.isValid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const webhookUrl = getContactWebhookUrl();

  if (!webhookUrl) {
    console.error("[contact] CONTACT_WEBHOOK_URL is not configured.");
    return NextResponse.json({ error: "Nao foi possivel enviar a mensagem." }, { status: 500 });
  }

  try {
    const makeResponse = await fetch(webhookUrl, {
      body: JSON.stringify(createMakePayload(result.data)),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!makeResponse.ok) {
      throw new Error(`Make webhook failed with status ${makeResponse.status}.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] Failed to send contact webhook:", error);
    return NextResponse.json({ error: "Nao foi possivel enviar a mensagem." }, { status: 500 });
  }
}
