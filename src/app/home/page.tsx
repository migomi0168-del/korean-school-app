"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XPHeader } from "@/components/home/XPHeader";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent, acknowledgeTeacherMessage, markPeerMessagesSeen } from "@/lib/students";
import { XP_REWARD, todayStr, yesterdayStr } from "@/lib/xp";
import { getEncouragementMessage } from "@/lib/encouragement";
import { getRoomColor, getRoomBackgroundStyle } from "@/lib/roomColors";
import { getOwnedFurniture } from "@/lib/furniture";

const MODES = [
  { href: "/learn", emoji: "📖", label: "학습모드", desc: "단어 · 문장 배우기", color: "bg-duo-blue" },
  { href: "/game", emoji: "🎮", label: "게임모드", desc: "방탈출 · 폭탄 게임", color: "bg-duo-pink" },
  { href: "/review", emoji: "🔁", label: "복습모드", desc: "틀린 것만 다시", color: "bg-duo-yellow" },
  { href: "/chat", emoji: "💬", label: "대화모드", desc: "AI 친구와 대화", color: "bg-duo-green" },
  { href: "/practice", emoji: "🌟", label: "실천모드", desc: "오늘의 실천 미션", color: "bg-duo-pink" },
];

export default function HomePage() {
  const { student, loading, refresh, logout, isDemo } = useStudentSession();
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
      points: student.points + XP_REWARD.attendance,
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

  const room = getRoomColor(student.roomColor);
  const ownedFurniture = getOwnedFurniture(student.ownedFurniture);
  const newPeerMessages = student.peerMessages.filter((m) => m.sentAt > student.lastSeenPeerMessageAt);

  return (
    <div className="flex flex-1 flex-col">
      <div style={getRoomBackgroundStyle(room)} className="rounded-b-3xl">
        <div className="flex items-center justify-between">
          <XPHeader
            nickname={student.nickname}
            avatar={student.avatar}
            accessoryId={student.equippedAccessory}
            xp={student.xp}
            points={student.points}
            streakCount={student.streakCount}
          />
          <button onClick={logout} className="mr-4 text-xs text-ink/40 underline">
            나가기
          </button>
        </div>
        {ownedFurniture.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-3 text-2xl">
            {ownedFurniture.map((f) => (
              <span key={f.id} title={f.name}>
                {f.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {isDemo && (
        <p className="mx-4 mb-2 rounded-xl bg-ink/5 p-2 text-center text-xs font-bold text-ink/50">
          🧪 테스트 모드예요. 이 기기에서만 보이고, 나가면 저장되지 않아요.
        </p>
      )}

      <div className="mx-4 mb-2 flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-duo-green/20 to-duo-blue/20 p-3">
        <p className="text-sm font-bold text-ink/70">{getEncouragementMessage(`${student.id}-${todayStr()}`)}</p>
        <span className="shrink-0 rounded-full bg-duo-yellow px-3 py-1 font-display text-sm text-ink">
          🔥 연속 학습 {student.streakCount}일째!
        </span>
      </div>

      {justCheckedIn && (
        <p className="mx-4 mb-2 rounded-xl bg-duo-yellow/20 p-2 text-center text-sm font-bold text-duo-yellow-dark">
          출석 완료! +{XP_REWARD.attendance} XP 🎉
        </p>
      )}

      {newPeerMessages.length > 0 && (
        <div className="mx-4 mb-2 flex flex-col gap-2 rounded-2xl border-2 border-duo-green bg-duo-green/10 p-3">
          <p className="font-display text-sm text-duo-green-dark">💌 친구들의 응원 메시지</p>
          {newPeerMessages.map((m, i) => (
            <p key={i} className="text-sm text-ink">
              <span className="font-bold">{m.fromNickname}</span>: {m.text}
            </p>
          ))}
          <button
            onClick={() => markPeerMessagesSeen(student.id)}
            className="self-end rounded-xl bg-duo-green px-3 py-1 text-xs font-bold text-white"
          >
            확인했어요
          </button>
        </div>
      )}

      {student.teacherMessage && !student.teacherMessage.read && (
        <div className="mx-4 mb-2 flex flex-col gap-2 rounded-2xl border-2 border-duo-pink bg-duo-pink/10 p-3">
          <p className="font-display text-sm text-duo-pink-dark">💌 선생님의 메세지 도착!</p>
          <p className="text-sm text-ink">{student.teacherMessage.text}</p>
          {student.teacherMessage.points > 0 && (
            <p className="font-display text-sm text-duo-yellow-dark">🎁 보너스 포인트 +{student.teacherMessage.points}P 받았어요!</p>
          )}
          <button
            onClick={() => acknowledgeTeacherMessage(student.id)}
            className="self-end rounded-xl bg-duo-pink px-3 py-1 text-xs font-bold text-white"
          >
            확인했어요
          </button>
        </div>
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
          href="/shop"
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">🛍️</div>
          <p className="font-display text-lg">꾸미기 상점</p>
        </Link>
        <Link
          href="/closet"
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">✨</div>
          <p className="font-display text-lg">꾸미기</p>
        </Link>
        <Link
          href="/mypage"
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">👤</div>
          <p className="font-display text-lg">마이페이지</p>
        </Link>
        <Link
          href="/classmates"
          className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-duo-gray p-5 text-center text-ink/40"
        >
          <div className="text-3xl">👥</div>
          <p className="font-display text-lg">반 친구들</p>
        </Link>
      </div>
    </div>
  );
}
