import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = `너는 초등학생 한국어 학습 앱의 채점 도우미야.
학생이 입력한 한국어 문장이 정답(또는 정답의 다른 표현들)과 의미/맥락이 통하면 정답으로 인정해.
활용형 차이(예: 반갑다/반가워/반갑습니다), 존댓말/반말 차이, 사소한 띄어쓰기·맞춤법 오타는 신경쓰지 말고
의미가 통하는지만 봐. 완전히 다른 뜻이거나 문법이 아예 안 되는 경우만 오답으로 처리해.
반드시 JSON으로만 {"correct": boolean} 형태로 응답해.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ correct: false, error: "no key" }, { status: 500 });
  }

  const { input, answer, alternates } = await req.json();
  const acceptable = [answer, ...(alternates ?? [])].join(" / ");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `학생 입력: "${input}"\n정답(들): "${acceptable}"` }],
            },
          ],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: { correct: { type: "BOOLEAN" } },
              required: ["correct"],
            },
          },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ correct: false }, { status: 200 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ correct: Boolean(parsed.correct) });
  } catch {
    return NextResponse.json({ correct: false }, { status: 200 });
  }
}
