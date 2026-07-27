"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import { useStudentSession } from "@/hooks/useStudentSession";
import { subscribeToClassStudents, sendPeerMessage } from "@/lib/students";
import { containsBannedWord } from "@/lib/contentFilter";
import { todayStr } from "@/lib/xp";
import type { Student } from "@/types";

const CANNED_PHRASES = [
  "오늘도 화이팅!",
  "잘하고 있어!",
  "너 정말 열심히 하는구나!",
  "우리 같이 힘내자!",
  "대단해! 계속 그렇게 해!",
];

export default function ClassmatesPage() {
  const { student, loading, isDemo } = useStudentSession();
  const router = useRouter();
  const [classmates, setClassmates] = useState<Student[]>([]);
  const [target, setTarget] = useState<Student | null>(null);
  const [customText, setCustomText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentToast, setSentToast] = useState(false);

  useEffect(() => {
    if (!student) return;
    const unsubscribe = subscribeToClassStudents(student.classId, (all) => {
      setClassmates(all.filter((s) => s.id !== student.id));
    });
    return unsubscribe;
  }, [student]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const today = todayStr();

  async function handleSend(text: string) {
    if (!target || !student) return;
    if (!text.trim()) return;
    if (containsBannedWord(text)) {
      setError("적절하지 않은 표현이 있어요. 다시 써볼까요?");
      return;
    }
    setSending(true);
    await sendPeerMessage(target.id, student.id, student.nickname, text.trim());
    setSending(false);
    setTarget(null);
    setCustomText("");
    setError("");
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2000);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">👥 반 친구들</h1>
      <p className="text-center text-xs text-ink/40">
        오늘 출석했는지, 얼마나 공부했는지 보고 서로 응원해줘요. (점수나 실력은 안 보여요)
      </p>

      {sentToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border-2 border-duo-green bg-white px-4 py-2 font-display text-sm shadow-lg">
          응원 메시지를 보냈어요! 💌
        </div>
      )}

      {isDemo ? (
        <Card className="text-center text-sm text-ink/50">테스트 모드에서는 반 친구 기능을 사용할 수 없어요.</Card>
      ) : classmates.length === 0 ? (
        <Card className="text-center text-sm text-ink/50">아직 같은 반 친구가 없어요.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {classmates.map((c) => {
            const attended = c.lastAttendanceDate === today;
            const minutes = c.studyDate === today ? c.studyMinutesToday : 0;
            return (
              <Card key={c.id} className="flex items-center gap-3">
                <Avatar emoji={c.avatar} accessoryId={c.equippedAccessory} size="sm" />
                <div className="flex-1">
                  <p className="font-display text-lg">{c.nickname}</p>
                  <p className="text-xs text-ink/50">
                    {attended ? "🟢 오늘 출석함" : "⚪ 오늘 미출석"} · ⏱️ 오늘 {minutes}분 공부
                  </p>
                </div>
                <button
                  onClick={() => setTarget(c)}
                  className="shrink-0 rounded-xl bg-duo-pink px-3 py-2 text-xs font-bold text-white"
                >
                  응원 보내기
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="flex w-full max-w-xs flex-col gap-3 rounded-3xl bg-white p-5 text-center shadow-lg">
            <p className="font-display text-lg">{target.nickname}에게 응원 보내기</p>
            <div className="flex flex-col gap-2">
              {CANNED_PHRASES.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  disabled={sending}
                  className="rounded-2xl border-2 border-duo-gray px-3 py-2 text-sm font-bold hover:border-duo-green"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-duo-gray pt-3">
              <input
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setError("");
                }}
                placeholder="직접 한국어로 입력하기"
                className="rounded-xl border-2 border-duo-gray px-3 py-2 text-sm outline-none focus:border-duo-green"
              />
              {error && <p className="text-xs font-bold text-duo-red">{error}</p>}
              <Button onClick={() => handleSend(customText)} disabled={sending || !customText.trim()} variant="green">
                {sending ? "보내는 중..." : "보내기"}
              </Button>
            </div>
            <button
              onClick={() => {
                setTarget(null);
                setCustomText("");
                setError("");
              }}
              className="text-sm text-ink/40 underline"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
