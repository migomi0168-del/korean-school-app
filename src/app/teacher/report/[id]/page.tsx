"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { subscribeToStudent } from "@/lib/students";
import { getWord, getPhrase, sections } from "@/lib/content";
import { levelFromXp } from "@/lib/xp";
import { DIFFICULTY_LABEL } from "@/lib/difficulty";
import type { NativeLanguage, Student } from "@/types";

const LANG_LABEL: Record<NativeLanguage, string> = { zh: "중국어", en: "영어", vi: "베트남어", ja: "일본어" };

export default function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useTeacherAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToStudent(id, setStudent);
    return unsubscribe;
  }, [id]);

  if (loading || student === undefined) return null;
  if (!user) {
    router.push("/teacher/login");
    return null;
  }
  if (!student) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-ink/50">학생을 찾을 수 없어요</p>
        <Link href="/teacher/dashboard" className="text-sm text-duo-blue-dark underline">
          대시보드로
        </Link>
      </div>
    );
  }

  const level = levelFromXp(student.xp);
  const wrongWords = student.wrongWordIds.map(getWord).filter((w) => w !== null);
  const wrongPhrases = student.wrongPhraseIds.map(getPhrase).filter((p) => p !== null);
  const clearedCount = student.escapeCleared.length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 print:p-8">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/teacher/student/${student.id}`} className="text-sm text-ink/40">
          ← 학생 상세로
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-duo-blue px-4 py-2 text-sm font-bold text-white"
        >
          🖨️ 인쇄 / PDF로 저장
        </button>
      </div>

      <div className="rounded-3xl border-2 border-duo-gray bg-white p-6 print:border-none print:p-0">
        <div className="mb-4 flex items-center justify-between border-b-2 border-duo-gray pb-3">
          <h1 className="font-display text-xl">📋 성장 기록 리포트</h1>
          <p className="text-xs text-ink/50">발급일: {new Date().toLocaleDateString("ko-KR")}</p>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-xs font-bold text-ink/40">학생 정보</p>
          <p className="text-sm">
            <span className="font-bold">{student.nickname}</span> · {student.grade}학년 ·{" "}
            {student.nativeLanguage ? LANG_LABEL[student.nativeLanguage] : "모국어 미선택"} · PIN {student.pinCode}
          </p>
          <p className="text-sm text-ink/60">
            한국어 레벨 진단: {student.proficiencyTier ? DIFFICULTY_LABEL[student.proficiencyTier] : "미실시"}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl bg-duo-gray/10 p-3 text-center">
          <div>
            <p className="font-display text-lg text-duo-green-dark">Lv.{level}</p>
            <p className="text-xs text-ink/50">{student.xp} XP</p>
          </div>
          <div>
            <p className="font-display text-lg text-duo-yellow-dark">🔥{student.streakCount}</p>
            <p className="text-xs text-ink/50">연속 출석일</p>
          </div>
          <div>
            <p className="font-display text-lg text-duo-blue-dark">🚪{clearedCount}/{sections.length}</p>
            <p className="text-xs text-ink/50">방탈출 클리어</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-xs font-bold text-ink/40">상황별 방탈출 진행</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {sections.map((s) => (
              <p key={s.id}>
                {s.emoji} {s.name}: {student.escapeCleared.includes(s.id) ? "✅ 클리어" : "🔒 미완료"}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-xs font-bold text-ink/40">자주 틀리는 단어 ({wrongWords.length})</p>
          {wrongWords.length === 0 ? (
            <p className="text-sm text-ink/40">없음</p>
          ) : (
            <p className="text-sm">{wrongWords.map((w) => `${w.emoji}${w.ko}`).join(", ")}</p>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-bold text-ink/40">자주 틀리는 문장 ({wrongPhrases.length})</p>
          {wrongPhrases.length === 0 ? (
            <p className="text-sm text-ink/40">없음</p>
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              {wrongPhrases.map((p) => (
                <p key={p.id}>· {p.ko}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
