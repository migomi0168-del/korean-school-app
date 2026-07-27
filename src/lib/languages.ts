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
