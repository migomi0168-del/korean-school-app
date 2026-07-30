import { NextRequest, NextResponse } from "next/server";

// Pinned to a specific stable version, not the "-latest" alias — see chat/route.ts.
const MODEL = "gemini-3.5-flash";

const SYSTEM_INSTRUCTION = `너는 다문화 배경 초등학생의 한국어 학습을 관리하는 담임 선생님을 돕는 보조야.
아래 학생 데이터를 보고, 선생님에게 보여줄 짧은 학생 평가를 한국어로 3~4문장 작성해줘.
학생을 3인칭으로 지칭하고("이 학생은..."), 학생을 직접 응원하는 말투가 아니라 선생님이 참고할 객관적인 평가 톤으로 써.
잘하고 있는 점을 먼저 짚고, 걱정되는 부분이 있으면 구체적으로 알려주고, 선생님이 다음에 뭘 해주면 좋을지
실질적인 제안을 한 가지 포함해줘 (예: 특정 상황 학습 배정, 실천모드 독려 등). 마크다운 없이 평문으로만.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ feedback: "" }, { status: 500 });
  }

  const {
    nickname,
    grade,
    level,
    streak,
    proficiencyTier,
    weakestCategoryName,
    wrongWords,
    wrongPhrases,
    attendedToday,
    practiceDoneToday,
  } = await req.json();

  const tierLabel: Record<string, string> = { easy: "쉬움", normal: "보통", hard: "어려움" };

  const prompt = `학생 이름: ${nickname} (${grade}학년)
레벨: ${level}, 연속 출석: ${streak}일, 오늘 출석: ${attendedToday ? "함" : "안 함"}, 오늘 실천모드: ${practiceDoneToday ? "완료" : "미완료"}
레벨 진단 결과: ${proficiencyTier ? tierLabel[proficiencyTier] ?? proficiencyTier : "진단 전"}
자주 틀리는 단어: ${wrongWords.length ? wrongWords.join(", ") : "없음"}
자주 틀리는 문장: ${wrongPhrases.length ? wrongPhrases.join(", ") : "없음"}
가장 약한 상황 영역: ${weakestCategoryName ?? "뚜렷한 약점 없음"}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          }),
        }
      );

      if (res.status === 429) return NextResponse.json({ feedback: "", rateLimited: true }, { status: 200 });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text.trim()) throw new Error("empty response");
      return NextResponse.json({ feedback: text.trim() });
    } catch {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  return NextResponse.json({ feedback: "" }, { status: 200 });
}
