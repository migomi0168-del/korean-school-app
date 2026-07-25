"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { units } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { levelFromXp } from "@/lib/xp";

export default function MyPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const level = levelFromXp(student.xp);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} size="lg" />
        <h1 className="font-display text-2xl">{student.nickname}</h1>
        <p className="text-sm text-ink/50">Lv.{level} · {student.xp} XP</p>
      </div>

      <Card className="flex justify-around text-center">
        <div>
          <p className="text-2xl">🔥</p>
          <p className="font-display text-xl">{student.streakCount}</p>
          <p className="text-xs text-ink/50">연속 출석</p>
        </div>
        <div>
          <p className="text-2xl">📚</p>
          <p className="font-display text-xl">
            {units.filter((u) => student.progress[u.id]?.wordsDone && student.progress[u.id]?.sentencesDone && student.progress[u.id]?.quizDone).length}/{units.length}
          </p>
          <p className="text-xs text-ink/50">완료한 구역</p>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">구역별 진도</p>
        <div className="flex flex-col gap-3">
          {units.map((u) => {
            const p = student.progress[u.id];
            const done = [p?.wordsDone, p?.sentencesDone, p?.quizDone].filter(Boolean).length;
            return (
              <div key={u.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{u.emoji} {u.name}</span>
                  <span className="text-ink/50">{done}/3</span>
                </div>
                <ProgressBar value={(done / 3) * 100} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
