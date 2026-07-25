"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { sections } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { levelFromXp, todayStr } from "@/lib/xp";

export default function MyPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const level = levelFromXp(student.xp);
  const practiceDoneToday = student.practiceDate === todayStr();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <h1 className="font-display text-2xl">{student.nickname}</h1>
        <p className="text-sm text-ink/50">Lv.{level} · {student.xp} XP</p>
        <Link href="/closet" className="text-xs font-bold text-duo-blue-dark underline">
          ✨ 아이템 꾸미기
        </Link>
      </div>

      <Card className="flex justify-around text-center">
        <div>
          <p className="text-2xl">🔥</p>
          <p className="font-display text-xl">{student.streakCount}</p>
          <p className="text-xs text-ink/50">연속 출석</p>
        </div>
        <div>
          <p className="text-2xl">🚪</p>
          <p className="font-display text-xl">{student.escapeCleared.length}/{sections.length}</p>
          <p className="text-xs text-ink/50">방탈출 클리어</p>
        </div>
        <div>
          <p className="text-2xl">🌟</p>
          <p className="font-display text-xl">{practiceDoneToday ? "완료" : "-"}</p>
          <p className="text-xs text-ink/50">오늘 실천</p>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">오답노트</p>
        <div className="flex justify-around text-center">
          <div>
            <p className="font-display text-2xl text-duo-red">{student.wrongWordIds.length}</p>
            <p className="text-xs text-ink/50">틀린 단어</p>
          </div>
          <div>
            <p className="font-display text-2xl text-duo-red">{student.wrongPhraseIds.length}</p>
            <p className="text-xs text-ink/50">틀린 문장</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">방탈출 진행</p>
        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span>{s.emoji} {s.name}</span>
              <span>{student.escapeCleared.includes(s.id) ? "✅ 클리어" : "🔒 미완료"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
