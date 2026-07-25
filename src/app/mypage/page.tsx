"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { sections } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { levelFromXp, todayStr } from "@/lib/xp";
import { LANGUAGES } from "@/lib/languages";
import type { NativeLanguage } from "@/types";

export default function MyPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const [editingLang, setEditingLang] = useState(false);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const level = levelFromXp(student.xp);
  const practiceDoneToday = student.practiceDate === todayStr();

  function handleChangeLanguage(code: NativeLanguage) {
    if (!student) return;
    updateStudent(student.id, { nativeLanguage: code });
    setEditingLang(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <h1 className="font-display text-2xl">{student.nickname}</h1>
        <p className="text-sm text-ink/50">Lv.{level} · {student.xp} XP</p>
        <Link href="/closet" className="text-xs font-bold text-duo-blue-dark underline">
          ✨ 아이템 꾸미기
        </Link>
      </div>

      <Card className="flex justify-around text-center">
        <div>
          <p className="text-2xl">🔥</p>
          <p className="font-display text-xl">{student.streakCount}</p>
          <p className="text-xs text-ink/50">연속 출석</p>
        </div>
        <div>
          <p className="text-2xl">🚪</p>
          <p className="font-display text-xl">{student.escapeCleared.length}/{sections.length}</p>
          <p className="text-xs text-ink/50">방탈출 클리어</p>
        </div>
        <div>
          <p className="text-2xl">🌟</p>
          <p className="font-display text-xl">{practiceDoneToday ? "완료" : "-"}</p>
          <p className="text-xs text-ink/50">오늘 실천</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <p className="font-display text-lg">🌐 모국어</p>
          <button
            onClick={() => setEditingLang((v) => !v)}
            className="text-xs font-bold text-duo-blue-dark underline"
          >
            {editingLang ? "닫기" : "바꾸기"}
          </button>
        </div>
        {!editingLang ? (
          <p className="mt-2 text-lg">
            {LANGUAGES.find((l) => l.code === student.nativeLanguage)?.emoji ?? "❓"}{" "}
            {LANGUAGES.find((l) => l.code === student.nativeLanguage)?.label ?? "설정 안 됨"}
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleChangeLanguage(l.code)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold ${
                  student.nativeLanguage === l.code ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
                }`}
              >
                <span className="text-xl">{l.emoji}</span>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">오답노트</p>
        <div className="flex justify-around text-center">
          <div>
            <p className="font-display text-2xl text-duo-red">{student.wrongWordIds.length}</p>
            <p className="text-xs text-ink/50">틀린 단어</p>
          </div>
          <div>
            <p className="font-display text-2xl text-duo-red">{student.wrongPhraseIds.length}</p>
            <p className="text-xs text-ink/50">틀린 문장</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">방탈출 진행</p>
        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span>{s.emoji} {s.name}</span>
              <span>{student.escapeCleared.includes(s.id) ? "✅ 클리어" : "🔒 미완료"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
