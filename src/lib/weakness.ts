import { getWord, getPhrase, sections } from "@/lib/content";
import type { Student } from "@/types";

export interface CategoryCount {
  categoryId: string;
  count: number;
}

// Combines wrong words (via their category) and wrong phrases (via their
// section) into one weakness signal per school-life category, since both
// share the same 5 category ids.
export function getWeaknessByCategory(student: Student): CategoryCount[] {
  const counts: Record<string, number> = {};
  for (const id of student.wrongWordIds) {
    const w = getWord(id);
    if (w) counts[w.category] = (counts[w.category] ?? 0) + 1;
  }
  for (const id of student.wrongPhraseIds) {
    const p = getPhrase(id);
    if (p) counts[p.section] = (counts[p.section] ?? 0) + 1;
  }
  return sections
    .map((s) => ({ categoryId: s.id, count: counts[s.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getWeakestCategory(student: Student): string | null {
  const ranked = getWeaknessByCategory(student);
  if (ranked.length === 0 || ranked[0].count === 0) return null;
  return ranked[0].categoryId;
}
