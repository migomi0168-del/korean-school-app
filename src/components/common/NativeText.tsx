import { parseFurigana } from "@/lib/furigana";
import type { NativeLanguage } from "@/types";

// Wraps any native-language string that's shown to a student. For Japanese
// it renders inline 漢字[かんじ] annotations as real furigana; every other
// language just renders the text as-is.
export function NativeText({ text, lang }: { text: string; lang: NativeLanguage | null | undefined }) {
  if (lang === "ja") return <>{parseFurigana(text)}</>;
  return <>{text}</>;
}
