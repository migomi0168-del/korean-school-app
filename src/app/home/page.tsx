"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XPHeader } from "@/components/home/XPHeader";
import { MapZoneIcon } from "@/components/home/MapZoneIcon";
import { Card } from "@/components/common/Card";
import { units } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, todayStr, yesterdayStr } from "@/lib/xp";

export default function HomePage() {
  const { student, loading, refresh, logout } = useStudentSession();
  const router = useRouter();
  const checkedIn = useRef(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  useEffect(() => {
    if (!student || checkedIn.current) return;
    const today = todayStr();
    if (student.lastAttendanceDate === today) return;
    checkedIn.current = true;
    const newStreak = student.lastAttendanceDate === yesterdayStr() ? student.streakCount + 1 : 1;
    updateStudent(student.id, {
      lastAttendanceDate: today,
      streakCount: newStreak,
      xp: student.xp + XP_REWARD.attendance,
    }).then(() => {
      setJustCheckedIn(true);
      refresh();
    });
  }, [student, refresh]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const anyWordsDone = units.some((u) => student.progress[u.id]?.wordsDone);
  const anySentencesDone = units.some((u) => student.progress[u.id]?.sentencesDone);
  const anyQuizDone = units.some((u) => student.progress[u.id]?.quizDone);
  const firstUnit = units[0].id;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <XPHeader
          nickname={student.nickname}
          avatar={student.avatar}
          xp={student.xp}
          streakCount={student.streakCount}
        />
        <button onClick={logout} className="mr-4 text-xs text-ink/40 underline">
          나가기
        </button>
      </div>

      {justCheckedIn && (
        <p className="mx-4 mb-2 rounded-xl bg-duo-yellow/20 p-2 text-center text-sm font-bold text-duo-yellow-dark">
          출석 완료! +{XP_REWARD.attendance} XP 🎉
        </p>
      )}

      <div className="px-4">
        <Card>
          <p className="mb-2 font-display text-lg">✅ 오늘의 미션</p>
          <ul className="flex flex-col gap-2 text-sm">
            <MissionItem done={anyWordsDone} label="단어 학습하기" href={`/learn/words/${firstUnit}`} />
            <MissionItem done={anySentencesDone} label="문장 학습하기" href={`/learn/sentences/${firstUnit}`} />
            <MissionItem done={anyQuizDone} label="퀴즈 풀기" href={`/quiz/${firstUnit}`} />
          </ul>
        </Card>
      </div>

      <div className="mt-4 flex-1 px-4">
        <p className="mb-3 font-display text-lg">🗺️ 학교 탐험</p>
        <div className="grid grid-cols-2 gap-4">
          {units.map((u) => (
            <MapZoneIcon key={u.id} unit={u} progress={student.progress[u.id]} />
          ))}
        </div>
      </div>

      <Link href="/mypage" className="m-4 text-center text-sm text-ink/50 underline">
        마이페이지 보기
      </Link>
    </div>
  );
}

function MissionItem({ done, label, href }: { done: boolean; label: string; href: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${done ? "bg-duo-green text-white" : "border-2 border-duo-gray"}`}>
          {done ? "✓" : ""}
        </span>
        <span className={done ? "text-ink/40 line-through" : ""}>{label}</span>
      </Link>
    </li>
  );
}
