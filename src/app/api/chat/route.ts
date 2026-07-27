import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";

const BASE_SYSTEM_INSTRUCTION = `너는 초등학생의 한국어 회화 연습을 도와주는 AI야.
답변은 항상 한국어로, 초등학생이 이해하기 쉬운 짧고 쉬운 문장 1~2개로 해.
사용자의 마지막 메시지에 어색한 표현, 문법 오류, 혹은 더 자연스럽게 말할 수 있는 부분이 있으면
correction 필드에 자연스러운 한국어 표현으로 고쳐서 알려주고, 문제가 없으면 correction은 null로 해.
반드시 JSON으로만 응답해.`;

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

function buildSystemInstruction(partner?: string, location?: string) {
  if (!partner || !location) return BASE_SYSTEM_INSTRUCTION;
  const formal = partner.includes("선생님");
  return `${BASE_SYSTEM_INSTRUCTION}
지금부터 너는 "${partner}" 역할이야. 대화 장소는 "${location}"이고, 그 역할과 장소에 어울리는 상황으로 자연스럽게 대화를 이어가.
${formal ? "선생님답게 다정한 존댓말을 사용해." : "또래 친구처럼 편안한 반말을 사용해."}
역할과 장소 설정에서 벗어나지 말고 계속 그 캐릭터를 유지해.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI 설정이 아직 안 되어있어요." }, { status: 500 });
  }

  const body = await req.json();
  const messages: ChatMessage[] = body.messages ?? [];
  const partner: string | undefined = body.partner;
  const location: string | undefined = body.location;

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
          systemInstruction: { parts: [{ text: buildSystemInstruction(partner, location) }] },
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
