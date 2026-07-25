"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { AVATAR_CHOICES } from "@/components/common/Avatar";
import { updateStudent } from "@/lib/students";
import { useStudentSession } from "@/hooks/useStudentSession";
import { LANGUAGES } from "@/lib/languages";
import type { NativeLanguage } from "@/types";

export default function OnboardingPage() {
  const { student, refresh, loading } = useStudentSession();
  const [step, setStep] = useState<"lang" | "avatar">("lang");
  const [lang, setLang] = useState<NativeLanguage | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (student?.nativeLanguage) setStep("avatar");
  }, [student?.nativeLanguage]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  async function handleLangNext() {
    if (!lang || !student) return;
    setSaving(true);
    await updateStudent(student.id, { nativeLanguage: lang });
    await refresh();
    setSaving(false);
    setStep("avatar");
  }

  async function handleConfirm() {
    if (!avatar || !student) return;
    setSaving(true);
    await updateStudent(student.id, { avatar });
    await refresh();
    router.push("/home");
  }

  if (step === "lang") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="font-display text-2xl">
            반가워요, <span className="text-duo-green-dark">{student.nickname}</span>님!
          </h1>
          <p className="mt-1 text-sm text-ink/60">사용하기 편한 언어를 선택해주세요</p>
        </div>

        <Card className="w-full">
          <div className="flex flex-col gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-bold ${
                  lang === l.code ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
                }`}
              >
                <span className="text-2xl">{l.emoji}</span>
                {l.label}
              </button>
            ))}
          </div>
        </Card>

        <Button disabled={!lang || saving} onClick={handleLangNext}>
          {saving ? "저장 중..." : "다음"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="font-display text-2xl">나를 표현할 캐릭터를 골라주세요</h1>
      </div>

      <Card className="w-full">
        <div className="grid grid-cols-4 gap-3">
          {AVATAR_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className={`flex h-16 items-center justify-center rounded-2xl border-2 text-3xl ${
                avatar === emoji ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Card>

      <Button disabled={!avatar || saving} onClick={handleConfirm}>
        {saving ? "저장 중..." : "시작하기"}
      </Button>
    </div>
  );
}
