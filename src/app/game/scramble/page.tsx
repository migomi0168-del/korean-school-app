"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { NativeText } from "@/components/common/NativeText";
import { phrases } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { filterByDifficulty } from "@/lib/difficulty";
import type { Phrase } from "@/types";

const TOTAL_ROUNDS = 6;
const ADVANCE_DELAY = 1600;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Block {
  id: string;
  text: string;
}

interface Round {
  phrase: Phrase;
  correctBlocks: string[];
  tray: Block[];
}

function buildRounds(pool: Phrase[], count: number): Round[] {
  const targets = shuffle(pool).slice(0, Math.min(count, pool.length));
  return targets.map((phrase) => {
    const correctBlocks = phrase.ko.split(" ").filter(Boolean);
    const blocks = correctBlocks.map((text, i) => ({ id: `${i}-${text}`, text }));
    let tray = shuffle(blocks);
    // A shuffle landing back on the original order would make the puzzle trivial.
    while (blocks.length > 1 && tray.every((b, i) => b.id === blocks[i].id)) {
      tray = shuffle(blocks);
    }
    return { phrase, correctBlocks, tray };
  });
}

type Phase = "playing" | "done";
type Answer = "correct" | "wrong" | null;

export default function ScrambleGamePage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const roundsRef = useRef<Round[] | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [tray, setTray] = useState<Block[]>([]);
  const [placed, setPlaced] = useState<Block[]>([]);
  const [answer, setAnswer] = useState<Answer>(null);
  const [score, setScore] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [levelRange, setLevelRange] = useState<{ prev: number; next: number }>({ prev: 0, next: 0 });
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  if (student && startXpRef.current === null) startXpRef.current = student.xp;
  if (student && roundsRef.current === null) {
    const blockEligible = phrases.filter((p) => p.ko.split(" ").filter(Boolean).length >= 3);
    const pool = filterByDifficulty(blockEligible, student.proficiencyTier ?? "normal");
    roundsRef.current = buildRounds(pool, TOTAL_ROUNDS);
    setTray(roundsRef.current[0].tray);
  }

  if (loading || !roundsRef.current) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }
  const nativeLanguage = student.nativeLanguage;
  const rounds = roundsRef.current;
  const round = rounds[index];

  async function finishGame() {
    setPhase("done");
    setSaving(true);
    await pendingWriteRef.current;
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    setSaving(false);
    setLeveledUp(newLevel > prevLevel);
    setLevelRange({ prev: prevLevel, next: newLevel });
  }

  // Re-navigating to this same route doesn't remount the component, so
  // roundsRef would otherwise keep the old rounds forever — rebuild the pool
  // and reset every piece of round state explicitly instead.
  function handleRestart() {
    if (!student) return;
    const blockEligible = phrases.filter((p) => p.ko.split(" ").filter(Boolean).length >= 3);
    const pool = filterByDifficulty(blockEligible, student.proficiencyTier ?? "normal");
    const newRounds = buildRounds(pool, TOTAL_ROUNDS);
    roundsRef.current = newRounds;
    startXpRef.current = student.xp;
    setIndex(0);
    setTray(newRounds[0].tray);
    setPlaced([]);
    setAnswer(null);
    setScore(0);
    setSessionXp(0);
    setSaving(false);
    setLeveledUp(false);
    setLevelRange({ prev: 0, next: 0 });
    setPhase("playing");
  }

  function goToNextRound(currentIndex: number) {
    if (currentIndex + 1 >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }
    const next = currentIndex + 1;
    setIndex(next);
    setTray(rounds[next].tray);
    setPlaced([]);
    setAnswer(null);
  }

  function grade(finalPlaced: Block[]) {
    if (!student) return;
    const isCorrect = finalPlaced.every((b, i) => b.text === round.correctBlocks[i]);
    setAnswer(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      playCorrectSound();
      setScore((s) => s + 1);
      setSessionXp((x) => x + XP_REWARD.sentenceOrder);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.sentenceOrder);
    } else {
      playWrongSound();
      pendingWriteRef.current = recordWrongPhrase(student.id, round.phrase.id);
    }
    setTimeout(() => goToNextRound(index), ADVANCE_DELAY);
  }

  function handleTapTray(block: Block) {
    if (answer) return;
    const nextPlaced = [...placed, block];
    setTray((t) => t.filter((b) => b.id !== block.id));
    setPlaced(nextPlaced);
    if (nextPlaced.length === round.correctBlocks.length) {
      grade(nextPlaced);
    }
  }

  function handleTapPlaced(block: Block) {
    if (answer) return;
    setPlaced((p) => p.filter((b) => b.id !== block.id));
    setTray((t) => [...t, block]);
  }

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">🧩</div>
        <h1 className="font-display text-2xl">게임 종료!</h1>
        <p className="text-lg">{score} / {TOTAL_ROUNDS} 개 맞혔어요</p>
        {leveledUp && <p className="font-display text-xl text-duo-yellow-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{sessionXp} XP</p>
        <p className="text-lg font-bold text-duo-yellow-dark">+{sessionXp} 포인트 💰</p>
        <Button onClick={handleRestart} disabled={saving}>
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
        <span>문제 {index + 1}/{TOTAL_ROUNDS}</span>
        <span>점수 {score}</span>
      </div>
      <ProgressBar value={(index / TOTAL_ROUNDS) * 100} colorClass="bg-duo-blue" />

      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-duo-gray bg-white py-6 text-center">
        <div className="text-5xl">{round.phrase.emoji}</div>
        <p className="text-lg font-bold text-duo-blue-dark">
          <NativeText text={round.phrase.translations[nativeLanguage]} lang={nativeLanguage} />
        </p>
      </div>

      <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-duo-gray bg-duo-gray/10 p-3">
        {placed.length === 0 && <p className="text-sm text-ink/30">여기에 조각을 순서대로 놓아보세요</p>}
        {placed.map((b) => (
          <button
            key={b.id}
            onClick={() => handleTapPlaced(b)}
            disabled={!!answer}
            className={`rounded-xl border-2 px-3 py-2 font-display text-lg ${
              answer === "correct"
                ? "border-duo-green bg-duo-green/20 text-duo-green-dark"
                : answer === "wrong"
                  ? "border-duo-red bg-duo-red/20 text-duo-red"
                  : "border-duo-blue bg-duo-blue/10 text-duo-blue-dark"
            }`}
          >
            {b.text}
          </button>
        ))}
      </div>

      {answer === "wrong" && (
        <p className="text-center text-sm text-ink/50">
          정답: <span className="font-bold text-duo-green-dark">{round.phrase.ko}</span>
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2 p-2">
        {tray.map((b) => (
          <button
            key={b.id}
            onClick={() => handleTapTray(b)}
            disabled={!!answer}
            className="rounded-xl border-2 border-duo-gray bg-white px-3 py-2 font-display text-lg active:scale-95"
          >
            {b.text}
          </button>
        ))}
      </div>
    </div>
  );
}
