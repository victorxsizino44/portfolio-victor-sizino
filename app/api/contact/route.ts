import { NextResponse } from "next/server";
import { sendContactEmail, validateContactPayload } from "../../../lib/email";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const result = validateContactPayload(payload);

  if (!result.isValid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  try {
    await sendContactEmail(result.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return NextResponse.json({ error: "Não foi possível enviar a mensagem." }, { status: 500 });
  }
}
