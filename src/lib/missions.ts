import missionsData from "@/content/missions.json";
import type { Mission } from "@/types";
import { getPhrase } from "@/lib/content";

export const missions = missionsData as Mission[];

export function getMission(id: string) {
  return missions.find((m) => m.id === id) ?? null;
}

export function getMissionExamples(mission: Mission) {
  return mission.exampleIds.map((id) => getPhrase(id)).filter((p): p is NonNullable<typeof p> => p !== null);
}

// Deterministic per-day shuffle so the 5 shown missions stay the same all day
// (seeded by date string) but still change day to day.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 0xffffffff;
  };
}

export function pickDailyMissionIds(dateStr: string, count = 5) {
  const rand = seededRandom(dateStr);
  const pool = [...missions];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((m) => m.id);
}
