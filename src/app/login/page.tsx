"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { loginWithPin } from "@/lib/students";
import { useStudentSession } from "@/hooks/useStudentSession";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setStudentId } = useStudentSession();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("6자리 번호를 입력해주세요");
      return;
    }
    setLoading(true);
    setError("");
    const student = await loginWithPin(pin);
    setLoading(false);
    if (!student) {
      setError("번호를 다시 확인해주세요");
      return;
    }
    setStudentId(student.id);
    router.push(student.avatar ? "/home" : "/onboarding");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <div className="text-6xl">🏫</div>
        <h1 className="mt-2 font-display text-3xl text-duo-green-dark">학교말</h1>
        <p className="mt-1 text-sm text-ink/60">선생님이 알려준 번호 6자리를 입력하세요</p>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoFocus
            placeholder="••••••"
            className="w-full rounded-2xl border-2 border-duo-gray bg-cream px-4 py-4 text-center font-display text-3xl tracking-[0.3em] outline-none focus:border-duo-blue"
          />
          {error && <p className="text-center text-sm font-bold text-duo-red">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "확인 중..." : "입장하기"}
          </Button>
        </form>
      </Card>

      <a href="/teacher/login" className="text-sm text-ink/40 underline">
        선생님이신가요?
      </a>
    </div>
  );
}
