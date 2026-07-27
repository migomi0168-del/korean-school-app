"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { NativeText } from "@/components/common/NativeText";
import { MicButton } from "@/components/learn/MicButton";
import { words } from "@/lib/content";
import { isWordCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongWord } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { filterByDifficulty } from "@/lib/difficulty";
import { t } from "@/lib/i18n";
import type { Word } from "@/types";

const TOTAL_ROUNDS = 10;
const SPEED_DURATION: Record<number, number> = { 1: 18000, 3: 9000, 5: 6000 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "select" | "playing" | "done";

export default function BombGamePage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("select");
  const [stars, setStars] = useState<1 | 3 | 5>(3);
  const [roundWords, setRoundWords] = useState<Word[]>([]);
  const [round, setRound] = useState(0);
  const [bombKey, setBombKey] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"falling" | "cleared" | "missed">("falling");
  const [score, setScore] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [levelRange, setLevelRange] = useState<{ prev: number; next: number }>({ prev: 0, next: 0 });
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }
  const nativeLanguage = student.nativeLanguage;

  function startGame() {
    if (!student) return;
    startXpRef.current = student.xp;
    const pool = filterByDifficulty(words, student.proficiencyTier ?? "normal");
    setRoundWords(shuffle(pool).slice(0, TOTAL_ROUNDS));
    setRound(0);
    setScore(0);
    setSessionXp(0);
    setBombKey((k) => k + 1);
    setInput("");
    setResult("falling");
    setPhase("playing");
  }

  function nextRound(currentRound: number) {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }
    setTimeout(() => {
      setRound(currentRound + 1);
      setBombKey((k) => k + 1);
      setInput("");
      setResult("falling");
    }, 700);
  }

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

  function handleInputChange(value: string) {
    setInput(value);
    if (result !== "falling" || !student) return;
    const word = roundWords[round];
    if (isWordCorrect(value, word.ko)) {
      playCorrectSound();
      setResult("cleared");
      setScore((s) => s + 1);
      setSessionXp((x) => x + XP_REWARD.bombGame);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.bombGame);
      nextRound(round);
    }
  }

  function handleMiss() {
    if (result !== "falling" || !student) return;
    const word = roundWords[round];
    playWrongSound();
    setResult("missed");
    pendingWriteRef.current = recordWrongWord(student.id, word.id);
    nextRound(round);
  }

  if (phase === "select") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <Link href="/game" className="self-start text-sm text-ink/40">
          ← 돌아가기
        </Link>
        <div className="text-6xl">💣</div>
        <h1 className="font-display text-2xl">단어 폭탄 게임</h1>
        <p className="text-sm text-ink/50"><NativeText text={t("bombWatchHint", nativeLanguage)} lang={nativeLanguage} /></p>
        <div className="flex flex-col gap-3 w-full">
          <p className="font-display text-lg">속도 난이도</p>
          {[1, 3, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s as 1 | 3 | 5)}
              className={`rounded-2xl border-2 px-4 py-3 font-bold ${
                stars === s ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
              }`}
            >
              {"⭐".repeat(s)} {s === 1 ? "느림" : s === 3 ? "보통" : "빠름"}
            </button>
          ))}
        </div>
        <Button onClick={startGame} variant="pink">
          게임 시작
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">🎯</div>
        <h1 className="font-display text-2xl">게임 종료!</h1>
        <p className="text-lg">{score} / {TOTAL_ROUNDS} 개 막았어요</p>
        {leveledUp && <p className="font-display text-xl text-duo-yellow-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{score * XP_REWARD.bombGame} XP</p>
        <p className="text-lg font-bold text-duo-yellow-dark">+{score * XP_REWARD.bombGame} 포인트 💰</p>
        <Button onClick={() => setPhase("select")} disabled={saving}>
          다시 하기
        </Button>
        <Link href="/game" className="text-sm text-ink/40 underline">
          게임모드로
        </Link>
      </div>
    );
  }

  const word = roundWords[round];
  const duration = SPEED_DURATION[stars];

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between text-sm text-ink/50">
        <span>라운드 {round + 1}/{TOTAL_ROUNDS}</span>
        <span>점수 {score}</span>
      </div>
      <ProgressBar value={(round / TOTAL_ROUNDS) * 100} colorClass="bg-duo-pink" />

      <div className="relative h-80 overflow-hidden rounded-3xl border-2 border-duo-gray bg-gradient-to-b from-indigo-200 to-indigo-400">
        {result === "falling" ? (
          <div
            key={bombKey}
            onAnimationEnd={handleMiss}
            className="bomb-fall absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
            style={{ animationDuration: `${duration}ms` }}
          >
            <div className="text-4xl">💣</div>
            <div className="rounded-xl bg-white/90 px-3 py-1 text-sm font-bold">
              <NativeText text={word.translations[nativeLanguage]} lang={nativeLanguage} />
            </div>
          </div>
        ) : result === "cleared" ? (
          <div className="absolute inset-0 flex items-center justify-center screen-flash">
            <div className="relative text-center">
              <div className="explode-pop text-8xl">💥</div>
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-3 text-4xl">
                <span className="clap-float" style={{ animationDelay: "0ms" }}>👏</span>
                <span className="clap-float" style={{ animationDelay: "120ms" }}>🎉</span>
                <span className="clap-float" style={{ animationDelay: "60ms" }}>👏</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="shake-miss text-center">
              <div className="text-6xl">😵</div>
              <p className="mt-1 font-bold text-white">정답: {word.ko}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border-2 border-duo-gray bg-white p-2">
        <span className="text-2xl">🚀</span>
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={result !== "falling"}
          autoFocus
          placeholder="한국어 단어 입력..."
          className="flex-1 bg-transparent px-2 py-2 font-display text-lg outline-none disabled:opacity-50"
        />
        <MicButton onResult={handleInputChange} disabled={result !== "falling"} />
      </div>

      <Link href="/game" className="text-center text-sm text-ink/40">
        그만하기
      </Link>
    </div>
  );
}
