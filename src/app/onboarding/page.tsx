"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { AVATAR_CHOICES } from "@/components/common/Avatar";
import { MicButton } from "@/components/learn/MicButton";
import { updateStudent } from "@/lib/students";
import { useStudentSession } from "@/hooks/useStudentSession";
import { LANGUAGES } from "@/lib/languages";
import { isPhraseCorrect } from "@/lib/grading";
import { getDiagnosticPhrases, tierFromScore } from "@/lib/difficulty";
import { t } from "@/lib/i18n";
import { NativeText } from "@/components/common/NativeText";
import type { NativeLanguage } from "@/types";

export default function OnboardingPage() {
  const { student, refresh, loading } = useStudentSession();
  const [step, setStep] = useState<"lang" | "avatar" | "diagnostic" | "done">("lang");
  const [lang, setLang] = useState<NativeLanguage | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [qInput, setQInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const router = useRouter();

  const diagnosticQuestions = getDiagnosticPhrases();

  useEffect(() => {
    if (student?.nativeLanguage) setStep((s) => (s === "lang" ? "avatar" : s));
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
    setSaving(false);
    setStep("diagnostic");
  }

  function handleDiagnosticNext(gotIt: boolean) {
    const nextCount = gotIt ? correctCount + 1 : correctCount;
    setCorrectCount(nextCount);
    setQInput("");
    if (qIndex + 1 < diagnosticQuestions.length) {
      setQIndex((i) => i + 1);
      return;
    }
    finishDiagnostic(nextCount);
  }

  async function finishDiagnostic(finalCorrect: number) {
    if (!student) return;
    setSaving(true);
    const tier = tierFromScore(finalCorrect, diagnosticQuestions.length);
    await updateStudent(student.id, { proficiencyTier: tier });
    await refresh();
    setSaving(false);
    setStep("done");
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

  if (step === "avatar") {
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
          {saving ? "저장 중..." : "다음"}
        </Button>
      </div>
    );
  }

  if (step === "diagnostic") {
    const q = diagnosticQuestions[qIndex];
    const nativeLanguage = student.nativeLanguage;

    function handleSkip() {
      handleDiagnosticNext(false);
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const ok = qInput.trim() ? isPhraseCorrect(qInput, q) : false;
      handleDiagnosticNext(ok);
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="font-display text-2xl"><NativeText text={t("diagnosticTitle", nativeLanguage)} lang={nativeLanguage} /></h1>
          <p className="mt-1 text-sm text-ink/60">
            <NativeText text={t("diagnosticSubtext", nativeLanguage)} lang={nativeLanguage} /> ({qIndex + 1}/{diagnosticQuestions.length})
          </p>
        </div>

        <Card className="flex w-full flex-col items-center gap-3 py-8 text-center">
          <div className="text-5xl">{q.emoji}</div>
          <p className="text-xl font-bold text-duo-blue-dark">
            <NativeText text={nativeLanguage ? q.translations[nativeLanguage] : q.translations.en} lang={nativeLanguage} />
          </p>
        </Card>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              autoFocus
              placeholder={t("diagnosticInputPlaceholder", nativeLanguage)}
              className="min-w-0 flex-1 rounded-2xl border-2 border-duo-gray bg-white px-4 py-4 text-center font-display text-xl outline-none focus:border-duo-blue"
            />
            <MicButton onResult={setQInput} />
          </div>
          <Button type="submit" disabled={saving}>
            다음
          </Button>
          <button type="button" onClick={handleSkip} className="text-sm text-ink/40 underline">
            {t("diagnosticSkip", nativeLanguage)}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-6xl">🎉</div>
      <div className="text-center">
        <h1 className="font-display text-2xl">준비 완료!</h1>
        <p className="mt-1 text-sm text-ink/60">학생 수준에 맞게 문제를 준비했어요. 학습하면서 계속 조절될 거예요.</p>
      </div>
      <Button onClick={() => router.push("/home")}>시작하기</Button>
    </div>
  );
}
