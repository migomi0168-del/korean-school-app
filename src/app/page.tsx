"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function RootPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (student) {
      router.replace(student.avatar ? "/home" : "/onboarding");
    } else {
      router.replace("/login");
    }
  }, [loading, student, router]);

  return null;
}
