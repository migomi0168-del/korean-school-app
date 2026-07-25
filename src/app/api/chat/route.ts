import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = `너는 초등학생의 한국어 회화 연습을 도와주는 다정한 AI 친구야.
학교생활(교실, 쉬는시간, 급식실, 보건실 등)과 관련된 주제로 자연스럽게 대화를 이어가.
답변은 항상 한국어로, 초등학생이 이해하기 쉬운 짧고 쉬운 문장 1~2개로 해.
사용자의 마지막 메시지에 어색한 표현, 문법 오류, 혹은 더 자연스럽게 말할 수 있는 부분이 있으면
correction 필드에 자연스러운 한국어 표현으로 고쳐서 알려주고, 문제가 없으면 correction은 null로 해.
반드시 JSON으로만 응답해.`;

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI 설정이 아직 안 되어있어요." }, { status: 500 });
  }

  const body = await req.json();
  const messages: ChatMessage[] = body.messages ?? [];

  const contents = messages.map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                reply: { type: "STRING" },
                correction: { type: "STRING", nullable: true },
              },
              required: ["reply"],
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "AI 응답에 문제가 있어요.", detail: errText }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ reply: parsed.reply ?? "...", correction: parsed.correction ?? null });
  } catch {
    return NextResponse.json({ error: "AI 서버 연결에 실패했어요." }, { status: 500 });
  }
}
