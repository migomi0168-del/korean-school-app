"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { ensureClassForTeacher } from "@/lib/classes";
import { createStudent, subscribeToClassStudents, assignTeacherContent } from "@/lib/students";
import { levelFromXp, todayStr } from "@/lib/xp";
import { ASSIGNMENT_OPTIONS } from "@/lib/assignments";
import { needsAttention } from "@/lib/weakness";
import type { NativeLanguage, Student } from "@/types";

const LANG_LABEL: Record<NativeLanguage, string> = { zh: "중국어", en: "영어", vi: "베트남어", ja: "일본어" };

export default function TeacherDashboardPage() {
  const { user, loading, logout } = useTeacherAuth();
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [lastCreatedPin, setLastCreatedPin] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(1);
  const [creating, setCreating] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignSituation, setAssignSituation] = useState<string | null>(null);
  const [assignCount, setAssignCount] = useState(5);
  const [assigning, setAssigning] = useState(false);
  const [assignedToast, setAssignedToast] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let unsubscribe: (() => void) | undefined;
    ensureClassForTeacher(user.uid).then((cls) => {
      setClassId(cls.id);
      unsubscribe = subscribeToClassStudents(cls.id, (list) => {
        setStudents(list);
        setLoadingStudents(false);
      });
    });
    return () => unsubscribe?.();
  }, [loading, user]);

  if (loading) return null;
  if (!user) {
    router.push("/teacher/login");
    return null;
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!classId || !nickname.trim()) return;
    setCreating(true);
    const student = await createStudent({ classId, nickname: nickname.trim(), grade });
    setLastCreatedPin(student.pinCode);
    setNickname("");
    setCreating(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAssign() {
    if (!assignSituation || selectedIds.size === 0 || assignCount === 0) return;
    const option = ASSIGNMENT_OPTIONS.find((o) => o.id === assignSituation);
    if (!option) return;
    setAssigning(true);
    await assignTeacherContent(Array.from(selectedIds), option.id, option.label, assignCount);
    setAssigning(false);
    setSelectedIds(new Set());
    setAssignSituation(null);
    setAssignedToast(true);
    setTimeout(() => setAssignedToast(false), 2000);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">👩‍🏫 교사 대시보드</h1>
        <button onClick={logout} className="text-xs text-ink/40 underline">
          로그아웃
        </button>
      </div>

      {assignedToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border-2 border-duo-blue bg-white px-4 py-2 font-display text-sm shadow-lg">
          학습을 배정했어요! 📌
        </div>
      )}

      {lastCreatedPin && (
        <Card className="border-duo-green bg-duo-green/10 text-center">
          <p className="text-sm text-ink/60">학생에게 알려주세요</p>
          <p className="font-display text-3xl tracking-widest text-duo-green-dark">{lastCreatedPin}</p>
        </Card>
      )}

      <Card>
        <p className="mb-3 font-display text-lg">학생 추가</p>
        <p className="mb-2 text-xs text-ink/50">모국어는 학생이 처음 로그인할 때 직접 선택해요.</p>
        <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
          <input
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full rounded-xl border-2 border-duo-gray px-3 py-2 outline-none focus:border-duo-blue"
          />
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-full rounded-xl border-2 border-duo-gray px-3 py-2"
          >
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </select>
          <Button type="submit" variant="green" disabled={creating}>
            {creating ? "추가 중..." : "+ 학생 추가"}
          </Button>
        </form>
      </Card>

      <Card>
        <p className="mb-1 font-display text-lg">📌 오늘의 학습 배정</p>
        <p className="mb-3 text-xs text-ink/50">아래 학생 목록에서 체크박스로 학생을 고르고, 배울 상황을 선택해서 배정하세요.</p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {ASSIGNMENT_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setAssignSituation(o.id)}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                assignSituation === o.id ? "border-duo-blue bg-duo-blue/10" : "border-duo-gray bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm font-bold text-ink/60">문제 개수</label>
          <select
            value={assignCount}
            onChange={(e) => setAssignCount(Number(e.target.value))}
            className="w-20 rounded-xl border-2 border-duo-gray px-3 py-1 text-sm outline-none focus:border-duo-blue"
          >
            {Array.from({ length: 11 }, (_, n) => n).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-ink/40">문제</span>
        </div>
        {assignCount === 0 && (
          <p className="mb-3 text-xs font-bold text-duo-red">문제 개수를 1개 이상 선택해주세요.</p>
        )}
        <Button
          onClick={handleAssign}
          disabled={!assignSituation || selectedIds.size === 0 || assignCount === 0 || assigning}
          variant="blue"
        >
          {assigning ? "배정 중..." : `선택한 ${selectedIds.size}명에게 배정하기`}
        </Button>
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg">
          우리 반 학생 ({students.length}명) <span className="text-xs font-normal text-duo-green-dark">● 실시간</span>
        </p>
        {loadingStudents ? (
          <p className="text-sm text-ink/50">불러오는 중...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-ink/50">아직 등록된 학생이 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map((s) => {
              const attendedToday = s.lastAttendanceDate === todayStr();
              return (
                <div key={s.id} className="flex items-center gap-2 rounded-xl border-2 border-duo-gray p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="h-5 w-5 shrink-0"
                  />
                  <Link href={`/teacher/student/${s.id}`} className="flex flex-1 items-center justify-between active:scale-[0.99]">
                    <div>
                      <p className="font-bold">
                        {s.nickname}{" "}
                        {needsAttention(s) && (
                          <span title="실력이 낮아 특별 관심이 필요해요">⭐</span>
                        )}{" "}
                        <span>{attendedToday ? "🟢" : "⚪"}</span>
                      </p>
                      <p className="text-ink/50">
                        {s.grade}학년 · {s.nativeLanguage ? LANG_LABEL[s.nativeLanguage] : "미선택"} · PIN {s.pinCode}
                      </p>
                      {s.teacherAssignment && (
                        <p className="text-xs font-bold text-duo-blue-dark">
                          📌 {s.teacherAssignment.label} {s.teacherAssignment.completed ? "(완료)" : "(진행중)"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-duo-green-dark">Lv.{levelFromXp(s.xp)}</p>
                      <p className="text-xs text-ink/50">🔥{s.streakCount}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
