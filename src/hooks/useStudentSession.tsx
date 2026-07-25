"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getStudent } from "@/lib/students";
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
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async (id: string) => {
    const s = await getStudent(id);
    setStudent(s);
    setLoading(false);
    return s;
  }, []);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (id) {
      load(id);
    } else {
      setLoading(false);
    }
  }, [load]);

  const setStudentId = useCallback(
    (id: string) => {
      localStorage.setItem(STORAGE_KEY, id);
      setLoading(true);
      load(id);
    },
    [load]
  );

  const refresh = useCallback(async () => {
    const id = localStorage.getItem(STORAGE_KEY);
    if (id) await load(id);
  }, [load]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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
