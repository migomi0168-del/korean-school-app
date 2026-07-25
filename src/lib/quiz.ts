import { words, sentences, getWord, getSentence } from "@/lib/content";
import type { NativeLanguage, QuizQuestion } from "@/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface BuiltQuizQuestion {
  id: string;
  promptKo: string;
  promptEmoji?: string;
  choices: string[];
  answer: string;
}

export function buildQuizQuestion(q: QuizQuestion, lang: NativeLanguage): BuiltQuizQuestion | null {
  const pool = q.type === "word" ? words : sentences;
  const item = q.type === "word" ? getWord(q.refId) : getSentence(q.refId);
  if (!item) return null;

  const answer = item.translations[lang];
  const distractors = shuffle(pool.filter((p) => p.id !== item.id))
    .slice(0, 3)
    .map((p) => p.translations[lang]);

  return {
    id: q.id,
    promptKo: item.ko,
    promptEmoji: q.type === "word" ? (item as (typeof words)[number]).emoji : undefined,
    choices: shuffle([answer, ...distractors]),
    answer,
  };
}
