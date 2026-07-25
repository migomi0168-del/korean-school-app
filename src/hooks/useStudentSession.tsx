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
import type { Student } from "@/types";

const STORAGE_KEY = "hakgyomal_student_id";

interface StudentSessionValue {
  student: Student | null;
  loading: boolean;
  setStudentId: (id: string) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const [studentId, setStudentIdState] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setStudentIdState(id);
    if (!id) setLoading(false);
  }, []);

  // Live Firestore subscription: any write anywhere (this tab, another tab,
  // another device) reflects here immediately without an explicit refresh().
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    const unsubscribe = subscribeToStudent(studentId, (s) => {
      setStudent(s);
      setLoading(false);
    });
    return unsubscribe;
  }, [studentId]);

  const setStudentId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setStudentIdState(id);
  }, []);

  // Kept for API compatibility with existing call sites; the live
  // subscription above means an explicit refresh is no longer required.
  const refresh = useCallback(async () => {}, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStudentIdState(null);
    setStudent(null);
    router.push("/login");
  }, [router]);

  return (
    <StudentSessionContext.Provider value={{ student, loading, setStudentId, refresh, logout }}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error("useStudentSession must be used within StudentSessionProvider");
  return ctx;
}
