import { getSection } from "@/lib/content";

export function ContextTag({ categoryId }: { categoryId: string }) {
  const section = getSection(categoryId);
  if (!section) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-duo-blue/10 px-3 py-1 text-xs font-bold text-duo-blue-dark">
      {section.emoji} {section.name}에서 쓰는 말이에요
    </span>
  );
}
