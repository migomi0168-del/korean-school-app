"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { NativeText } from "@/components/common/NativeText";
import { words } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { filterByDifficulty } from "@/lib/difficulty";
import type { Word } from "@/types";

const PAIR_COUNT = 6;
const MISMATCH_DELAY = 800;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface MatchCard {
  id: string;
  pairId: string;
  type: "word" | "meaning";
  word: Word;
}

function buildCards(pool: Word[], count: number): MatchCard[] {
  const chosen = shuffle(pool).slice(0, Math.min(count, pool.length));
  const cards: MatchCard[] = chosen.flatMap((word) => [
    { id: `${word.id}-word`, pairId: word.id, type: "word" as const, word },
    { id: `${word.id}-meaning`, pairId: word.id, type: "meaning" as const, word },
  ]);
  return shuffle(cards);
}

type Phase = "playing" | "done";

export default function MatchGamePage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const cardsRef = useRef<MatchCard[] | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());
  const busyRef = useRef(false);

  if (student && startXpRef.current === null) startXpRef.current = student.xp;
  if (student && cardsRef.current === null) {
    const pool = filterByDifficulty(words, student.proficiencyTier ?? "normal");
    cardsRef.current = buildCards(pool, PAIR_COUNT);
  }

  if (loading || !cardsRef.current) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }
  const nativeLanguage = student.nativeLanguage;
  const cards = cardsRef.current;

  async function finishGame() {
    setPhase("done");
    setSaving(true);
    await pendingWriteRef.current;
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    setSaving(false);
    setLeveledUp(newLevel > prevLevel);
  }

  function handleTapCard(card: MatchCard) {
    if (!student || busyRef.current) return;
    if (flipped.includes(card.id) || matchedPairIds.includes(card.pairId)) return;
    if (flipped.length >= 2) return;

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);
    if (nextFlipped.length < 2) return;

    busyRef.current = true;
    setMoves((m) => m + 1);
    const [firstId, secondId] = nextFlipped;
    const first = cards.find((c) => c.id === firstId)!;
    const second = cards.find((c) => c.id === secondId)!;
    const isMatch = first.pairId === second.pairId && first.type !== second.type;

    if (isMatch) {
      playCorrectSound();
      const nextMatched = [...matchedPairIds, first.pairId];
      setSessionXp((x) => x + XP_REWARD.matchGame);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.matchGame);
      setTimeout(() => {
        setMatchedPairIds(nextMatched);
        setFlipped([]);
        busyRef.current = false;
        if (nextMatched.length === PAIR_COUNT) finishGame();
      }, 300);
    } else {
      playWrongSound();
      setWrongPairFlash(nextFlipped);
      setTimeout(() => {
        setFlipped([]);
        setWrongPairFlash([]);
        busyRef.current = false;
      }, MISMATCH_DELAY);
    }
  }

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">🎴</div>
        <h1 className="font-display text-2xl">게임 종료!</h1>
        <p className="text-lg">{moves}번 만에 짝을 다 맞혔어요</p>
        {leveledUp && <p className="font-display text-xl text-duo-yellow-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{sessionXp} XP</p>
        <p className="text-lg font-bold text-duo-yellow-dark">+{sessionXp} 포인트 💰</p>
        <Button onClick={() => router.push("/game/match")} disabled={saving}>
          다시 하기
        </Button>
        <Link href="/game" className="text-sm text-ink/40 underline">
          게임모드로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between text-sm text-ink/50">
        <Link href="/game" className="text-ink/40">
          ← 그만하기
        </Link>
        <span>짝 {matchedPairIds.length}/{PAIR_COUNT}</span>
        <span>시도 {moves}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isFlipped = isMatched || flipped.includes(card.id);
          const isWrong = wrongPairFlash.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleTapCard(card)}
              disabled={isMatched || isFlipped}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 p-2 text-center transition-colors ${
                isMatched
                  ? "border-duo-green bg-duo-green/20"
                  : isWrong
                    ? "border-duo-red bg-duo-red/20"
                    : isFlipped
                      ? "border-duo-blue bg-duo-blue/10"
                      : "border-duo-gray bg-white active:scale-95"
              }`}
            >
              {isFlipped ? (
                card.type === "word" ? (
                  <span className="font-display text-base">{card.word.ko}</span>
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{card.word.emoji}</span>
                    <span className="text-xs font-bold text-duo-blue-dark">
                      <NativeText text={card.word.translations[nativeLanguage]} lang={nativeLanguage} />
                    </span>
                  </span>
                )
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
