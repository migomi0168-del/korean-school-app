import { sections } from "@/lib/content";

export interface AssignmentOption {
  id: string; // a section id, or "formal" for the polite-speech drill
  label: string;
}

export const ASSIGNMENT_OPTIONS: AssignmentOption[] = [
  ...sections.map((s) => ({ id: s.id, label: `${s.emoji} ${s.name}` })),
  { id: "formal", label: "🙏 존댓말 연습" },
];

// Where "지금 풀기" on the student's assignment banner should send them.
export function getAssignmentHref(situationId: string, next: string) {
  if (situationId === "formal") {
    return `/learn/custom?auto=formal&next=${encodeURIComponent(next)}&fromAssignment=1`;
  }
  return `/learn/sentence?category=${situationId}&next=${encodeURIComponent(next)}&fromAssignment=1`;
}
