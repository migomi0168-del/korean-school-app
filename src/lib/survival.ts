import { getPhrase, getWord } from "@/lib/content";
import type { Student } from "@/types";

// A fixed set of 10 must-know phrases for a student who can't read Hangul
// yet — hand-picked, not difficulty-tier-driven, since every student needs
// these on day one regardless of level. Politeness is chosen per phrase by
// who it's actually said to: peer-only calls stay casual (반말); anything
// that could be said to a teacher/adult defaults to polite (존댓말), since
// guessing too formal is harmless but guessing too casual can read as rude.
export const SURVIVAL_PHRASE_IDS = [
  "greeting-8", // 선생님!
  "greeting-1", // 안녕하세요.
  "greeting-9", // 친구야!
  "break-8", // 같이 놀자!
  "class-2", // 화장실 다녀와도 돼요?
  "nurse-7", // 도와주세요.
  "cafeteria-6", // 물 주세요.
  "class-8", // 이거 뭐예요?
  "greeting-4", // 감사합니다.
  "class-9", // 뭐 해야 해요?
];

export function getSurvivalPhrases() {
  return SURVIVAL_PHRASE_IDS.map((id) => getPhrase(id)).filter((p): p is NonNullable<typeof p> => p !== null);
}

// Same idea for 단어 학습: the handful of standalone words a day-one student
// needs most (addressing people, water, knowing where the nurse's room is).
export const SURVIVAL_WORD_IDS = ["w-teacher", "w-friend", "w-water", "w-name", "w-nurseroom"];

export function getSurvivalWords() {
  return SURVIVAL_WORD_IDS.map((id) => getWord(id)).filter((w): w is NonNullable<typeof w> => w !== null);
}

// A student who got every diagnostic question wrong needs the fixed 10
// survival phrases/words reinforced everywhere, not just in their own mode —
// so 단어/문장 학습 both prioritize them ahead of the normal tier-filtered pool.
export function needsSurvivalPriority(student: Pick<Student, "diagnosticCorrect">): boolean {
  return student.diagnosticCorrect === 0;
}
