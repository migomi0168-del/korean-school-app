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
import { phrases, getPhrasesForSection } from "@/lib/content";
import { isPhraseCorrectSmart } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { t } from "@/lib/i18n";
import type { Phrase } from "@/types";

const QUESTION_COUNT = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SentenceLearnContent() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const next = searchParams.get("next") ?? "/learn";

  const [questions] = useState<Phrase[]>(() => {
    const pool = category ? getPhrasesForSection(category) : phrases;
    const count = category ? Math.min(5, pool.length) : QUESTION_COUNT;
    return shuffle(pool).slice(0, count);
  });
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  if (student && startXpRef.current === null) startXpRef.current = student.xp;

  const q = questions[index];
  const isLast = index === questions.length - 1;

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted || grading || !student) return;
    setGrading(true);
    const ok = await isPhraseCorrectSmart(input, q);
    setGrading(false);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) {
      setSessionXp((x) => x + XP_REWARD.phraseCorrect);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.phraseCorrect);
    } else {
      pendingWriteRef.current = recordWrongPhrase(student.id, q.id);
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
    router.push(`/result?xp=${sessionXp}&next=${encodeURIComponent(next)}&leveledUp=${newLevel > prevLevel ? 1 : 0}&prevLevel=${prevLevel}&newLevel=${newLevel}`);
  }

  const nativeLanguage = student.nativeLanguage;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href={next} className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      {category && (
        <p className="text-center text-xs font-bold text-duo-pink-dark">🎯 AI 추천 학습 — 약점 집중 연습</p>
      )}
      <ProgressBar value={((index + 1) / questions.length) * 100} colorClass="bg-duo-pink" />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <ContextTag categoryId={q.section} />
        <div className="text-5xl">{q.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark">{q.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">{t("typeSentenceHint", nativeLanguage)}</p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted || grading}
            autoFocus
            placeholder="한국어 문장으로 입력하거나 마이크를 누르세요"
            className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-pink disabled:opacity-60"
          />
          <MicButton onResult={setInput} disabled={submitted || grading} />
        </div>
        {!submitted && (
          <Button type="submit" variant="pink" disabled={!input.trim() || grading}>
            {grading ? "채점 중..." : "확인"}
          </Button>
        )}
      </form>

      {submitted && (
        <div className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${correct ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10"}`}>
          <p className={`font-display text-xl ${correct ? "text-duo-green-dark" : "text-duo-red"}`}>
            {correct ? "정답이에요! 🎉" : "아쉬워요"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink/60">모범 답안: <span className="font-bold text-ink">{q.ko}</span></p>
            <TTSButton text={q.ko} size="sm" />
          </div>
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

export default function SentenceLearnPage() {
  return (
    <Suspense fallback={null}>
      <SentenceLearnContent />
    </Suspense>
  );
}
