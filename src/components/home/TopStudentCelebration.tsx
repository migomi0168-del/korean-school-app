"use client";

import { useEffect, useState } from "react";
import { useStudentSession } from "@/hooks/useStudentSession";
import { subscribeToClassStudents } from "@/lib/students";
import { todayStr } from "@/lib/xp";

// Watches the student's own class in real time and celebrates the moment
// they become today's top studier ("오늘의 열심왕"). Only fires once per
// student per day (tracked in localStorage) so it doesn't re-pop on every
// snapshot update while they hold the top spot.
export function TopStudentCelebration() {
  const { student, isDemo } = useStudentSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!student || isDemo) return;
    const studentId = student.id;
    const unsubscribe = subscribeToClassStudents(student.classId, (all) => {
      const today = todayStr();
      const studiedToday = all.filter((s) => s.studyDate === today && s.studyMinutesToday > 0);
      if (studiedToday.length < 2) return;
      const top = studiedToday.reduce((max, s) => (s.studyMinutesToday > max.studyMinutesToday ? s : max));
      if (top.id !== studentId) return;

      const storageKey = `top_student_celebrated_${studentId}_${today}`;
      try {
        if (localStorage.getItem(storageKey) === "1") return;
        localStorage.setItem(storageKey, "1");
      } catch {
        return;
      }
      setShow(true);
    });
    return unsubscribe;
  }, [student?.id, student?.classId, isDemo]);

  if (!show || !student) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6"
      onClick={() => setShow(false)}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl">🏆</div>
        <p className="font-display text-xl text-duo-yellow-dark">오늘의 열심왕!</p>
        <p className="text-sm text-ink/70">
          {student.nickname}님이 오늘 우리 반에서 가장 오래 공부했어요!
          <br />
          정말 대단해요, 축하해요! 🎉
        </p>
        <button
          onClick={() => setShow(false)}
          className="rounded-xl bg-duo-yellow px-4 py-2 text-sm font-bold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
