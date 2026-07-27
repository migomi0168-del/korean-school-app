import type { NativeLanguage } from "@/types";

export const LANGUAGES: { code: NativeLanguage; label: string; emoji: string }[] = [
  { code: "zh", label: "중국어 / 中文", emoji: "🇨🇳" },
  { code: "en", label: "영어 / English", emoji: "🇺🇸" },
  { code: "vi", label: "베트남어 / Tiếng Việt", emoji: "🇻🇳" },
  { code: "ja", label: "일본어 / 日本語", emoji: "🇯🇵" },
];

export function getLanguage(code: NativeLanguage | null) {
  return LANGUAGES.find((l) => l.code === code) ?? null;
}

// BCP-47 tags for the Web Speech API's SpeechRecognition (STT), used when a
// student wants to dictate in their native language instead of Korean.
export const STT_LANG: Record<NativeLanguage, string> = {
  zh: "zh-CN",
  en: "en-US",
  vi: "vi-VN",
  ja: "ja-JP",
};
