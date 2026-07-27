"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Avatar";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { subscribeToStudent, sendTeacherMessage, clearTeacherAssignment } from "@/lib/students";
import { getWord, getPhrase, sections } from "@/lib/content";
import { levelFromXp, todayStr } from "@/lib/xp";
import type { NativeLanguage, Student } from "@/types";

const LANG_LABEL: Record<NativeLanguage, string> = { zh: "중국어", en: "영어", vi: "베트남어", ja: "일본어" };

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useTeacherAuth();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null | undefined>(undefined);
  const [messageText, setMessageText] = useState("");
  const [bonusPoints, setBonusPoints] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStudent(id, setStudent);
    return unsubscribe;
  }, [id]);

  async function handleSendMessage() {
    if (!student || !messageText.trim() || sending) return;
    setSending(true);
    await sendTeacherMessage(student.id, messageText.trim(), bonusPoints);
    setSending(false);
    setSent(true);
    setMessageText("");
    setBonusPoints(0);
    setTimeout(() => setSent(false), 2500);
  }

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
  const attendedToday = student.lastAttendanceDate === todayStr();
  const practiceDoneToday = student.practiceDate === todayStr();
  const wrongWords = student.wrongWordIds.map(getWord).filter((w) => w !== null);
  const wrongPhrases = student.wrongPhraseIds.map(getPhrase).filter((p) => p !== null);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/teacher/dashboard" className="text-sm text-ink/40">
        ← 대시보드로
      </Link>

      <div className="flex flex-col items-center gap-2 py-2">
        <Avatar emoji={student.avatar} accessoryId={student.equippedAccessory} size="lg" />
        <h1 className="font-display text-2xl">{student.nickname}</h1>
        <p className="text-sm text-ink/50">
          {student.grade}학년 · {student.nativeLanguage ? LANG_LABEL[student.nativeLanguage] : "언어 미선택"} · PIN {student.pinCode}
        </p>
      </div>

      <Card className="flex justify-around text-center">
        <div>
          <p className="font-display text-xl text-duo-green-dark">Lv.{level}</p>
          <p className="text-xs text-ink/50">{student.xp} XP</p>
        </div>
        <div>
          <p className="font-display text-xl text-duo-yellow-dark">💰{student.points}</p>
          <p className="text-xs text-ink/50">보유 포인트</p>
        </div>
        <div>
          <p className="text-2xl">🔥</p>
          <p className="font-display text-xl">{student.streakCount}</p>
          <p className="text-xs text-ink/50">연속 출석</p>
        </div>
        <div>
          <p className="text-2xl">{attendedToday ? "🟢" : "⚪"}</p>
          <p className="text-xs text-ink/50">{attendedToday ? "오늘 출석함" : "오늘 미출석"}</p>
        </div>
        <div>
          <p className="text-2xl">{practiceDoneToday ? "🌟" : "⚪"}</p>
          <p className="text-xs text-ink/50">{practiceDoneToday ? "오늘 실천함" : "오늘 미실천"}</p>
        </div>
      </Card>

      {student.teacherAssignment && (
        <Card className="border-duo-blue bg-duo-blue/5">
          <p className="mb-2 font-display text-lg">📌 배정된 학습</p>
          <p className="text-sm text-ink">
            {student.teacherAssignment.label} · {student.teacherAssignment.completed ? "완료 ✅" : "진행 중"}
          </p>
          <button
            onClick={() => clearTeacherAssignment(student.id)}
            className="mt-2 text-xs text-ink/40 underline"
          >
            배정 취소
          </button>
        </Card>
      )}

      <Card>
        <p className="mb-3 font-display text-lg">💌 칭찬 메시지 보내기</p>
        {student.teacherMessage && (
          <p className="mb-3 rounded-xl bg-duo-gray/10 px-3 py-2 text-xs text-ink/50">
            최근 보낸 메시지: &ldquo;{student.teacherMessage.text}&rdquo;
            {student.teacherMessage.points > 0 && ` (+${student.teacherMessage.points}P)`} ·{" "}
            {student.teacherMessage.read ? "학생이 확인함 ✅" : "아직 확인 전"}
          </p>
        )}
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="예: 오늘 발표 정말 잘했어요! 앞으로도 화이팅!"
          rows={3}
          className="mb-3 w-full rounded-2xl border-2 border-duo-gray p-3 text-sm outline-none focus:border-duo-green"
        />
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm font-bold text-ink/60">보너스 포인트</label>
          <input
            type="number"
            min={0}
            value={bonusPoints}
            onChange={(e) => setBonusPoints(Math.max(0, Number(e.target.value)))}
            className="w-24 rounded-xl border-2 border-duo-gray px-3 py-1 text-sm outline-none focus:border-duo-green"
          />
          <span className="text-sm text-ink/40">P (선택)</span>
        </div>
        <Button onClick={handleSendMessage} disabled={!messageText.trim() || sending} variant="pink">
          {sending ? "보내는 중..." : sent ? "전달했어요! ✅" : "메시지 보내기"}
        </Button>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">🚪 방탈출 진행</p>
        <div className="flex flex-col gap-2 text-sm">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <span>{s.emoji} {s.name}</span>
              <span>{student.escapeCleared.includes(s.id) ? "✅ 클리어" : "🔒 미완료"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">🔤 자주 틀리는 단어 ({wrongWords.length})</p>
        {wrongWords.length === 0 ? (
          <p className="text-sm text-ink/50">틀린 단어가 없어요</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wrongWords.map((w) => (
              <span key={w.id} className="rounded-full bg-duo-red/10 px-3 py-1 text-sm font-bold text-duo-red">
                {w.emoji} {w.ko}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">✍️ 자주 틀리는 문장 ({wrongPhrases.length})</p>
        {wrongPhrases.length === 0 ? (
          <p className="text-sm text-ink/50">틀린 문장이 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {wrongPhrases.map((p) => (
              <p key={p.id} className="rounded-xl bg-duo-red/10 px-3 py-2 text-sm font-bold text-duo-red">
                {p.ko}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
