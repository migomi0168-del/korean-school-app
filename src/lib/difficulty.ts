import { getPhrase } from "@/lib/content";
import type { Difficulty } from "@/types";

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "normal", "hard"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

// Filters a content pool down to the student's tier; falls back to the full
// pool if that tier doesn't have enough items yet, so a thin section never
// leaves a student with an empty question set.
export function filterByDifficulty<T extends { difficulty: Difficulty }>(
  items: T[],
  tier: Difficulty,
  minCount = 4
): T[] {
  const exact = items.filter((item) => item.difficulty === tier);
  return exact.length >= minCount ? exact : items;
}

// A short, low-stakes placement quiz shown once at onboarding. Deliberately
// mixes sections/tiers; the student never sees whether an individual answer
// was right or wrong, only a final "here's your starting level" message.
export const DIAGNOSTIC_PHRASE_IDS = ["greeting-1", "cafeteria-2", "class-1", "nurse-3", "cafeteria-4", "class-7"];

export function getDiagnosticPhrases() {
  return DIAGNOSTIC_PHRASE_IDS.map((id) => getPhrase(id)).filter((p): p is NonNullable<typeof p> => p !== null);
}

// The diagnostic asks the student to type a full Korean phrase from scratch
// (production, not multiple-choice), so even a couple of lucky/partial
// answers shouldn't be read as "normal" ability — thresholds are deliberately
// conservative. "hard" specifically requires >=80% correct, since some
// content (rarely-used vocabulary, two-sentence phrases) is gated on that
// same 80% bar elsewhere.
export function tierFromScore(correct: number, total: number): Difficulty {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio < 0.5) return "easy";
  if (ratio < 0.8) return "normal";
  return "hard";
}
