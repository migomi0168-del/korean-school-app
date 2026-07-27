"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useStudentSession } from "@/hooks/useStudentSession";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { student } = useStudentSession();
  const xp = params.get("xp") ?? "0";
  const leveledUp = params.get("leveledUp") === "1";
  const score = params.get("score");
  const next = params.get("next") ?? "/home";

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
      <p className="text-lg font-bold text-duo-yellow-dark">+{xp} 포인트 💰</p>
      {score !== null && <p className="text-lg text-ink/60">점수: {score}점</p>}
      {student && (
        <p className="text-xs text-ink/40">
          모은 포인트로 상점에서 아이템을 사보세요! 현재 포인트: {student.points}
        </p>
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
