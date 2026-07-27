"use client";

import Link from "next/link";
import { Card } from "@/components/common/Card";

export default function GameHubPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🎮 게임모드</h1>

      <Link href="/game/escape">
        <Card className="flex items-center gap-4">
          <div className="text-4xl">🚪</div>
          <div>
            <p className="font-display text-lg">학교 방탈출</p>
            <p className="text-xs text-ink/50">장소별 표현을 풀며 탈출하기</p>
          </div>
        </Card>
      </Link>

      <Link href="/game/bomb">
        <Card className="flex items-center gap-4">
          <div className="text-4xl">💣</div>
          <div>
            <p className="font-display text-lg">단어 폭탄 게임</p>
            <p className="text-xs text-ink/50">떨어지는 단어를 로켓으로 막기</p>
          </div>
        </Card>
      </Link>

      <Link href="/game/quickpick">
        <Card className="flex items-center gap-4">
          <div className="text-4xl">⚡</div>
          <div>
            <p className="font-display text-lg">빠르게 골라요</p>
            <p className="text-xs text-ink/50">그림을 보고 맞는 단어 탭하기</p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
