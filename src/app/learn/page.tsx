"use client";

import Link from "next/link";
import { Card } from "@/components/common/Card";

export default function LearnHubPage() {
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
    </div>
  );
}
