import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { levelFromXp, xpIntoLevel, XP_PER_LEVEL } from "@/lib/xp";

export function XPHeader({
  nickname,
  avatar,
  accessoryId,
  xp,
  points,
  streakCount,
}: {
  nickname: string;
  avatar: string | null;
  accessoryId?: string | null;
  xp: number;
  points: number;
  streakCount: number;
}) {
  const level = levelFromXp(xp);
  const into = xpIntoLevel(xp);

  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar emoji={avatar} accessoryId={accessoryId} size="md" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg">{nickname}</p>
          <span className="flex items-center gap-1 rounded-full bg-duo-yellow/30 px-2 py-0.5 text-sm font-bold text-duo-yellow-dark">
            🔥 {streakCount}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-bold text-duo-green-dark">Lv.{level}</span>
          <ProgressBar value={(into / XP_PER_LEVEL) * 100} />
        </div>
        <p className="mt-0.5 text-xs font-bold text-duo-yellow-dark">💰 {points}P</p>
      </div>
    </div>
  );
}
