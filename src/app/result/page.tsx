"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { UnlockNotice } from "@/components/common/UnlockNotice";
import { getNewlyUnlocked } from "@/lib/accessories";
import { useStudentSession } from "@/hooks/useStudentSession";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { student } = useStudentSession();
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
      {student && <UnlockNotice accessories={unlocked} studentId={student.id} />}
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
