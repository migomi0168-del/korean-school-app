"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { phrases } from "@/lib/content";
import { isPhraseCorrectSmart } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp, recordWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
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

export default function SentenceLearnPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const [questions] = useState<Phrase[]>(() => shuffle(phrases).slice(0, QUESTION_COUNT));
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
    router.push(`/result?xp=${sessionXp}&next=${encodeURIComponent("/learn")}&leveledUp=${newLevel > prevLevel ? 1 : 0}&prevLevel=${prevLevel}&newLevel=${newLevel}`);
  }

  const nativeLanguage = student.nativeLanguage;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/learn" className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <ProgressBar value={((index + 1) / questions.length) * 100} colorClass="bg-duo-pink" />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-xl font-bold text-duo-blue-dark">{q.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">이 문장을 한국어로 입력하세요</p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted || grading}
          autoFocus
          placeholder="한국어 문장으로 입력..."
          className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-pink disabled:opacity-60"
        />
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
