import sectionsData from "@/content/sections.json";
import wordsData from "@/content/words.json";
import phrasesData from "@/content/phrases.json";
import type { Section, Word, Phrase } from "@/types";

export const sections = (sectionsData as Section[]).sort((a, b) => a.order - b.order);
export const words = wordsData as Word[];
export const phrases = phrasesData as Phrase[];

export function getWord(wordId: string) {
  return words.find((w) => w.id === wordId) ?? null;
}

export function getPhrase(phraseId: string) {
  return phrases.find((p) => p.id === phraseId) ?? null;
}

export function getSection(sectionId: string) {
  return sections.find((s) => s.id === sectionId) ?? null;
}

export function getPhrasesForSection(sectionId: string) {
  return phrases.filter((p) => p.section === sectionId);
}

export function randomItem<T>(arr: T[], excludeIds: string[] = [], idOf: (item: T) => string = (i) => (i as { id: string }).id): T {
  const pool = arr.filter((item) => !excludeIds.includes(idOf(item)));
  const usable = pool.length > 0 ? pool : arr;
  return usable[Math.floor(Math.random() * usable.length)];
}
