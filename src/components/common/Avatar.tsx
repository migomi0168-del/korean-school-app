export const AVATAR_CHOICES = ["🦊", "🐻", "🐰", "🐼", "🐯", "🦁", "🐸", "🐧"];

export function Avatar({ emoji, size = "md" }: { emoji: string | null; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-24 h-24 text-5xl" : size === "sm" ? "w-10 h-10 text-xl" : "w-16 h-16 text-3xl";
  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full border-2 border-duo-gray bg-white`}
    >
      {emoji ?? "❓"}
    </div>
  );
}
