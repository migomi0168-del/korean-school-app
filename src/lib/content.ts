import unitsData from "@/content/units.json";
import wordsData from "@/content/words.json";
import sentencesData from "@/content/sentences.json";
import type { Unit, Word, Sentence } from "@/types";

export const units = unitsData as Unit[];
export const words = wordsData as Word[];
export const sentences = sentencesData as Sentence[];

export function getUnit(unitId: string) {
  return units.find((u) => u.id === unitId) ?? null;
}

export function getWord(wordId: string) {
  return words.find((w) => w.id === wordId) ?? null;
}

export function getSentence(sentenceId: string) {
  return sentences.find((s) => s.id === sentenceId) ?? null;
}

export function getWordsForUnit(unitId: string) {
  const unit = getUnit(unitId);
  if (!unit) return [];
  return unit.wordIds.map(getWord).filter((w): w is Word => w !== null);
}

export function getSentencesForUnit(unitId: string) {
  const unit = getUnit(unitId);
  if (!unit) return [];
  return unit.sentenceIds.map(getSentence).filter((s): s is Sentence => s !== null);
}
