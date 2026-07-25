import type { Phrase } from "@/types";

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

export function isSentenceCorrect(input: string, answer: string, threshold = 0.8) {
  return bestSimilarity(input, answer) >= threshold;
}

export function isPhraseCorrect(input: string, phrase: Phrase, threshold = 0.75) {
  const candidates = [phrase.ko, ...(phrase.alternates ?? [])];
  return candidates.some((c) => bestSimilarity(input, c) >= threshold);
}

// Fast local check first; only falls back to an AI judgment call when that
// fails, so things like conjugation variants ("반갑다" vs "반가워") that no
// hand-written alternates list or string-similarity threshold can fully
// anticipate still get graded correctly, without adding latency to the
// common case where the local check already matches.
export async function isPhraseCorrectSmart(input: string, phrase: Phrase): Promise<boolean> {
  if (isPhraseCorrect(input, phrase)) return true;
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, answer: phrase.ko, alternates: phrase.alternates ?? [] }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.correct);
  } catch {
    return false;
  }
}
