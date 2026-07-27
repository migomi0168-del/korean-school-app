"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { MicButton } from "@/components/learn/MicButton";
import { TTSButton } from "@/components/learn/TTSButton";
import { useStudentSession } from "@/hooks/useStudentSession";
import { updateStudent } from "@/lib/students";
import { registerHomeGuard } from "@/lib/navGuard";
import { t } from "@/lib/i18n";
import { getLanguage, STT_LANG } from "@/lib/languages";

interface Message {
  role: "user" | "ai";
  text: string;
  correction?: string | null;
  translated?: boolean;
}

const PARTNERS = ["친구", "선생님", "기타"] as const;
const LOCATIONS = ["교실", "복도 또는 운동장", "보건실", "급식실", "도서관", "기타"] as const;

function buildOpener(partner: string, location: string) {
  if (partner.includes("선생님")) {
    return `안녕하세요! 저는 지금 ${location}에 있어요. 오늘 저랑 이야기 나눠볼까요?`;
  }
  return `안녕! 나 지금 ${location}에 있어! 오늘 나랑 무슨 얘기할까?`;
}

export default function ChatPage() {
  const { student, loading } = useStudentSession();
  const router = useRouter();

  const [partner, setPartner] = useState<(typeof PARTNERS)[number] | null>(null);
  const [customPartner, setCustomPartner] = useState("");
  const [location, setLocation] = useState<(typeof LOCATIONS)[number] | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [started, setStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"ko" | "native">("ko");
  const [showExitModal, setShowExitModal] = useState(false);

  const hasConversation = started && messages.length > 1;

  useEffect(() => {
    if (!hasConversation) {
      registerHomeGuard(null);
      return;
    }
    registerHomeGuard(() => setShowExitModal(true));
    return () => registerHomeGuard(null);
  }, [hasConversation]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const partnerLabel = partner === "기타" ? customPartner.trim() : partner ?? "";
  const locationLabel = location === "기타" ? customLocation.trim() : location ?? "";
  const canStart = !!partnerLabel && !!locationLabel;

  function handleStart() {
    if (!canStart) return;
    setMessages([{ role: "ai", text: buildOpener(partnerLabel, locationLabel) }]);
    setStarted(true);
  }

  async function handleSaveAndExit() {
    if (student) {
      await updateStudent(student.id, {
        lastChatLog: {
          partner: partnerLabel,
          location: locationLabel,
          messages: messages.map((m) => ({ role: m.role, text: m.text })),
          savedAt: Date.now(),
        },
      });
    }
    router.push("/home");
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
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          partner: partnerLabel,
          location: locationLabel,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "ai", text: "미안, 지금은 대답하기 어려워. 다시 말해줄래?" }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply, correction: data.correction, translated: data.translated }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "연결에 문제가 생겼어. 잠시 후 다시 시도해줘." }]);
    } finally {
      setSending(false);
    }
  }

  if (!started) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Link href="/home" className="text-sm text-ink/40">
          ← 돌아가기
        </Link>
        <h1 className="text-center font-display text-2xl">💬 대화모드</h1>

        <Card>
          <p className="mb-3 font-display text-lg">누구와 대화할까요?</p>
          <div className="flex flex-col gap-2">
            {PARTNERS.map((p) => (
              <button
                key={p}
                onClick={() => setPartner(p)}
                className={`rounded-2xl border-2 px-4 py-3 text-left font-bold ${
                  partner === p ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
                }`}
              >
                {p === "친구" ? "🧒 친구" : p === "선생님" ? "🧑‍🏫 선생님" : "✏️ 기타 (직접 입력)"}
              </button>
            ))}
            {partner === "기타" && (
              <input
                value={customPartner}
                onChange={(e) => setCustomPartner(e.target.value)}
                placeholder="예: 급식실 조리사님"
                className="rounded-2xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-green"
              />
            )}
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-display text-lg">어디에서 대화할까요?</p>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map((l) => (
              <button
                key={l}
                onClick={() => setLocation(l)}
                className={`rounded-2xl border-2 px-3 py-3 text-sm font-bold ${
                  location === l ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {location === "기타" && (
            <input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="예: 음악실"
              className="mt-2 w-full rounded-2xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-green"
            />
          )}
        </Card>

        <Button onClick={handleStart} disabled={!canStart} variant="pink">
          대화 시작하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setStarted(false)} className="text-sm text-ink/40">
          ← 다시 설정하기
        </button>
        <p className="font-display text-sm text-ink/60">{partnerLabel} · {locationLabel}</p>
        <span className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-3xl border-2 border-duo-gray bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`flex max-w-[80%] items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  m.role === "user" ? "bg-duo-blue text-white" : "bg-duo-gray/60 text-ink"
                }`}
              >
                {m.role === "ai" && <span className="mr-1">🤖</span>}
                {m.text}
              </div>
              {m.role === "ai" && <TTSButton text={m.text} size="sm" />}
            </div>
            {m.correction && (
              <div className="mt-1 max-w-[80%] rounded-xl bg-duo-yellow/20 px-3 py-1 text-xs text-duo-yellow-dark">
                {m.translated ? "🌐" : "💡"} {t(m.translated ? "translatedLabel" : "correctionLabel", student.nativeLanguage)}{" "}
                <span className="font-bold">{m.correction}</span>
              </div>
            )}
          </div>
        ))}
        {sending && <p className="text-sm text-ink/40">AI가 답장 쓰는 중...</p>}
      </div>

      {student.nativeLanguage && (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setVoiceLang("ko")}
            className={`rounded-full border-2 px-3 py-1 font-bold ${
              voiceLang === "ko" ? "border-duo-green bg-duo-green/10 text-duo-green-dark" : "border-duo-gray text-ink/40"
            }`}
          >
            🇰🇷 한국어로 말하기
          </button>
          <button
            type="button"
            onClick={() => setVoiceLang("native")}
            className={`rounded-full border-2 px-3 py-1 font-bold ${
              voiceLang === "native" ? "border-duo-green bg-duo-green/10 text-duo-green-dark" : "border-duo-gray text-ink/40"
            }`}
          >
            {getLanguage(student.nativeLanguage)?.emoji} 모국어로 말하기
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="한국어 또는 모국어로 메시지를 입력하세요..."
          className="flex-1 rounded-2xl border-2 border-duo-gray px-4 py-3 outline-none focus:border-duo-green"
        />
        <MicButton
          onResult={setInput}
          disabled={sending}
          lang={voiceLang === "native" && student.nativeLanguage ? STT_LANG[student.nativeLanguage] : "ko-KR"}
        />
        <Button type="submit" fullWidth={false} disabled={sending || !input.trim()}>
          전송
        </Button>
      </form>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="flex w-full max-w-xs flex-col gap-3 rounded-3xl bg-white p-5 text-center shadow-lg">
            <p className="font-display text-lg">지금까지의 대화를 저장할까요?</p>
            <Button variant="green" onClick={handleSaveAndExit}>
              대화 저장하고 나가기
            </Button>
            <Button variant="gray" onClick={() => router.push("/home")}>
              저장 안 하고 나가기
            </Button>
            <button onClick={() => setShowExitModal(false)} className="text-sm text-ink/40 underline">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
