import { NextResponse } from "next/server";

type AgentRequest = {
  question?: unknown;
};

export async function POST(request: Request) {
  const webhookUrl = process.env.AGENT_R_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { answer: "O Agente R ainda nao foi configurado. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }

  let payload: AgentRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ answer: "Nao consegui ler sua pergunta. Tente enviar novamente." }, { status: 400 });
  }

  const question = typeof payload.question === "string" ? payload.question.trim() : "";

  if (!question) {
    return NextResponse.json({ answer: "Digite uma pergunta para conversar com o Agente R." }, { status: 400 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    });

    if (!response.ok) {
      throw new Error(`Make webhook failed with status ${response.status}.`);
    }

    const data = await response.json();

    return NextResponse.json({
      answer: data.answer || "Nao encontrei uma resposta para essa pergunta agora.",
    });
  } catch {
    return NextResponse.json(
      { answer: "Desculpe, ocorreu um erro ao consultar o Agente R." },
      { status: 502 },
    );
  }
}
