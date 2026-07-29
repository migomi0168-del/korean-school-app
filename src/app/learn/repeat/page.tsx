"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { MicButton } from "@/components/learn/MicButton";
import { useTTS } from "@/hooks/useTTS";
import { getSurvivalPhrases } from "@/lib/survival";
import { isPhraseCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { addXp } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { playCorrectSound } from "@/lib/sfx";
import { NativeText } from "@/components/common/NativeText";

type Phase = "listen" | "revealed";

export default function SurvivalRepeatPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const { speak } = useTTS();

  const phrasesRef = useRef(getSurvivalPhrases());
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("listen");
  const [wasCorrect, setWasCorrect] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const startXpRef = useRef<number | null>(null);
  const pendingWriteRef = useRef<Promise<unknown>>(Promise.resolve());

  const phrases = phrasesRef.current;
  const q = phrases[index];
  const isLast = index === phrases.length - 1;

  if (student && startXpRef.current === null) startXpRef.current = student.xp;

  useEffect(() => {
    if (q) speak(q.ko);
    // Auto-play the target phrase whenever a new one appears, so the student
    // hears it before doing anything else — this mode is audio-first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "listen" || !student) return;
    const ok = input.trim() ? isPhraseCorrect(input, q) : false;
    setWasCorrect(ok);
    setPhase("revealed");
    if (ok) {
      playCorrectSound();
      setSessionXp((x) => x + XP_REWARD.survivalPhrase);
      pendingWriteRef.current = addXp(student.id, XP_REWARD.survivalPhrase);
    }
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setInput("");
      setPhase("listen");
      return;
    }
    setSaving(true);
    await pendingWriteRef.current;
    const prevLevel = levelFromXp(startXpRef.current ?? 0);
    const newLevel = levelFromXp((startXpRef.current ?? 0) + sessionXp);
    router.push(`/result?xp=${sessionXp}&next=${encodeURIComponent("/learn")}&leveledUp=${newLevel > prevLevel ? 1 : 0}&prevLevel=${prevLevel}&newLevel=${newLevel}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/learn" className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <p className="text-center text-xs font-bold text-duo-green-dark">🆘 생존 표현 · 듣고 따라 말하기</p>
      <ProgressBar value={((index + 1) / phrases.length) * 100} colorClass="bg-duo-green" />

      <Card className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="text-6xl">{q.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark">
          <NativeText text={q.translations[nativeLanguage]} lang={nativeLanguage} />
        </p>
        <div className="flex items-center gap-2">
          <TTSButton text={q.ko} />
          <p className="text-xs text-ink/40">먼저 들어보고 따라 말해보세요</p>
        </div>
      </Card>

      {phase === "listen" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="마이크를 누르고 따라 말해보세요"
              className="min-w-0 flex-1 rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-green"
            />
            <MicButton onResult={setInput} />
          </div>
          <Button type="submit" variant="green" disabled={!input.trim()}>
            확인
          </Button>
        </form>
      )}

      {phase === "revealed" && (
        <>
          <div
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${
              wasCorrect ? "border-duo-green bg-duo-green/10" : "border-duo-yellow bg-duo-yellow/10"
            }`}
          >
            <p className={`font-display text-lg ${wasCorrect ? "text-duo-green-dark" : "text-duo-yellow-dark"}`}>
              {wasCorrect ? "정확해요! 🎉" : "이렇게 말해요!"}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-ink">{q.ko}</p>
              <TTSButton text={q.ko} size="sm" />
            </div>
          </div>
          <Button onClick={handleNext} disabled={saving} variant={wasCorrect ? "green" : "gray"}>
            {saving ? "저장 중..." : isLast ? "결과 보기" : "다음"}
          </Button>
        </>
      )}
    </div>
  );
}
