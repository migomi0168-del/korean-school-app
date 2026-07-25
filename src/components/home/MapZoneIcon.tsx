import Link from "next/link";
import type { Unit, UnitProgress } from "@/types";

const COLOR_BG: Record<string, string> = {
  blue: "bg-duo-blue",
  yellow: "bg-duo-yellow",
  pink: "bg-duo-pink",
};

export function MapZoneIcon({ unit, progress }: { unit: Unit; progress?: UnitProgress }) {
  const doneCount = [progress?.wordsDone, progress?.sentencesDone, progress?.quizDone].filter(Boolean).length;
  const complete = doneCount === 3;

  return (
    <Link
      href={`/unit/${unit.id}`}
      className="flex flex-col items-center gap-2 rounded-3xl border-2 border-duo-gray bg-white p-4 text-center shadow-sm active:scale-95"
    >
      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-4xl ${COLOR_BG[unit.color] ?? "bg-duo-gray"}`}
      >
        {unit.emoji}
        {complete && (
          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-duo-green text-sm text-white">
            ✓
          </span>
        )}
      </div>
      <p className="font-display text-base">{unit.name}</p>
      <p className="text-xs text-ink/50">{doneCount}/3 완료</p>
    </Link>
  );
}
