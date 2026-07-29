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

// 교사 대시보드 전용 신호: 레벨 테스트 결과가 최하 단계이거나, 틀린 단어/문장이
// 누적되어 AI 추천학습이 계속 같은 취약점을 가리키는 학생을 "관심 필요"로 표시.
export function needsAttention(student: Student): boolean {
  if (student.proficiencyTier === "easy") return true;
  return student.wrongWordIds.length + student.wrongPhraseIds.length >= 8;
}

// AI 학습 피드백/평가는 되도록 항상 시도하되, 정말 아무 학습 흔적도 없는
// (진단조차 안 한) 학생만 API 호출 없이 "더 학습해볼까요?" 안내로 대체한다.
export function hasEnoughDataForFeedback(student: Student): boolean {
  return (
    student.proficiencyTier !== null ||
    student.xp > 0 ||
    student.wrongWordIds.length > 0 ||
    student.wrongPhraseIds.length > 0
  );
}

export type Recommendation = { type: "category"; categoryId: string } | { type: "formal" } | null;

// AI 추천학습: picks between "practice your weakest location" and "practice
// polite speech" depending on which signal is stronger, instead of only ever
// looking at wrong-answer counts by category. Returns null when there isn't
// enough data yet to recommend anything.
export function getRecommendation(student: Student): Recommendation {
  const ranked = getWeaknessByCategory(student);
  const topCategoryCount = ranked.length > 0 ? ranked[0].count : 0;
  const formalCount = student.formalMistakeCount;

  if (topCategoryCount === 0 && formalCount === 0) return null;
  if (formalCount >= 3 && formalCount >= topCategoryCount) return { type: "formal" };
  if (topCategoryCount > 0) return { type: "category", categoryId: ranked[0].categoryId };
  return { type: "formal" };
}
