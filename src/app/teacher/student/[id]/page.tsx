"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { subscribeToStudent } from "@/lib/students";
import { getWord, getPhrase, sections } from "@/lib/content";
import { levelFromXp, todayStr } from "@/lib/xp";
import type { NativeLanguage, Student } from "@/types";

const LANG_LABEL: Record<NativeLanguage, string> = { zh: "중국어", en: "영어", vi: "베트남어" };

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useTeacherAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToStudent(id, setStudent);
    return unsubscribe;
  }, [id]);

  if (loading || student === undefined) return null;
  if (!user) {
    router.push("/teacher/login");
    return null;
  }
  if (!student) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-ink/50">학생을 찾을 수 없어요</p>
        <Link href="/teacher/dashboard" className="text-sm text-duo-blue-dark underline">
          대시보드로
        </Link>
      </div>
    );
  }

  const level = levelFromXp(student.xp);
  const attendedToday = student.lastAttendanceDate === todayStr();
  const practiceDoneToday = student.practiceDate === todayStr();
  const wrongWords = student.wrongWordIds.map(getWord).filter((w) => w !== null);
  const wrongPhrases = student.wrongPhraseIds.map(getPhrase).filter((p) => p !== null);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/teacher/dashboard" className="text-sm text-ink/40">
        ← 대시보드로
      </Link>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <h1 className="font-display text-2xl">{student.nickname}</h1>
        <p className="text-sm text-ink/50">
          {student.grade}학년 · {student.nativeLanguage ? LANG_LABEL[student.nativeLanguage] : "언어 미선택"} · PIN {student.pinCode}
        </p>
      </div>

      <Card className="flex justify-around text-center">
        <div>
          <p className="font-display text-xl text-duo-green-dark">Lv.{level}</p>
          <p className="text-xs text-ink/50">{student.xp} XP</p>
        </div>
        <div>
          <p className="text-2xl">🔥</p>
          <p className="font-display text-xl">{student.streakCount}</p>
          <p className="text-xs text-ink/50">연속 출석</p>
        </div>
        <div>
          <p className="text-2xl">{attendedToday ? "🟢" : "⚪"}</p>
          <p className="text-xs text-ink/50">{attendedToday ? "오늘 출석함" : "오늘 미출석"}</p>
        </div>
        <div>
          <p className="text-2xl">{practiceDoneToday ? "🌟" : "⚪"}</p>
          <p className="text-xs text-ink/50">{practiceDoneToday ? "오늘 실천함" : "오늘 미실천"}</p>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">🚪 방탈출 진행</p>
        <div className="flex flex-col gap-2 text-sm">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <span>{s.emoji} {s.name}</span>
              <span>{student.escapeCleared.includes(s.id) ? "✅ 클리어" : "🔒 미완료"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">🔤 자주 틀리는 단어 ({wrongWords.length})</p>
        {wrongWords.length === 0 ? (
          <p className="text-sm text-ink/50">틀린 단어가 없어요</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wrongWords.map((w) => (
              <span key={w.id} className="rounded-full bg-duo-red/10 px-3 py-1 text-sm font-bold text-duo-red">
                {w.emoji} {w.ko}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">✍️ 자주 틀리는 문장 ({wrongPhrases.length})</p>
        {wrongPhrases.length === 0 ? (
          <p className="text-sm text-ink/50">틀린 문장이 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {wrongPhrases.map((p) => (
              <p key={p.id} className="rounded-xl bg-duo-red/10 px-3 py-2 text-sm font-bold text-duo-red">
                {p.ko}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
