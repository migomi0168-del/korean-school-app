"use client";

import Link from "next/link";
import { Card } from "@/components/common/Card";
import { DIFFICULTY_LABEL } from "@/lib/difficulty";
import type { Difficulty } from "@/types";

const DIFFICULTY_BADGE_CLASS: Record<Difficulty, string> = {
  easy: "bg-duo-green/10 text-duo-green-dark",
  normal: "bg-duo-yellow/10 text-duo-yellow-dark",
  hard: "bg-duo-red/10 text-duo-red",
};

// Ordered easiest → hardest: quickpick/match are tap-to-recognize with no
// typing, sort/scramble add reading comprehension and word-order reasoning,
// bomb/escape both require typing full answers under time or gate pressure.
const GAMES: { href: string; emoji: string; title: string; desc: string; difficulty: Difficulty }[] = [
  { href: "/game/quickpick", emoji: "⚡", title: "빠르게 골라요", desc: "그림을 보고 맞는 단어 탭하기", difficulty: "easy" },
  { href: "/game/match", emoji: "🎴", title: "짝맞추기 카드게임", desc: "단어와 뜻이 적힌 카드 짝 찾기", difficulty: "easy" },
  { href: "/game/sort", emoji: "🗂️", title: "상황별 분류 게임", desc: "표현이 어디서 쓰이는지 골라보기", difficulty: "normal" },
  { href: "/game/scramble", emoji: "🧩", title: "문장 조각 맞추기", desc: "조각을 순서대로 탭해서 문장 완성하기", difficulty: "normal" },
  { href: "/game/bomb", emoji: "💣", title: "단어 폭탄 게임", desc: "떨어지는 단어를 로켓으로 막기", difficulty: "hard" },
  { href: "/game/escape", emoji: "🚪", title: "학교 방탈출", desc: "장소별 표현을 풀며 탈출하기", difficulty: "hard" },
];

export default function GameHubPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🎮 게임모드</h1>

      {GAMES.map((g) => (
        <Link key={g.href} href={g.href}>
          <Card className="flex items-center gap-4">
            <div className="text-4xl">{g.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg">{g.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${DIFFICULTY_BADGE_CLASS[g.difficulty]}`}>
                  {DIFFICULTY_LABEL[g.difficulty]}
                </span>
              </div>
              <p className="text-xs text-ink/50">{g.desc}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
