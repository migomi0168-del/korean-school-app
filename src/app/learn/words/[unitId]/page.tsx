"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { FlashCard } from "@/components/learn/FlashCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getUnit, getWordsForUnit } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";

export default function WordsLearnPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = use(params);
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const unit = getUnit(unitId);
  const wordList = getWordsForUnit(unitId);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!unit || wordList.length === 0) {
    router.push("/home");
    return null;
  }

  const isLast = index === wordList.length - 1;
  const word = wordList[index];

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (!student) return;
    setSaving(true);
    const prevLevel = levelFromXp(student.xp);
    const newXp = student.xp + XP_REWARD.words;
    const newLevel = levelFromXp(newXp);
    await updateStudent(student.id, {
      xp: newXp,
      progress: {
        ...student.progress,
        [unitId]: { ...student.progress[unitId], wordsDone: true, sentencesDone: student.progress[unitId]?.sentencesDone ?? false, quizDone: student.progress[unitId]?.quizDone ?? false, quizScore: student.progress[unitId]?.quizScore ?? 0 },
      },
    });
    await refresh();
    router.push(
      `/result?xp=${XP_REWARD.words}&next=${encodeURIComponent(`/unit/${unitId}`)}&leveledUp=${newLevel > prevLevel ? 1 : 0}`
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href={`/unit/${unitId}`} className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <ProgressBar value={((index + 1) / wordList.length) * 100} colorClass="bg-duo-blue" />
      <div className="flex flex-1 items-center justify-center">
        <FlashCard emoji={word.emoji} ko={word.ko} sub={word.reading} translation={word.translations[student.nativeLanguage]} />
      </div>
      <Button onClick={handleNext} disabled={saving} variant="blue">
        {isLast ? (saving ? "저장 중..." : "완료") : "다음"}
      </Button>
    </div>
  );
}
