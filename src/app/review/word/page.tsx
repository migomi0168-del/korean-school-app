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
import { getWord } from "@/lib/content";
import { isWordCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, clearWrongWord } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound, playWrongSound } from "@/lib/sfx";
import { t } from "@/lib/i18n";
import type { Word } from "@/types";

export default function ReviewWordPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const questions = useMemo(() => {
    if (!student) return [];
    return student.wrongWordIds.map(getWord).filter((w): w is Word => w !== null);
  }, [student]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted || !student) return;
    const ok = isWordCorrect(input, q.ko);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) {
      playCorrectSound();
      setSessionXp((x) => x + XP_REWARD.wordCorrect);
      pendingWriteRef.current = Promise.all([
        addXp(student.id, XP_REWARD.wordCorrect),
        clearWrongWord(student.id, q.id),
      ]);
    } else {
      playWrongSound();
    }
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setInput("");
      setSubmitted(false);
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

      <Card className="flex flex-col items-center gap-4 py-8 text-center">
        <ContextTag categoryId={q.category} />
        <div className="text-6xl">{q.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark">{q.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">{t("typeWordHint", nativeLanguage)}</p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted}
            autoFocus
            placeholder="한국어로 입력하거나 마이크를 누르세요"
            className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-2xl outline-none focus:border-duo-yellow disabled:opacity-60"
          />
          <MicButton onResult={setInput} disabled={submitted} />
        </div>
        {!submitted && (
          <Button type="submit" variant="yellow" disabled={!input.trim()}>
            확인
          </Button>
        )}
      </form>

      {submitted && (
        <div className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center ${correct ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10"}`}>
          {correct ? (
            <p className="font-display text-xl text-duo-green-dark">정답이에요! 이제 오답노트에서 사라져요 🎉</p>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-duo-red">정답: {q.ko}</p>
              <TTSButton text={q.ko} size="sm" />
            </div>
          )}
        </div>
      )}

      {submitted && (
        <Button onClick={handleNext} disabled={saving} variant={correct ? "green" : "gray"}>
          {saving ? "저장 중..." : isLast ? "결과 보기" : "다음"}
        </Button>
      )}
    </div>
  );
}
