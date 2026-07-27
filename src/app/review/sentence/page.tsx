"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { ContextTag } from "@/components/learn/ContextTag";
import { MicButton } from "@/components/learn/MicButton";
import { getPhrase } from "@/lib/content";
import { gradePhrase, isPhraseCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, clearWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { t } from "@/lib/i18n";
import type { Phrase } from "@/types";

type Phase = "answering" | "close" | "correct" | "wrong";

export default function ReviewSentencePage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const questions = useMemo(() => {
    if (!student) return [];
    return student.wrongPhraseIds.map(getPhrase).filter((p): p is Phrase => p !== null);
  }, [student]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [retryInput, setRetryInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [phase, setPhase] = useState<Phase>("answering");
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  if (student && startXpRef.current === null) startXpRef.current = student.xp;

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (questions.length === 0) {
    router.push("/review");
    return null;
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const nativeLanguage = student.nativeLanguage!;

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
    const verdict = await gradePhrase(input, q);
    setGrading(false);
    if (verdict === "correct") {
      grantCredit();
    } else if (verdict === "close") {
      setPhase("close");
      setRetryInput("");
    } else {
      playWrongSound();
      setPhase("wrong");
    }
  }

  function handleRetry(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "close") return;
    if (isPhraseCorrect(retryInput, q)) {
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
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    router.push(`/result?xp=${sessionXp}&next=${encodeURIComponent("/review")}&leveledUp=${newLevel > prevLevel ? 1 : 0}&prevLevel=${prevLevel}&newLevel=${newLevel}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/review" className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <ProgressBar value={((index + 1) / questions.length) * 100} colorClass="bg-duo-yellow" />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <ContextTag categoryId={q.section} />
        <div className="text-5xl">{q.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark">{q.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">{t("typeSentenceHint", nativeLanguage)}</p>
      </Card>

      {phase === "answering" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={grading}
              autoFocus
              placeholder="한국어 문장으로 입력하거나 마이크를 누르세요"
              className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-yellow disabled:opacity-60"
            />
            <MicButton onResult={setInput} disabled={grading} />
          </div>
          <Button type="submit" variant="yellow" disabled={!input.trim() || grading}>
            {grading ? "채점 중..." : "확인"}
          </Button>
        </form>
      )}

      {phase === "close" && (
        <>
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-duo-yellow bg-duo-yellow/10 p-4 text-center">
            <p className="font-display text-lg text-duo-yellow-dark">🤔 의미는 통해요! 모범 답안을 보고 따라 써볼까요?</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-ink/60">모범 답안: <span className="font-bold text-ink">{q.ko}</span></p>
              <TTSButton text={q.ko} size="sm" />
            </div>
          </div>
          <form onSubmit={handleRetry} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                value={retryInput}
                onChange={(e) => setRetryInput(e.target.value)}
                autoFocus
                placeholder="모범 답안을 그대로 따라 써보세요"
                className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-yellow"
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
            {phase === "correct" ? "정답이에요! 오답노트에서 사라져요 🎉" : "아쉬워요"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink/60">모범 답안: <span className="font-bold text-ink">{q.ko}</span></p>
            <TTSButton text={q.ko} size="sm" />
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
