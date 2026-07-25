"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function ReviewHubPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const wordCount = student.wrongWordIds.length;
  const phraseCount = student.wrongPhraseIds.length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🔁 복습모드</h1>
      <p className="text-center text-sm text-ink/50">틀렸던 것만 모아서 다시 연습해요</p>

      <Link href={wordCount > 0 ? "/review/word" : "#"} aria-disabled={wordCount === 0}>
        <Card className={`flex items-center gap-4 ${wordCount === 0 ? "opacity-40" : ""}`}>
          <div className="text-4xl">🔤</div>
          <div>
            <p className="font-display text-lg">틀린 단어</p>
            <p className="text-xs text-ink/50">{wordCount}개 남음</p>
          </div>
        </Card>
      </Link>

      <Link href={phraseCount > 0 ? "/review/sentence" : "#"} aria-disabled={phraseCount === 0}>
        <Card className={`flex items-center gap-4 ${phraseCount === 0 ? "opacity-40" : ""}`}>
          <div className="text-4xl">✍️</div>
          <div>
            <p className="font-display text-lg">틀린 문장</p>
            <p className="text-xs text-ink/50">{phraseCount}개 남음</p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
