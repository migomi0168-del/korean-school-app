"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent, toggleEquippedBadge } from "@/lib/students";
import { avatarAccessories, badgeAccessories, getEquippedBadges } from "@/lib/accessories";
import { getOwnedFurniture } from "@/lib/furniture";
import { getRoomColor, getRoomBackgroundStyle } from "@/lib/roomColors";
import { levelFromXp } from "@/lib/xp";

export default function ClosetPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const level = levelFromXp(student.xp);
  const room = getRoomColor(student.roomColor);
  const ownedFurniture = getOwnedFurniture(student.ownedFurniture);
  const equippedBadges = getEquippedBadges(student.equippedBadges);

  function handleEquip(id: string | null) {
    if (!student) return;
    updateStudent(student.id, { equippedAccessory: id });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/mypage" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🏠 내 방</h1>

      <div
        style={getRoomBackgroundStyle(room)}
        className="relative flex min-h-56 flex-col items-center justify-between overflow-hidden rounded-3xl border-2 border-duo-gray p-4"
      >
        {equippedBadges.length > 0 && (
          <div className="flex w-full flex-wrap items-center justify-center gap-2 pb-1 text-2xl">
            {equippedBadges.map((b) => (
              <span key={b.id} title={b.name}>
                {b.emoji}
              </span>
            ))}
          </div>
        )}
        <p className="self-end text-xs font-bold text-ink/50">Lv.{level} {student.nickname}</p>
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <div className="flex w-full flex-wrap items-end justify-center gap-3 pb-1 text-3xl">
          {ownedFurniture.length === 0 ? (
            <p className="text-xs text-ink/40">상점에서 가구를 사면 방에 놓여요!</p>
          ) : (
            ownedFurniture.map((f) => (
              <span key={f.id} title={f.name}>
                {f.emoji}
              </span>
            ))
          )}
        </div>
      </div>

      <Card>
        <p className="mb-3 font-display text-lg">아이템 고르기</p>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleEquip(null)}
            className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xl ${
              !student.equippedAccessory ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
            }`}
          >
            🚫
            <span className="text-[10px] font-bold text-ink/50">없음</span>
          </button>
          {avatarAccessories.map((a) => {
            const owned = student.ownedAccessories.includes(a.id);
            const equipped = student.equippedAccessory === a.id;
            return (
              <button
                key={a.id}
                onClick={() => owned && handleEquip(a.id)}
                disabled={!owned}
                className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xl ${
                  equipped
                    ? "border-duo-green bg-duo-green/10"
                    : owned
                      ? "border-duo-gray bg-white"
                      : "border-duo-gray bg-duo-gray/20 opacity-50"
                }`}
              >
                {owned ? a.emoji : "🔒"}
                <span className="text-[10px] font-bold text-ink/50">{owned ? a.name : `${a.price}P`}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="mb-1 font-display text-lg">🏅 메달·보석 진열장</p>
        <p className="mb-3 text-xs text-ink/40">여러 개를 동시에 진열할 수 있어요</p>
        <div className="grid grid-cols-4 gap-3">
          {badgeAccessories.map((a) => {
            const owned = student.ownedAccessories.includes(a.id);
            const equipped = student.equippedBadges.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => owned && toggleEquippedBadge(student.id, a.id, student.equippedBadges)}
                disabled={!owned}
                className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xl ${
                  equipped
                    ? "border-duo-green bg-duo-green/10"
                    : owned
                      ? "border-duo-gray bg-white"
                      : "border-duo-gray bg-duo-gray/20 opacity-50"
                }`}
              >
                {owned ? a.emoji : "🔒"}
                <span className="text-[10px] font-bold text-ink/50">{owned ? a.name : `${a.price}P`}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Link
        href="/shop"
        className="rounded-2xl border-2 border-duo-yellow bg-duo-yellow/10 p-3 text-center font-bold text-duo-yellow-dark"
      >
        🛍️ 상점에서 아이템 사러가기 (내 포인트: {student.points})
      </Link>
    </div>
  );
}
