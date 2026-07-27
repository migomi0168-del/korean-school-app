"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { subscribeToStudent } from "@/lib/students";
import { clearDemoSession, getDemoStudent, startDemoSession, subscribeDemoStudent } from "@/lib/demoStore";
import type { Student } from "@/types";

const STORAGE_KEY = "hakgyomal_student_id";

interface StudentSessionValue {
  student: Student | null;
  loading: boolean;
  isDemo: boolean;
  setStudentId: (id: string) => void;
  startDemo: () => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const [studentId, setStudentIdState] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const demo = getDemoStudent();
    if (demo) {
      setIsDemo(true);
      setStudentIdState(demo.id);
      return;
    }
    const id = localStorage.getItem(STORAGE_KEY);
    setStudentIdState(id);
    if (!id) setLoading(false);
  }, []);

  // Live subscription: Firestore onSnapshot for real accounts, or the
  // sessionStorage-only demo store for PIN 111111 sessions (never touches
  // Firestore, so demo sessions can't collide or show up anywhere else).
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    if (isDemo) {
      const unsubscribe = subscribeDemoStudent((s) => {
        setStudent(s);
        setLoading(false);
      });
      return unsubscribe;
    }
    const unsubscribe = subscribeToStudent(studentId, (s) => {
      setStudent(s);
      setLoading(false);
    });
    return unsubscribe;
  }, [studentId, isDemo]);

  const setStudentId = useCallback((id: string) => {
    clearDemoSession();
    localStorage.setItem(STORAGE_KEY, id);
    setIsDemo(false);
    setStudentIdState(id);
  }, []);

  const startDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const demo = startDemoSession();
    setIsDemo(true);
    setStudentIdState(demo.id);
  }, []);

  // Kept for API compatibility with existing call sites; the live
  // subscription above means an explicit refresh is no longer required.
  const refresh = useCallback(async () => {}, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    clearDemoSession();
    setIsDemo(false);
    setStudentIdState(null);
    setStudent(null);
    router.push("/login");
  }, [router]);

  return (
    <StudentSessionContext.Provider value={{ student, loading, isDemo, setStudentId, startDemo, refresh, logout }}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error("useStudentSession must be used within StudentSessionProvider");
  return ctx;
}
