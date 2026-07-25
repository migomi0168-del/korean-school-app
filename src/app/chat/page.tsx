"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { useStudentSession } from "@/hooks/useStudentSession";

interface Message {
  role: "user" | "ai";
  text: string;
  correction?: string | null;
}

const INITIAL_MESSAGE: Message = { role: "ai", text: "안녕! 오늘 학교에서 뭐 했어? 나랑 이야기해볼래?" };

export default function ChatPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "ai", text: "미안, 지금은 대답하기 어려워. 다시 말해줄래?" }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply, correction: data.correction }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "연결에 문제가 생겼어. 잠시 후 다시 시도해줘." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <Link href="/home" className="text-sm text-ink/40">
          ← 돌아가기
        </Link>
        <p className="font-display text-lg">💬 대화모드</p>
        <span className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-3xl border-2 border-duo-gray bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.role === "user" ? "bg-duo-blue text-white" : "bg-duo-gray/60 text-ink"
              }`}
            >
              {m.role === "ai" && <span className="mr-1">🤖</span>}
              {m.text}
            </div>
            {m.correction && (
              <div className="mt-1 max-w-[80%] rounded-xl bg-duo-yellow/20 px-3 py-1 text-xs text-duo-yellow-dark">
                💡 이렇게 말하면 더 자연스러워요: <span className="font-bold">{m.correction}</span>
              </div>
            )}
          </div>
        ))}
        {sending && <p className="text-sm text-ink/40">AI 친구가 답장 쓰는 중...</p>}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="한국어로 메시지를 입력하세요..."
          className="flex-1 rounded-2xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-green"
        />
        <Button type="submit" fullWidth={false} disabled={sending || !input.trim()}>
          전송
        </Button>
      </form>
    </div>
  );
}
