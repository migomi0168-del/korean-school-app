"use client";

import { useTTS } from "@/hooks/useTTS";

export function TTSButton({ text, size = "md" }: { text: string; size?: "sm" | "md" }) {
  const { speak } = useTTS();
  const sizeClass = size === "sm" ? "w-9 h-9 text-lg" : "w-12 h-12 text-2xl";
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label="발음 듣기"
      className={`${sizeClass} flex items-center justify-center rounded-full bg-duo-blue text-white shadow active:scale-95`}
    >
      🔊
    </button>
  );
}
