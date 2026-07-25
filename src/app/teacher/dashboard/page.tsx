"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { ensureClassForTeacher } from "@/lib/classes";
import { createStudent, listStudentsForClass } from "@/lib/students";
import { levelFromXp } from "@/lib/xp";
import type { NativeLanguage, Student } from "@/types";

const LANG_LABEL: Record<NativeLanguage, string> = { zh: "중국어", en: "영어", vi: "베트남어" };

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

  useEffect(() => {
    if (loading || !user) return;
    ensureClassForTeacher(user.uid).then(async (cls) => {
      setClassId(cls.id);
      const list = await listStudentsForClass(cls.id);
      setStudents(list);
      setLoadingStudents(false);
    });
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
    setStudents((prev) => [...prev, student]);
    setLastCreatedPin(student.pinCode);
    setNickname("");
    setCreating(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">👩‍🏫 교사 대시보드</h1>
        <button onClick={logout} className="text-xs text-ink/40 underline">
          로그아웃
        </button>
      </div>

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
        <p className="mb-3 font-display text-lg">우리 반 학생 ({students.length}명)</p>
        {loadingStudents ? (
          <p className="text-sm text-ink/50">불러오는 중...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-ink/50">아직 등록된 학생이 없어요</p>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border-2 border-duo-gray p-3 text-sm">
                <div>
                  <p className="font-bold">{s.nickname}</p>
                  <p className="text-ink/50">
                    {s.grade}학년 · {s.nativeLanguage ? LANG_LABEL[s.nativeLanguage] : "미선택"} · PIN {s.pinCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-duo-green-dark">Lv.{levelFromXp(s.xp)}</p>
                  <p className="text-xs text-ink/50">🔥{s.streakCount}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
