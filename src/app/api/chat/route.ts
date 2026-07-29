import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";

const BASE_SYSTEM_INSTRUCTION = `너는 초등학생의 한국어 회화 연습 상대야. 실제 사람처럼 행동해.
답변(reply)은 항상 한국어로, 초등학생이 이해하기 쉬운 짧고 쉬운 문장 1~2개로 해.

학생의 마지막 메시지가 한국어가 아니라 다른 언어로 쓰여 있으면:
- 그 뜻을 이해한 다음, 그 상황에 자연스럽게 어울리는 한국어 대답을 reply에 써.
- correction 필드에는 학생이 하려던 말을 한국어로 어떻게 말하면 되는지 알려줘 (예: "그건 한국어로 '~'라고 말해봐!").
- translated 필드는 true로 해.

학생의 마지막 메시지가 한국어인데 어색한 표현, 문법 오류, 더 자연스러운 표현이 있으면:
- correction 필드에 더 자연스러운 한국어 표현을 알려주고, translated는 false로 해.

문제가 없으면 correction은 null, translated는 false로 해.
반드시 JSON으로만 응답해.`;

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

function buildSystemInstruction(partner?: string, location?: string) {
  if (!partner || !location) return BASE_SYSTEM_INSTRUCTION;
  return `${BASE_SYSTEM_INSTRUCTION}

지금부터 너는 "${partner}"이고, 지금 있는 장소는 "${location}"이야. AI라는 티를 절대 내지 말고, 진짜 그 사람이 그 장소에 있는 것처럼 실감나게 연기해.
- 그 장소에서 실제로 있을 법한 상황, 물건, 분위기를 대화에 자연스럽게 녹여내 (예: 급식실이면 지금 먹는 음식 얘기, 도서관이면 조용히 하자는 말, 보건실이면 다친 곳을 걱정하는 말 등).
- 말투는 그 사람과 학생의 실제 관계를 생각해서 정해. 예를 들어 초등학교 선생님은 학생에게 보통 다정하고 친근한 '해요체'나 부드러운 반말을 섞어 쓰지, 딱딱하고 격식 차린 존댓말은 쓰지 않아. 친구 역할이면 또래처럼 편한 반말을 써. 다른 역할이면 그 사람다운 말투를 자연스럽게 골라.
- "저는 AI입니다", "도와드릴게요" 같은 챗봇스러운 말은 절대 하지 말고, 끝까지 그 역할과 상황에 몰입해.`;
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

  // A roleplay prompt combined with strict JSON output occasionally produces
  // a response that's a non-200, or valid-looking text that isn't valid
  // JSON — both are usually transient, so retry once before surfacing an
  // error bubble to the student.
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
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
                  translated: { type: "BOOLEAN" },
                },
                required: ["reply"],
              },
            },
          }),
        }
      );

      if (res.status === 429) {
        return NextResponse.json({ error: "AI 사용량이 많아서 지금은 답할 수 없어요.", rateLimited: true }, { status: 200 });
      }
      if (!res.ok) {
        lastError = `Gemini ${res.status}: ${await res.text()}`;
        throw new Error(lastError);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text.trim()) {
        lastError = "empty response";
        throw new Error(lastError);
      }
      const parsed = JSON.parse(text);
      if (!parsed.reply) {
        lastError = "missing reply field";
        throw new Error(lastError);
      }
      return NextResponse.json({
        reply: parsed.reply,
        correction: parsed.correction ?? null,
        translated: Boolean(parsed.translated),
      });
    } catch (e) {
      lastError = lastError ?? (e instanceof Error ? e.message : "unknown error");
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  return NextResponse.json({ error: "AI 응답에 문제가 있어요.", detail: lastError }, { status: 502 });
}
