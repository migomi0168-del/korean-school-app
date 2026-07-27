// Best-effort blocklist for free-text peer messages between students — not
// exhaustive moderation, just a basic safety net so an obviously inappropriate
// word can't be sent. Checked against the message with spaces stripped so
// spaced-out attempts to dodge it still get caught.
const BANNED_WORDS = [
  "시발", "씨발", "개새끼", "병신", "지랄", "미친놈", "미친년", "죽어", "닥쳐",
  "fuck", "shit", "bitch", "asshole", "idiot", "stupid",
];

export function containsBannedWord(text: string): boolean {
  const collapsed = text.replace(/\s+/g, "").toLowerCase();
  return BANNED_WORDS.some((w) => collapsed.includes(w));
}
