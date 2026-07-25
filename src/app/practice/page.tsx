"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_REWARD, levelFromXp, todayStr } from "@/lib/xp";

const MISSIONS = [
  { id: "greet", label: "친구 또는 선생님에게 인사하기" },
  { id: "thanks", label: "친구 또는 선생님께 감사 표현하기" },
  { id: "invite", label: "친구와 함께 놀자고 제안하기" },
];

export default function PracticePage() {
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState<{ xp: number; leveledUp: boolean } | null>(null);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const today = todayStr();
  const alreadyDoneToday = student.practiceDate === today;
  const effectiveChecked = alreadyDoneToday ? student.practiceChecked : checked;

  function toggle(id: string) {
    if (alreadyDoneToday) return;
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!student || alreadyDoneToday) return;
    setSaving(true);
    const qualifies = checked.length >= 2;
    const prevLevel = levelFromXp(student.xp);
    const gainedXp = qualifies ? XP_REWARD.practiceMode : 0;
    const newXp = student.xp + gainedXp;
    const newLevel = levelFromXp(newXp);
    await updateStudent(student.id, { practiceDate: today, practiceChecked: checked, xp: newXp });
    await refresh();
    setSaving(false);
    if (qualifies) {
      setCelebrate({ xp: gainedXp, leveledUp: newLevel > prevLevel });
    }
  }

  if (celebrate) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-8xl">👏</div>
        <h1 className="font-display text-2xl text-duo-yellow-dark">오늘의 실천, 최고예요!</h1>
        {celebrate.leveledUp && <p className="font-display text-xl text-duo-green-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{celebrate.xp} XP</p>
        <Button onClick={() => router.push("/home")}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🌟 오늘의 실천 미션</h1>
      <p className="text-center text-sm text-ink/50">2개 이상 실천하면 박수와 함께 레벨이 올라요!</p>

      <Card className="flex flex-col gap-3">
        {MISSIONS.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 rounded-2xl border-2 p-4 ${
              effectiveChecked.includes(m.id) ? "border-duo-green bg-duo-green/10" : "border-duo-gray"
            }`}
          >
            <input
              type="checkbox"
              checked={effectiveChecked.includes(m.id)}
              onChange={() => toggle(m.id)}
              disabled={alreadyDoneToday}
              className="h-5 w-5"
            />
            <span className="font-bold">{m.label}</span>
          </label>
        ))}
      </Card>

      {alreadyDoneToday ? (
        <p className="text-center text-sm text-ink/50">오늘 실천은 이미 기록했어요. 내일 또 만나요!</p>
      ) : (
        <Button onClick={handleSubmit} disabled={saving || checked.length === 0} variant="pink">
          {saving ? "저장 중..." : "제출하기"}
        </Button>
      )}
    </div>
  );
}
