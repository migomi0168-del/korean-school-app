"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { AVATAR_CHOICES } from "@/components/common/Avatar";
import { updateStudent } from "@/lib/students";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function OnboardingPage() {
  const { student, refresh, loading } = useStudentSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  async function handleConfirm() {
    if (!selected || !student) return;
    setSaving(true);
    await updateStudent(student.id, { avatar: selected });
    await refresh();
    router.push("/home");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="font-display text-2xl">
          반가워요, <span className="text-duo-green-dark">{student.nickname}</span>님!
        </h1>
        <p className="mt-1 text-sm text-ink/60">나를 표현할 캐릭터를 골라주세요</p>
      </div>

      <Card className="w-full">
        <div className="grid grid-cols-4 gap-3">
          {AVATAR_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelected(emoji)}
              className={`flex h-16 items-center justify-center rounded-2xl border-2 text-3xl ${
                selected === emoji ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Card>

      <Button disabled={!selected || saving} onClick={handleConfirm}>
        {saving ? "저장 중..." : "시작하기"}
      </Button>
    </div>
  );
}
