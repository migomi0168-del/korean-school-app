"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { getUnit } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function UnitDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = use(params);
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const unit = getUnit(unitId);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }
  if (!unit) {
    router.push("/home");
    return null;
  }

  const progress = student.progress[unitId];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>

      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="text-6xl">{unit.emoji}</div>
        <h1 className="font-display text-2xl">{unit.name}</h1>
      </div>

      <div className="flex flex-col gap-3">
        <ActivityRow
          emoji="📖"
          label="단어 학습"
          done={progress?.wordsDone}
          href={`/learn/words/${unit.id}`}
        />
        <ActivityRow
          emoji="💬"
          label="문장 학습"
          done={progress?.sentencesDone}
          href={`/learn/sentences/${unit.id}`}
        />
        <ActivityRow
          emoji="✏️"
          label="퀴즈"
          done={progress?.quizDone}
          href={`/quiz/${unit.id}`}
          score={progress?.quizScore}
        />
      </div>
    </div>
  );
}

function ActivityRow({
  emoji,
  label,
  done,
  href,
  score,
}: {
  emoji: string;
  label: string;
  done?: boolean;
  href: string;
  score?: number;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-4">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1">
          <p className="font-display text-lg">{label}</p>
          {done && (
            <p className="text-xs text-duo-green-dark">
              완료 {typeof score === "number" ? `· ${score}점` : "✓"}
            </p>
          )}
        </div>
        <div className="text-2xl">{done ? "✅" : "▶️"}</div>
      </Card>
    </Link>
  );
}
