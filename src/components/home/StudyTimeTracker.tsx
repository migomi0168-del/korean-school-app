"use client";

import { useEffect } from "react";
import { useStudentSession } from "@/hooks/useStudentSession";
import { bumpStudyMinutes } from "@/lib/students";
import { todayStr } from "@/lib/xp";

const TICK_MS = 60_000;

// Approximate "study time": counts a minute whenever the app tab is open and
// visible while a student is logged in, regardless of which page they're on.
// This is a rough usage-time proxy, not a precise per-activity timer — good
// enough for a classmate-facing "studied N minutes today today" indicator.
export function StudyTimeTracker() {
  const { student } = useStudentSession();

  useEffect(() => {
    if (!student) return;
    const studentId = student.id;
    let studyDate = student.studyDate;

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const today = todayStr();
      bumpStudyMinutes(studentId, studyDate, today);
      studyDate = today;
    };

    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  return null;
}
