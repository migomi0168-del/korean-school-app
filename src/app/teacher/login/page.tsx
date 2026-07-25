"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

export default function TeacherLoginPage() {
  const { login, signup } = useTeacherAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push("/teacher/dashboard");
    } catch {
      setError(mode === "login" ? "이메일 또는 비밀번호가 올바르지 않아요" : "가입에 실패했어요 (이메일 형식/6자 이상 비밀번호 확인)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <div className="text-5xl">🍎</div>
        <h1 className="mt-2 font-display text-2xl">교사용 계정</h1>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-blue"
          />
          <input
            type="password"
            required
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-blue"
          />
          {error && <p className="text-sm font-bold text-duo-red">{error}</p>}
          <Button type="submit" variant="blue" disabled={loading}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </Button>
        </form>
      </Card>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="text-sm text-ink/50 underline"
      >
        {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
      </button>

      <a href="/login" className="text-sm text-ink/40 underline">
        학생 로그인으로
      </a>
    </div>
  );
}
