"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { sections } from "@/lib/content";
import { useStudentSession } from "@/hooks/useStudentSession";
import { SectionScene } from "@/components/game/SectionScene";
import { getNativeLabel } from "@/lib/labelTranslations";
import { NativeText } from "@/components/common/NativeText";

export default function EscapeSelectPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/game" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🚪 학교 방탈출</h1>
      <p className="text-center text-sm text-ink/50">장소를 골라서 표현을 풀고 탈출하세요</p>

      <div className="flex flex-col gap-4">
        {sections.map((s) => {
          const cleared = student.escapeCleared.includes(s.id);
          return (
            <Link key={s.id} href={`/game/escape/${s.id}`} className="relative">
              <SectionScene background={s.background} emoji={s.emoji} />
              <div className="mt-2 flex items-center justify-between px-1">
                <div>
                  <p className="font-display text-lg">{s.name}</p>
                  {getNativeLabel(s.name, student.nativeLanguage) && (
                    <p className="text-xs text-ink/40">
                      <NativeText text={getNativeLabel(s.name, student.nativeLanguage) ?? ""} lang={student.nativeLanguage} />
                    </p>
                  )}
                </div>
                <span className="text-sm">{cleared ? "✅ 클리어" : "▶️ 도전하기"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
