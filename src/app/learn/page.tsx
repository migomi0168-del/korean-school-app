"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useStudentSession } from "@/hooks/useStudentSession";
import { getRecommendation } from "@/lib/weakness";
import { getSection } from "@/lib/content";

export default function LearnHubPage() {
  const { student } = useStudentSession();
  const router = useRouter();
  const [showShortage, setShowShortage] = useState(false);

  const recommendation = student ? getRecommendation(student) : null;
  const recommendedSection = recommendation?.type === "category" ? getSection(recommendation.categoryId) : null;

  function handleRecommendClick() {
    if (!recommendation) {
      setShowShortage(true);
      return;
    }
    if (recommendation.type === "formal") {
      router.push(`/learn/custom?auto=formal&next=${encodeURIComponent("/learn")}`);
      return;
    }
    router.push(`/learn/sentence?category=${recommendation.categoryId}&next=${encodeURIComponent("/learn")}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">📖 학습모드</h1>

      <Link href="/learn/word">
        <Card className="flex items-center gap-4">
          <div className="text-4xl">🔤</div>
          <div>
            <p className="font-display text-lg">단어 학습</p>
            <p className="text-xs text-ink/50">뜻을 보고 한글로 입력하기 / 빈칸 채우기</p>
          </div>
        </Card>
      </Link>

      <Link href="/learn/sentence">
        <Card className="flex items-center gap-4">
          <div className="text-4xl">✍️</div>
          <div>
            <p className="font-display text-lg">문장 학습</p>
            <p className="text-xs text-ink/50">뜻을 보고 한국어 문장 입력하기</p>
          </div>
        </Card>
      </Link>

      <button onClick={handleRecommendClick} className="text-left">
        <Card className="flex items-center gap-4 border-duo-pink bg-duo-pink/5">
          <div className="text-4xl">🎯</div>
          <div>
            <p className="font-display text-lg text-duo-pink-dark">AI 추천 학습</p>
            <p className="text-xs text-ink/50">
              {recommendation?.type === "formal"
                ? "존댓말 집중 연습 (평소보다 반말이 자주 나와요)"
                : recommendedSection
                  ? `${recommendedSection.emoji} ${recommendedSection.name} 집중 연습 (자주 틀리는 부분이에요)`
                  : "내 약점을 분석해서 맞춤 문제를 준비해줘요"}
            </p>
          </div>
        </Card>
      </button>

      <Link href="/learn/custom">
        <Card className="flex items-center gap-4 border-duo-blue bg-duo-blue/5">
          <div className="text-4xl">🧭</div>
          <div>
            <p className="font-display text-lg text-duo-blue-dark">자기 설계 학습</p>
            <p className="text-xs text-ink/50">상황과 대화 상대를 직접 골라서 연습해요</p>
          </div>
        </Card>
      </Link>

      {showShortage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="flex w-full max-w-xs flex-col gap-3 rounded-3xl bg-white p-5 text-center shadow-lg">
            <p className="font-display text-lg">😅</p>
            <p className="text-sm text-ink">학습량이 부족해서 판단할 수 없어요. 단어·문장학습부터 하고 다시 만나요.</p>
            <Button onClick={() => setShowShortage(false)}>확인</Button>
          </div>
        </div>
      )}
    </div>
  );
}
