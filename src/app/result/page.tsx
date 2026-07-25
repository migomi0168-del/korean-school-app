"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { getNewlyUnlocked } from "@/lib/accessories";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const xp = params.get("xp") ?? "0";
  const leveledUp = params.get("leveledUp") === "1";
  const score = params.get("score");
  const next = params.get("next") ?? "/home";
  const prevLevel = Number(params.get("prevLevel") ?? "0");
  const newLevel = Number(params.get("newLevel") ?? "0");
  const unlocked = leveledUp && prevLevel && newLevel ? getNewlyUnlocked(prevLevel, newLevel) : [];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="relative">
        <div className="explode-pop text-8xl">{leveledUp ? "🏆" : "🎉"}</div>
        {leveledUp && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-3 text-3xl">
            <span className="clap-float" style={{ animationDelay: "0ms" }}>👏</span>
            <span className="clap-float" style={{ animationDelay: "120ms" }}>🎊</span>
            <span className="clap-float" style={{ animationDelay: "60ms" }}>👏</span>
          </div>
        )}
      </div>
      {leveledUp && <h1 className="font-display text-3xl text-duo-yellow-dark">레벨 업!</h1>}
      <h2 className="font-display text-2xl">잘했어요!</h2>
      <p className="text-xl font-bold text-duo-green-dark">+{xp} XP</p>
      {score !== null && <p className="text-lg text-ink/60">점수: {score}점</p>}
      {unlocked.length > 0 && (
        <div className="rounded-2xl border-2 border-duo-yellow bg-duo-yellow/10 p-4">
          <p className="font-display text-sm text-duo-yellow-dark">🎁 새 아이템 획득!</p>
          <div className="mt-1 flex justify-center gap-3 text-3xl">
            {unlocked.map((a) => (
              <span key={a.id}>{a.emoji}</span>
            ))}
          </div>
          <p className="mt-1 text-xs text-ink/50">꾸미기에서 착용해보세요</p>
        </div>
      )}
      <Button onClick={() => router.push(next)}>계속하기</Button>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}
