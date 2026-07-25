"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XPHeader } from "@/components/home/XPHeader";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, todayStr, yesterdayStr } from "@/lib/xp";

const MODES = [
  { href: "/learn", emoji: "📖", label: "학습모드", desc: "단어 · 문장 배우기", color: "bg-duo-blue" },
  { href: "/game", emoji: "🎮", label: "게임모드", desc: "방탈출 · 폭탄 게임", color: "bg-duo-pink" },
  { href: "/review", emoji: "🔁", label: "복습모드", desc: "틀린 것만 다시", color: "bg-duo-yellow" },
  { href: "/chat", emoji: "💬", label: "대화모드", desc: "AI 친구와 대화", color: "bg-duo-green" },
  { href: "/practice", emoji: "🌟", label: "실천모드", desc: "오늘의 실천 미션", color: "bg-duo-pink" },
];

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <XPHeader
          nickname={student.nickname}
          avatar={student.avatar}
          accessoryId={student.equippedAccessory}
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

      <div className="grid flex-1 grid-cols-2 gap-4 p-4">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-duo-gray bg-white p-5 text-center shadow-sm active:scale-95"
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${m.color}`}>
              {m.emoji}
            </div>
            <p className="font-display text-lg">{m.label}</p>
            <p className="text-xs text-ink/50">{m.desc}</p>
          </Link>
        ))}
        <Link
          href="/mypage"
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">👤</div>
          <p className="font-display text-lg">마이페이지</p>
        </Link>
        <Link
          href="/closet"
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">✨</div>
          <p className="font-display text-lg">꾸미기</p>
        </Link>
      </div>
    </div>
  );
}
