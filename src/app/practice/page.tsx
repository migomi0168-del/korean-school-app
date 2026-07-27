"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { UnlockNotice } from "@/components/common/UnlockNotice";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { XP_PER_LEVEL, levelFromXp, todayStr } from "@/lib/xp";
import { getNewlyUnlocked } from "@/lib/accessories";
import { t } from "@/lib/i18n";

const MISSIONS = [
  { id: "greet", key: "missionGreet" as const },
  { id: "thanks", key: "missionThanks" as const },
  { id: "invite", key: "missionInvite" as const },
];

export default function PracticePage() {
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState<{ xp: number; leveledUp: boolean; prevLevel: number; newLevel: number } | null>(null);

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
    // Practice mode guarantees a level-up on success, unlike other modes'
    // flat XP rewards: top the student up to the next level's threshold.
    const nextLevelXp = prevLevel * XP_PER_LEVEL;
    const gainedXp = qualifies ? nextLevelXp - student.xp : 0;
    const newXp = student.xp + gainedXp;
    const newLevel = levelFromXp(newXp);
    await updateStudent(student.id, { practiceDate: today, practiceChecked: checked, xp: newXp });
    await refresh();
    setSaving(false);
    if (qualifies) {
      setCelebrate({ xp: gainedXp, leveledUp: newLevel > prevLevel, prevLevel, newLevel });
    }
  }

  if (celebrate) {
    const unlocked = celebrate.leveledUp ? getNewlyUnlocked(celebrate.prevLevel, celebrate.newLevel) : [];
    return (
      <div className="screen-flash flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="relative">
          <div className="explode-pop text-8xl">👏</div>
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-4 text-4xl">
            <span className="clap-float" style={{ animationDelay: "0ms" }}>👏</span>
            <span className="clap-float" style={{ animationDelay: "120ms" }}>🎉</span>
            <span className="clap-float" style={{ animationDelay: "240ms" }}>👏</span>
          </div>
        </div>
        <h1 className="font-display text-2xl text-duo-yellow-dark">오늘의 실천, 최고예요!</h1>
        {celebrate.leveledUp && <p className="font-display text-xl text-duo-green-dark">레벨 업! 🏆</p>}
        <p className="text-lg font-bold text-duo-green-dark">+{celebrate.xp} XP</p>
        <UnlockNotice accessories={unlocked} studentId={student.id} />
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
      <p className="text-center text-sm text-ink/50">{t("practiceIntro", student.nativeLanguage)}</p>

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
            <span className="font-bold">{t(m.key, student.nativeLanguage)}</span>
          </label>
        ))}
      </Card>

      {alreadyDoneToday ? (
        <p className="text-center text-sm text-ink/50">{t("practiceDoneToday", student.nativeLanguage)}</p>
      ) : (
        <Button onClick={handleSubmit} disabled={saving || checked.length === 0} variant="pink">
          {saving ? "저장 중..." : "제출하기"}
        </Button>
      )}
    </div>
  );
}
