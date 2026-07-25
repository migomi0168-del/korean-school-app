export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number) {
  return xp % XP_PER_LEVEL;
}

export const XP_REWARD = {
  wordCorrect: 5,
  phraseCorrect: 8,
  attendance: 5,
  escapeSection: 15,
  bombGame: 10,
  practiceMode: 15,
} as const;

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
