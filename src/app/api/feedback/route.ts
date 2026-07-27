import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-flash-latest";

const LANG_NAME: Record<string, string> = { zh: "Chinese (中文)", en: "English", vi: "Vietnamese (Tiếng Việt)" };

function buildInstruction(nativeLanguage: string) {
  const lang = LANG_NAME[nativeLanguage] ?? "English";
  return `You are a warm, encouraging tutor for an elementary school student learning Korean as a second language.
Write your ENTIRE response in ${lang} (not Korean), since the student may not read Korean well yet.
Keep it short (3-4 sentences), simple, and encouraging — praise what they're doing well, then gently point out
the one area to focus on next based on the mistake data given. Address the student directly ("you"). No markdown.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ feedback: "" }, { status: 500 });
  }

  const { nativeLanguage, weakestCategoryName, wrongWords, wrongPhrases, level, streak } = await req.json();

  const prompt = `Student stats: level ${level}, ${streak}-day streak.
Words they got wrong: ${wrongWords.length ? wrongWords.join(", ") : "none"}
Sentences they got wrong: ${wrongPhrases.length ? wrongPhrases.join(", ") : "none"}
Weakest topic area: ${weakestCategoryName ?? "none yet — they're doing great overall"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: buildInstruction(nativeLanguage) }] },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ feedback: "" }, { status: 200 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ feedback: text.trim() });
  } catch {
    return NextResponse.json({ feedback: "" }, { status: 200 });
  }
}
