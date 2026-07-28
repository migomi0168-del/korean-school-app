"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { ContextTag } from "@/components/learn/ContextTag";
import { MicButton } from "@/components/learn/MicButton";
import { sections, phrases, getPhrasesForSection, getSection } from "@/lib/content";
import {
  gradePhrase,
  gradePhraseFormal,
  isPhraseCorrect,
  isFormalKorean,
  getFormalForm,
  similarity,
} from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongPhrase, clearWrongPhrase, recordFormalMistake, completeTeacherAssignment } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { filterByDifficulty } from "@/lib/difficulty";
import { getNativeLabel } from "@/lib/labelTranslations";
import { NativeText } from "@/components/common/NativeText";
import type { Difficulty, Phrase } from "@/types";

const QUESTION_COUNT = 6;
type Phase = "answering" | "close" | "correct" | "wrong";
type Partner = "선생님" | "또래 친구";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(situationId: string, tier: Difficulty): Phrase[] {
  const basePool = situationId === "all" ? phrases : getPhrasesForSection(situationId);
  const pool = filterByDifficulty(basePool, tier, situationId === "all" ? 4 : 2);
  const count = Math.min(QUESTION_COUNT, pool.length);
  return shuffle(pool).slice(0, count);
}

function CustomLearnContent() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/learn";
  const auto = searchParams.get("auto") === "formal";

  const [situation, setSituation] = useState<string | null>(auto ? "all" : null);
  const [partner, setPartner] = useState<Partner | null>(auto ? "선생님" : null);
  const [started, setStarted] = useState(auto);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [retryInput, setRetryInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());
  const poolRef = useRef<Phrase[] | null>(null);

  if (student && startXpRef.current === null) startXpRef.current = student.xp;
  if (student && auto && poolRef.current === null) {
    poolRef.current = buildPool("all", student.proficiencyTier ?? "normal");
  }

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }

  const isFormalMode = partner === "선생님";

  function handleStart() {
    if (!situation || !partner || !student) return;
    poolRef.current = buildPool(situation, student.proficiencyTier ?? "normal");
    setStarted(true);
  }

  if (!started || !poolRef.current) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Link href={next} className="text-sm text-ink/40">
          ← 돌아가기
        </Link>
        <h1 className="text-center font-display text-2xl">🧭 자기 설계 학습</h1>
        <p className="text-center text-xs text-ink/40">배우고 싶은 상황과 대화 상대를 직접 골라보세요.</p>

        <Card>
          <p className="mb-3 font-display text-lg">어떤 상황을 배울까요?</p>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSituation(s.id)}
                className={`rounded-2xl border-2 px-3 py-3 text-sm font-bold ${
                  situation === s.id ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
                }`}
              >
                {s.emoji} {s.name}
                {getNativeLabel(s.name, student.nativeLanguage) && (
                  <span className="block text-xs font-normal text-ink/40">
                    <NativeText text={getNativeLabel(s.name, student.nativeLanguage) ?? ""} lang={student.nativeLanguage} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-display text-lg">대화 상대는 누구인가요?</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPartner("선생님")}
              className={`rounded-2xl border-2 px-4 py-3 text-left font-bold ${
                partner === "선생님" ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
              }`}
            >
              🧑‍🏫 선생님 (존댓말 연습)
              {getNativeLabel("선생님", student.nativeLanguage) && (
                <span className="block text-xs font-normal text-ink/40">
                  <NativeText text={getNativeLabel("선생님", student.nativeLanguage) ?? ""} lang={student.nativeLanguage} />
                </span>
              )}
            </button>
            <button
              onClick={() => setPartner("또래 친구")}
              className={`rounded-2xl border-2 px-4 py-3 text-left font-bold ${
                partner === "또래 친구" ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
              }`}
            >
              🧒 또래 친구
              {getNativeLabel("또래 친구", student.nativeLanguage) && (
                <span className="block text-xs font-normal text-ink/40">
                  <NativeText text={getNativeLabel("또래 친구", student.nativeLanguage) ?? ""} lang={student.nativeLanguage} />
                </span>
              )}
            </button>
          </div>
          {partner === "선생님" && (
            <p className="mt-3 text-xs text-ink/40">선생님께는 존댓말(~요, ~습니다)로 답해야 정답으로 인정돼요!</p>
          )}
        </Card>

        <Button onClick={handleStart} disabled={!situation || !partner} variant="pink">
          학습 시작하기
        </Button>
      </div>
    );
  }

  const pool = poolRef.current;
  const q = pool[index];
  const isLast = index === pool.length - 1;
  const nativeLanguage = student.nativeLanguage;
  const retryTarget = isFormalMode ? getFormalForm(q) : q.ko;

  function grantCredit() {
    if (!student) return;
    playCorrectSound();
    setPhase("correct");
    setSessionXp((x) => x + XP_REWARD.phraseCorrect);
    pendingWriteRef.current = Promise.all([
      addXp(student.id, XP_REWARD.phraseCorrect),
      clearWrongPhrase(student.id, q.id),
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "answering" || grading || !student) return;
    setGrading(true);
    const verdict = await (isFormalMode ? gradePhraseFormal(input, q) : gradePhrase(input, q));
    setGrading(false);
    if (verdict === "correct") {
      grantCredit();
    } else if (verdict === "close") {
      setPhase("close");
      setRetryInput("");
      // Same as learn/sentence: record on "close" too so an abandoned retry
      // still surfaces in 복습모드 instead of silently vanishing.
      pendingWriteRef.current = recordWrongPhrase(student.id, q.id);
    } else {
      playWrongSound();
      setPhase("wrong");
      // A formal-mode miss where the meaning was actually right but the
      // student answered casually is tracked separately — it's a politeness
      // gap, not a vocabulary/comprehension mistake.
      const isFormalGap = isFormalMode && !isFormalKorean(input) && isPhraseCorrect(input, q);
      pendingWriteRef.current = Promise.all([
        recordWrongPhrase(student.id, q.id),
        ...(isFormalGap ? [recordFormalMistake(student.id)] : []),
      ]);
    }
  }

  function handleRetry(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "close") return;
    const ok = isFormalMode
      ? isFormalKorean(retryInput) && similarity(retryInput, retryTarget) >= 0.75
      : isPhraseCorrect(retryInput, q);
    if (ok) {
      grantCredit();
    } else {
      setRetryInput("");
    }
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setInput("");
      setPhase("answering");
      return;
    }
    setSaving(true);
    await pendingWriteRef.current;
    if (searchParams.get("fromAssignment") === "1" && student) {
      await completeTeacherAssignment(student.id);
    }
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    router.push(`/result?xp=${sessionXp}&next=${encodeURIComponent(next)}&leveledUp=${newLevel > prevLevel ? 1 : 0}&prevLevel=${prevLevel}&newLevel=${newLevel}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href={next} className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <p className="text-center text-xs font-bold text-duo-pink-dark">
        🧭 {getSection(situation ?? "")?.name ?? "다양한 상황"} · {partner}
        {isFormalMode && " (존댓말 연습)"}
      </p>
      <ProgressBar value={((index + 1) / pool.length) * 100} colorClass="bg-duo-pink" />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <ContextTag categoryId={q.section} />
        <div className="text-5xl">{q.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark"><NativeText text={q.translations[nativeLanguage]} lang={nativeLanguage} /></p>
        <p className="text-xs text-ink/40">
          {isFormalMode ? "선생님께 존댓말로 말해보세요" : "한국어 문장으로 입력하거나 마이크를 누르세요"}
        </p>
      </Card>

      {phase === "answering" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={grading}
              autoFocus
              placeholder="한국어 문장으로 입력하거나 마이크를 누르세요"
              className="min-w-0 flex-1 rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-pink disabled:opacity-60"
            />
            <MicButton onResult={setInput} disabled={grading} />
          </div>
          <Button type="submit" variant="pink" disabled={!input.trim() || grading}>
            {grading ? "채점 중..." : "확인"}
          </Button>
        </form>
      )}

      {phase === "close" && (
        <>
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-duo-yellow bg-duo-yellow/10 p-4 text-center">
            <p className="font-display text-lg text-duo-yellow-dark">🤔 의미는 통해요! 모범 답안을 보고 따라 써볼까요?</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-ink/60">모범 답안: <span className="font-bold text-ink">{retryTarget}</span></p>
              <TTSButton text={retryTarget} size="sm" />
            </div>
          </div>
          <form onSubmit={handleRetry} className="flex flex-col gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <input
                value={retryInput}
                onChange={(e) => setRetryInput(e.target.value)}
                autoFocus
                placeholder="모범 답안을 그대로 따라 써보세요"
                className="min-w-0 flex-1 rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-yellow"
              />
              <MicButton onResult={setRetryInput} />
            </div>
            <Button type="submit" variant="yellow" disabled={!retryInput.trim()}>
              확인
            </Button>
          </form>
        </>
      )}

      {(phase === "correct" || phase === "wrong") && (
        <div className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${phase === "correct" ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10"}`}>
          <p className={`font-display text-xl ${phase === "correct" ? "text-duo-green-dark" : "text-duo-red"}`}>
            {phase === "correct" ? "정답이에요! 🎉" : isFormalMode ? "선생님께는 존댓말로 말해야 해요!" : "아쉬워요"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink/60">모범 답안: <span className="font-bold text-ink">{retryTarget}</span></p>
            <TTSButton text={retryTarget} size="sm" />
          </div>
        </div>
      )}

      {(phase === "correct" || phase === "wrong") && (
        <Button onClick={handleNext} disabled={saving} variant={phase === "correct" ? "green" : "gray"}>
          {saving ? "저장 중..." : isLast ? "결과 보기" : "다음"}
        </Button>
      )}
    </div>
  );
}

export default function CustomLearnPage() {
  return (
    <Suspense fallback={null}>
      <CustomLearnContent />
    </Suspense>
  );
}
