import type { ReactNode } from "react";

// Content authors write Japanese text with inline furigana as 漢字[かんじ] —
// a run of kanji immediately followed by its hiragana reading in brackets.
// This turns that into real <ruby>/<rt> elements so kanji-uncomfortable
// students can still read the word aloud.
const FURIGANA_PATTERN = /([一-鿿]+)\[([぀-ゟ]+)\]/g;

export function parseFurigana(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  FURIGANA_PATTERN.lastIndex = 0;
  while ((match = FURIGANA_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <ruby key={key++}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
