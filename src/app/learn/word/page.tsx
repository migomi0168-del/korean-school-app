"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { words } from "@/lib/content";
import { isWordCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import type { Word } from "@/types";

const QUESTION_COUNT = 8;

type Question = { word: Word; kind: "translate" | "blank" };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(): Question[] {
  const pool = shuffle(words).slice(0, Math.min(QUESTION_COUNT, words.length));
  return pool.map((word) => ({ word, kind: Math.random() < 0.5 ? "translate" : "blank" }));
}

export default function WordLearnPage() {
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [questions] = useState<Question[]>(buildQuestions);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const blankDisplay = useMemo(() => {
    if (!q || q.kind !== "blank") return "";
    return q.word.templateKo.replace(q.word.ko, "＿＿＿＿");
  }, [q]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!student.nativeLanguage) {
    router.push("/onboarding");
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    const ok = isWordCorrect(input, q.word.ko);
    setCorrect(ok);
    setSubmitted(true);
    if (ok) setCorrectCount((c) => c + 1);
    else setWrongIds((prev) => [...prev, q.word.id]);
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setInput("");
      setSubmitted(false);
      return;
    }
    if (!student) return;
    setSaving(true);
    const prevLevel = levelFromXp(student.xp);
    const gainedXp = correctCount * XP_REWARD.wordCorrect;
    const newXp = student.xp + gainedXp;
    const newLevel = levelFromXp(newXp);
    const mergedWrong = Array.from(new Set([...student.wrongWordIds, ...wrongIds]));
    await updateStudent(student.id, { xp: newXp, wrongWordIds: mergedWrong });
    await refresh();
    router.push(`/result?xp=${gainedXp}&next=${encodeURIComponent("/learn")}&leveledUp=${newLevel > prevLevel ? 1 : 0}`);
  }

  const nativeLanguage = student.nativeLanguage;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/learn" className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <ProgressBar value={((index + 1) / questions.length) * 100} colorClass="bg-duo-blue" />

      <Card className="flex flex-col items-center gap-4 py-8 text-center">
        {q.kind === "translate" ? (
          <>
            <div className="text-6xl">{q.word.emoji}</div>
            <p className="text-xl font-bold text-duo-blue-dark">{q.word.translations[nativeLanguage]}</p>
            <p className="text-xs text-ink/40">이 단어를 한국어로 입력하세요</p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl leading-relaxed">{blankDisplay}</p>
            <p className="text-lg font-bold text-duo-blue-dark">{q.word.templateTranslations[nativeLanguage]}</p>
            <p className="text-xs text-ink/40">빈칸에 들어갈 단어를 입력하세요</p>
          </>
        )}
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          autoFocus
          placeholder="한국어로 입력..."
          className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-2xl outline-none focus:border-duo-blue disabled:opacity-60"
        />
        {!submitted && (
          <Button type="submit" variant="blue" disabled={!input.trim()}>
            확인
          </Button>
        )}
      </form>

      {submitted && (
        <div className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center ${correct ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10"}`}>
          {correct ? (
            <p className="font-display text-xl text-duo-green-dark">정답이에요! 🎉</p>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-duo-red">정답: {q.word.ko}</p>
              <TTSButton text={q.word.ko} size="sm" />
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
