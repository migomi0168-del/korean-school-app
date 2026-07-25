"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { accessories } from "@/lib/accessories";
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

  function handleEquip(id: string | null) {
    if (!student) return;
    updateStudent(student.id, { equippedAccessory: id });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/mypage" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">✨ 꾸미기</h1>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <p className="text-sm text-ink/50">Lv.{level} {student.nickname}</p>
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
          {accessories.map((a) => {
            const unlocked = level >= a.requiredLevel;
            const equipped = student.equippedAccessory === a.id;
            return (
              <button
                key={a.id}
                onClick={() => unlocked && handleEquip(a.id)}
                disabled={!unlocked}
                className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-xl ${
                  equipped
                    ? "border-duo-green bg-duo-green/10"
                    : unlocked
                      ? "border-duo-gray bg-white"
                      : "border-duo-gray bg-duo-gray/20 opacity-50"
                }`}
              >
                {unlocked ? a.emoji : "🔒"}
                <span className="text-[10px] font-bold text-ink/50">{unlocked ? a.name : `Lv.${a.requiredLevel}`}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
