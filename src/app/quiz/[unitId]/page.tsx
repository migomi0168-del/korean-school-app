"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ChoiceButton } from "@/components/quiz/ChoiceButton";
import { TTSButton } from "@/components/learn/TTSButton";
import { getUnit } from "@/lib/content";
import { buildQuizQuestion, type BuiltQuizQuestion } from "@/lib/quiz";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, levelFromXp } from "@/lib/xp";

export default function QuizPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = use(params);
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const unit = getUnit(unitId);
  const nativeLanguage = student?.nativeLanguage;

  const questions: BuiltQuizQuestion[] = useMemo(() => {
    if (!unit || !nativeLanguage) return [];
    return unit.quiz
      .map((q) => buildQuizQuestion(q, nativeLanguage))
      .filter((q): q is BuiltQuizQuestion => q !== null);
  }, [unit, nativeLanguage]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!unit || questions.length === 0) {
    router.push("/home");
    return null;
  }

  const isLast = index === questions.length - 1;
  const q = questions[index];

  function handleSelect(choice: string) {
    if (selected) return;
    setSelected(choice);
    if (choice === q.answer) setCorrectCount((c) => c + 1);
  }

  async function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    if (!student) return;
    setSaving(true);
    const score = Math.round((correctCount / questions.length) * 100);
    const prevLevel = levelFromXp(student.xp);
    const newXp = student.xp + XP_REWARD.quiz;
    const newLevel = levelFromXp(newXp);
    await updateStudent(student.id, {
      xp: newXp,
      progress: {
        ...student.progress,
        [unitId]: {
          ...student.progress[unitId],
          quizDone: true,
          quizScore: score,
          wordsDone: student.progress[unitId]?.wordsDone ?? false,
          sentencesDone: student.progress[unitId]?.sentencesDone ?? false,
        },
      },
    });
    await refresh();
    router.push(
      `/result?xp=${XP_REWARD.quiz}&next=${encodeURIComponent(`/unit/${unitId}`)}&leveledUp=${newLevel > prevLevel ? 1 : 0}&score=${score}`
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href={`/unit/${unitId}`} className="text-sm text-ink/40">
        ← 그만하기
      </Link>
      <ProgressBar value={((index + 1) / questions.length) * 100} colorClass="bg-duo-yellow" />

      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        {q.promptEmoji && <div className="text-5xl">{q.promptEmoji}</div>}
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl">{q.promptKo}</h2>
          <TTSButton text={q.promptKo} size="sm" />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {q.choices.map((choice) => {
          let status: "idle" | "correct" | "wrong" | "faded" = "idle";
          if (selected) {
            if (choice === q.answer) status = "correct";
            else if (choice === selected) status = "wrong";
            else status = "faded";
          }
          return <ChoiceButton key={choice} label={choice} status={status} onClick={() => handleSelect(choice)} />;
        })}
      </div>

      {selected && (
        <Button onClick={handleNext} disabled={saving} variant="yellow">
          {isLast ? (saving ? "저장 중..." : "결과 보기") : "다음"}
        </Button>
      )}
    </div>
  );
}
