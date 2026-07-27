"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { MicButton } from "@/components/learn/MicButton";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { SectionScene } from "@/components/game/SectionScene";
import { getSection, getPhrasesForSection } from "@/lib/content";
import { isPhraseCorrectSmart } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent, recordWrongPhrase } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";
import { t } from "@/lib/i18n";

export default function EscapeSectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = use(params);
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const section = getSection(sectionId);
  const doors = getPhrasesForSection(sectionId);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [grading, setGrading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [escaped, setEscaped] = useState<{ xp: number; leveledUp: boolean; prevLevel: number; newLevel: number } | null>(null);
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
  if (!section || doors.length === 0) {
    router.push("/game/escape");
    return null;
  }

  const door = doors[index];
  const isLast = index === doors.length - 1;
  const nativeLanguage = student.nativeLanguage;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted || grading || !student) return;
    setGrading(true);
    const ok = await isPhraseCorrectSmart(input, door);
    setGrading(false);
    setCorrect(ok);
    setSubmitted(true);
    // Recorded immediately (not batched until the room is fully cleared) so
    // quitting partway through still keeps whatever was already missed.
    if (!ok) pendingWriteRef.current = recordWrongPhrase(student.id, door.id);
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
    await pendingWriteRef.current;
    const prevLevel = levelFromXp(student.xp);
    const gainedXp = XP_REWARD.escapeSection;
    const newXp = student.xp + gainedXp;
    const newLevel = levelFromXp(newXp);
    const clearedSet = Array.from(new Set([...student.escapeCleared, sectionId]));
    await updateStudent(student.id, { xp: newXp, points: student.points + gainedXp, escapeCleared: clearedSet });
    setSaving(false);
    setEscaped({ xp: gainedXp, leveledUp: newLevel > prevLevel, prevLevel, newLevel });
  }

  if (escaped) {
    return (
      <div className="screen-flash flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="relative">
          <div className="explode-pop text-8xl">🗝️</div>
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-4 text-4xl">
            <span className="clap-float" style={{ animationDelay: "0ms" }}>🎉</span>
            <span className="clap-float" style={{ animationDelay: "100ms" }}>👏</span>
            <span className="clap-float" style={{ animationDelay: "200ms" }}>🎊</span>
          </div>
        </div>
        <h1 className="font-display text-2xl text-duo-green-dark">탈출 성공!</h1>
        {escaped.leveledUp && <p className="font-display text-xl text-duo-yellow-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{escaped.xp} XP</p>
        <p className="text-lg font-bold text-duo-yellow-dark">+{escaped.xp} 포인트 💰</p>
        <Button onClick={() => router.push("/game/escape")}>다른 장소로</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/game/escape" className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <SectionScene background={section.background} emoji={section.emoji} />
      <p className="text-center text-sm text-ink/50">
        🚪 문 {index + 1} / {doors.length}
      </p>
      <ProgressBar value={((index + 1) / doors.length) * 100} colorClass="bg-duo-pink" />

      <Card className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="text-4xl">{door.emoji}</div>
        <p className="text-xl font-bold text-duo-blue-dark">{door.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">{t("typeDoorHint", nativeLanguage)}</p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted || grading}
            autoFocus
            placeholder="한국어로 입력하거나 마이크를 누르세요"
            className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-pink disabled:opacity-60"
          />
          <MicButton onResult={setInput} disabled={submitted || grading} />
        </div>
        {!submitted && (
          <Button type="submit" variant="pink" disabled={!input.trim() || grading}>
            {grading ? "채점 중..." : "문 열기"}
          </Button>
        )}
      </form>

      {submitted && (
        <div className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${correct ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10 shake-miss"}`}>
          {correct && (
            <div className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center gap-3 text-2xl">
              <span className="clap-float" style={{ animationDelay: "0ms" }}>👏</span>
              <span className="clap-float" style={{ animationDelay: "100ms" }}>👏</span>
            </div>
          )}
          <p className={`font-display text-xl ${correct ? "text-duo-green-dark" : "text-duo-red"}`}>
            {correct ? "문이 열렸어요! 🔓" : "다시 도전해봐요"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink/60">정답: <span className="font-bold text-ink">{door.ko}</span></p>
            <TTSButton text={door.ko} size="sm" />
          </div>
        </div>
      )}

      {submitted && (
        <Button onClick={handleNext} disabled={saving} variant={correct ? "green" : "gray"}>
          {saving ? "저장 중..." : isLast ? "탈출하기" : "다음 문"}
        </Button>
      )}
    </div>
  );
}
