"use client";

import { useEffect, useRef, useState } from "react";

// Minimal shape of the Web Speech API's SpeechRecognition — not in
// lib.dom.d.ts, and only Chrome/Edge/Safari ship it (behind the webkit
// prefix in most), so this is best-effort progressive enhancement rather
// than a feature the app depends on.
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function MicButton({ onResult, disabled }: { onResult: (text: string) => void; disabled?: boolean }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  if (!supported) return null;

  function handleClick() {
    if (listening || disabled) return;
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      onResult(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="음성으로 입력하기"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl disabled:opacity-40 ${
        listening ? "animate-pulse border-duo-red bg-duo-red/10" : "border-duo-gray bg-white"
      }`}
    >
      {listening ? "🔴" : "🎤"}
    </button>
  );
}
