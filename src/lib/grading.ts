import type { Phrase, Word } from "@/types";

function normalize(str: string) {
  return str
    .trim()
    .replace(/[.,!?~ '"]/g, "")
    .replace(/\s+/g, "");
}

function levenshtein(a: string, b: string) {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function similarity(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length === 0 && nb.length === 0) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

// Treats trailing 해요체 "요" as optional so formal/casual register never
// blocks a correct answer (e.g. "괜찮아" vs "괜찮아요").
function bestSimilarity(input: string, answer: string) {
  const direct = similarity(input, answer);
  const stripYo = (s: string) => normalize(s).replace(/요$/, "");
  const relaxed = similarity(stripYo(input), stripYo(answer));
  return Math.max(direct, relaxed);
}

export function isWordCorrect(input: string, answer: string) {
  return normalize(input) === normalize(answer);
}

// Words can have alternate accepted spellings (e.g. "반찬"/"밑반찬"), unlike
// the base isWordCorrect() which only checks a single exact string.
export function isWordAnswerCorrect(input: string, word: Pick<Word, "ko" | "alternates">) {
  const candidates = [word.ko, ...(word.alternates ?? [])];
  return candidates.some((c) => isWordCorrect(input, c));
}

export function isSentenceCorrect(input: string, answer: string, threshold = 0.8) {
  return bestSimilarity(input, answer) >= threshold;
}

export function isPhraseCorrect(input: string, phrase: Phrase, threshold = 0.75) {
  const candidates = [phrase.ko, ...(phrase.alternates ?? [])];
  return candidates.some((c) => bestSimilarity(input, c) >= threshold);
}

// Polite endings (해요체/합쇼체): "~요", "~습니다/ㅂ니다", "~십시오". Used for
// self-designed practice with a 선생님 partner, where the point of the
// exercise is specifically to force polite speech — the formality-agnostic
// bestSimilarity() relaxation above is deliberately NOT used here.
export function isFormalKorean(input: string) {
  const n = normalize(input);
  return /(요|니다|십시오)$/.test(n);
}

export function isPhraseCorrectFormal(input: string, phrase: Phrase, threshold = 0.75) {
  if (!isFormalKorean(input)) return false;
  const candidates = [phrase.ko, ...(phrase.alternates ?? [])].filter(isFormalKorean);
  return candidates.some((c) => similarity(input, c) >= threshold);
}

// The polite form to show/require on the close-retry step, when the phrase's
// main form itself isn't polite (falls back to phrase.ko regardless so there
// is always something to show).
export function getFormalForm(phrase: Phrase) {
  const candidates = [phrase.ko, ...(phrase.alternates ?? [])];
  return candidates.find(isFormalKorean) ?? phrase.ko;
}

export type GradeVerdict = "correct" | "close" | "wrong";

// Fast local check first for an exact/near-exact match (instant credit).
// Only falls back to an AI judgment call when that fails; if the AI says the
// meaning/context is right but the wording isn't one of the known exact
// forms, that's "close" — not credited yet. The caller should show the
// model answer and require the student to repeat it back (checked locally)
// before granting credit, rather than auto-accepting any paraphrase.
export async function gradePhrase(input: string, phrase: Phrase): Promise<GradeVerdict> {
  if (isPhraseCorrect(input, phrase)) return "correct";
  // A blank submission is never "close" — skip the AI call entirely so an
  // empty-input mis-tap doesn't burn API quota for nothing.
  if (!input.trim()) return "wrong";
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, answer: phrase.ko, alternates: phrase.alternates ?? [] }),
    });
    if (!res.ok) return "wrong";
    const data = await res.json();
    return data.correct ? "close" : "wrong";
  } catch {
    return "wrong";
  }
}

// Same shape as gradePhrase, but requires polite speech: a casual-but-
// correct-meaning answer is never instant-credit — it's "wrong" outright if
// it isn't even polite in form, so the student has to retype the polite
// form on the close-retry step to get credit either way.
export async function gradePhraseFormal(input: string, phrase: Phrase): Promise<GradeVerdict> {
  if (isPhraseCorrectFormal(input, phrase)) return "correct";
  if (!isFormalKorean(input)) return "wrong";
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, answer: phrase.ko, alternates: phrase.alternates ?? [] }),
    });
    if (!res.ok) return "wrong";
    const data = await res.json();
    return data.correct ? "close" : "wrong";
  } catch {
    return "wrong";
  }
}
