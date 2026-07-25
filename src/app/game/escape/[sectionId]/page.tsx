"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TTSButton } from "@/components/learn/TTSButton";
import { SectionScene } from "@/components/game/SectionScene";
import { getSection, getPhrasesForSection } from "@/lib/content";
import { isSentenceCorrect } from "@/lib/grading";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";

export default function EscapeSectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = use(params);
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();

  const section = getSection(sectionId);
  const doors = getPhrasesForSection(sectionId);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [escaped, setEscaped] = useState<{ xp: number; leveledUp: boolean } | null>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    const ok = isSentenceCorrect(input, door.ko);
    setCorrect(ok);
    setSubmitted(true);
    if (!ok) setWrongIds((prev) => [...prev, door.id]);
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
    const gainedXp = XP_REWARD.escapeSection;
    const newXp = student.xp + gainedXp;
    const newLevel = levelFromXp(newXp);
    const mergedWrong = Array.from(new Set([...student.wrongPhraseIds, ...wrongIds]));
    const clearedSet = Array.from(new Set([...student.escapeCleared, sectionId]));
    await updateStudent(student.id, { xp: newXp, wrongPhraseIds: mergedWrong, escapeCleared: clearedSet });
    await refresh();
    setSaving(false);
    setEscaped({ xp: gainedXp, leveledUp: newLevel > prevLevel });
  }

  if (escaped) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">🗝️</div>
        <h1 className="font-display text-2xl text-duo-green-dark">탈출 성공!</h1>
        {escaped.leveledUp && <p className="font-display text-xl text-duo-yellow-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{escaped.xp} XP</p>
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
        <p className="text-xl font-bold text-duo-blue-dark">{door.translations[nativeLanguage]}</p>
        <p className="text-xs text-ink/40">이 표현을 한국어로 입력해서 문을 여세요</p>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          autoFocus
          placeholder="한국어로 입력..."
          className="w-full rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-pink disabled:opacity-60"
        />
        {!submitted && (
          <Button type="submit" variant="pink" disabled={!input.trim()}>
            문 열기
          </Button>
        )}
      </form>

      {submitted && (
        <div className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${correct ? "border-duo-green bg-duo-green/10" : "border-duo-red bg-duo-red/10"}`}>
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
