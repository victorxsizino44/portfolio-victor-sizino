import { NextResponse } from "next/server";

type AgentRequest = {
  question?: unknown;
};

export async function POST(request: Request) {
  const webhookUrl = process.env.MAKE_AGENT_R_WEBHOOK_URL?.trim();

  console.log("[agente-r] Webhook URL configured:", Boolean(webhookUrl), webhookUrl);

  if (!webhookUrl) {
    console.error("[agente-r] Missing webhook URL. Expected MAKE_AGENT_R_WEBHOOK_URL in .env.local.");

    return NextResponse.json(
      {
        answer: "O Agente R ainda nao foi configurado. Tente novamente em alguns instantes.",
        error: "Missing MAKE_AGENT_R_WEBHOOK_URL.",
      },
      { status: 500 },
    );
  }

  let payload: AgentRequest;

  try {
    payload = await request.json();
  } catch (error) {
    console.error("[agente-r] Invalid JSON payload:", error);

    return NextResponse.json(
      {
        answer: "Nao consegui ler sua pergunta. Tente enviar novamente.",
        error: "Invalid request JSON.",
      },
      { status: 400 },
    );
  }

  const question = typeof payload.question === "string" ? payload.question.trim() : "";

  if (!question) {
    console.warn("[agente-r] Empty question received:", payload);

    return NextResponse.json(
      {
        answer: "Digite uma pergunta para conversar com o Agente R.",
        error: "Missing question.",
      },
      { status: 400 },
    );
  }

  const makePayload = { question };

  try {
    console.log("[agente-r] Sending payload to Make:", makePayload);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(makePayload),
    });

    console.log("[agente-r] Make response status:", response.status);
    console.log("[agente-r] Make response content-type:", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log("[agente-r] Make raw response:", responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          answer: "Desculpe, o Agente R encontrou um erro no fluxo do Make.",
          error: `Make webhook failed with status ${response.status}.`,
          details: responseText,
        },
        { status: 502 },
      );
    }

    const answer = responseText.trim();

    return NextResponse.json({
      answer: answer || "Nao encontrei uma resposta para essa pergunta agora.",
    });
  } catch (error) {
    console.error("[agente-r] Fetch failed:", error);

    return NextResponse.json(
      {
        answer: "Desculpe, ocorreu um erro ao consultar o Agente R.",
        error: error instanceof Error ? error.message : "Unknown fetch error.",
      },
      { status: 502 },
    );
  }
}
