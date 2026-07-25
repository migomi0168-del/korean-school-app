"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const xp = params.get("xp") ?? "0";
  const leveledUp = params.get("leveledUp") === "1";
  const score = params.get("score");
  const next = params.get("next") ?? "/home";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="text-8xl">{leveledUp ? "🏆" : "🎉"}</div>
      {leveledUp && <h1 className="font-display text-3xl text-duo-yellow-dark">레벨 업!</h1>}
      <h2 className="font-display text-2xl">잘했어요!</h2>
      <p className="text-xl font-bold text-duo-green-dark">+{xp} XP</p>
      {score !== null && <p className="text-lg text-ink/60">점수: {score}점</p>}
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
