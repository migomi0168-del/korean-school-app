"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { NativeText } from "@/components/common/NativeText";
import { phrases, sections, getSection } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { filterByDifficulty } from "@/lib/difficulty";
import type { Phrase, Section } from "@/types";

const TOTAL_ROUNDS = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  phrase: Phrase;
  options: Section[];
}

function buildRounds(pool: Phrase[], count: number): Round[] {
  const targets = shuffle(pool).slice(0, Math.min(count, pool.length));
  return targets.map((phrase) => {
    const correctSection = getSection(phrase.section)!;
    const distractors = shuffle(sections.filter((s) => s.id !== correctSection.id)).slice(0, 3);
    return { phrase, options: shuffle([correctSection, ...distractors]) };
  });
}

type Phase = "playing" | "done";
type Answer = "correct" | "wrong" | null;

export default function SituationSortGamePage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const roundsRef = useRef<Round[] | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  if (student && startXpRef.current === null) startXpRef.current = student.xp;
  if (student && roundsRef.current === null) {
    const pool = filterByDifficulty(phrases, student.proficiencyTier ?? "normal");
    roundsRef.current = buildRounds(pool, TOTAL_ROUNDS);
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

  async function finishGame() {
    setPhase("done");
    setSaving(true);
    await pendingWriteRef.current;
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    setSaving(false);
    setLeveledUp(newLevel > prevLevel);
  }

  // Re-navigating to this same route doesn't remount the component, so
  // roundsRef would otherwise keep the old rounds forever — rebuild the pool
  // and reset every piece of round state explicitly instead.
  function handleRestart() {
    if (!student) return;
    const pool = filterByDifficulty(phrases, student.proficiencyTier ?? "normal");
    roundsRef.current = buildRounds(pool, TOTAL_ROUNDS);
    startXpRef.current = student.xp;
    setIndex(0);
    setAnswer(null);
    setSelectedId(null);
    setScore(0);
    setSessionXp(0);
    setSaving(false);
    setLeveledUp(false);
    setPhase("playing");
  }

  function handleSelect(option: Section) {
    if (answer || !student) return;
    const round = rounds[index];
    const correct = option.id === round.phrase.section;
    setSelectedId(option.id);
    setAnswer(correct ? "correct" : "wrong");
    if (correct) {
      playCorrectSound();
      setScore((s) => s + 1);
      setSessionXp((x) => x + XP_REWARD.situationSort);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.situationSort);
    } else {
      playWrongSound();
      pendingWriteRef.current = recordWrongPhrase(student.id, round.phrase.id);
    }
    setTimeout(() => {
      if (index + 1 >= TOTAL_ROUNDS) {
        finishGame();
        return;
      }
      setIndex((i) => i + 1);
      setAnswer(null);
      setSelectedId(null);
    }, 1000);
  }

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">🗂️</div>
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

  const round = rounds[index];

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

      <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-duo-gray bg-white py-8 text-center">
        <div className="text-6xl">{round.phrase.emoji}</div>
        <p className="text-xl font-bold text-ink">{round.phrase.ko}</p>
        <p className="text-xs text-ink/40">
          <NativeText text={round.phrase.translations[nativeLanguage]} lang={nativeLanguage} />
        </p>
        <p className="mt-2 text-sm font-bold text-duo-blue-dark">이건 어디에서 쓰는 말일까요?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrectOpt = opt.id === round.phrase.section;
          const showCorrect = answer && isCorrectOpt;
          const showWrong = answer && isSelected && !isCorrectOpt;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              disabled={!!answer}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-4 py-5 text-center font-display text-lg transition-colors ${
                showCorrect
                  ? "border-duo-green bg-duo-green/20 text-duo-green-dark"
                  : showWrong
                    ? "border-duo-red bg-duo-red/20 text-duo-red"
                    : "border-duo-gray bg-white"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              {opt.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
