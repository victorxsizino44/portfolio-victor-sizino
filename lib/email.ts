import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const CONTACT_RECIPIENT = "victorvsp@gmail.com";
const MESSAGE_MAX_LENGTH = 2000;

export type ContactEmailInput = {
  name: string;
  company: string;
  email: string;
  contactType: string;
  message: string;
};

export type ContactValidationResult =
  | {
      data: ContactEmailInput;
      isValid: true;
    }
  | {
      errors: string[];
      isValid: false;
    };

function sanitizeSingleLine(value: unknown, maxLength = 160) {
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
    .trim()
    .slice(0, MESSAGE_MAX_LENGTH);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateContactPayload(payload: unknown): ContactValidationResult {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const data: ContactEmailInput = {
    name: sanitizeSingleLine(source.name),
    company: sanitizeSingleLine(source.company),
    email: sanitizeSingleLine(source.email, 254),
    contactType: sanitizeSingleLine(source.contactType || "Sem tipo"),
    message: sanitizeMessage(source.message),
  };

  const errors: string[] = [];

  if (!data.name) {
    errors.push("Nome obrigatório.");
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Email obrigatório.");
  }

  if (!data.message) {
    errors.push("Mensagem obrigatória.");
  }

  return errors.length > 0 ? { errors, isValid: false } : { data, isValid: true };
}

export async function sendContactEmail(data: ContactEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return resend.emails.send({
    from: "Portfolio Victor Sizino <onboarding@resend.dev>",
    replyTo: data.email,
    subject: `[Novo Contato Portfólio] ${data.contactType}`,
    text: `Novo contato recebido pelo portfólio

Nome:
${data.name}

Empresa:
${data.company || "Não informada"}

Email:
${data.email}

Tipo de contato:
${data.contactType}

Mensagem:
${data.message}

Responder para:
${data.email}`,
    to: CONTACT_RECIPIENT,
  });
}
