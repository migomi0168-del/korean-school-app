import { getAccessory } from "@/lib/accessories";

export const AVATAR_CHOICES = ["🦊", "🐻", "🐰", "🐼", "🐯", "🦁", "🐸", "🐧"];

const SIZE_CLASSES = {
  sm: { box: "w-10 h-10 text-xl", accessory: "text-base" },
  md: { box: "w-16 h-16 text-3xl", accessory: "text-xl" },
  lg: { box: "w-24 h-24 text-5xl", accessory: "text-3xl" },
};

const POSITION_CLASSES = {
  top: "-top-2 left-1/2 -translate-x-1/2 -rotate-6",
  center: "top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2",
  bottom: "-bottom-1 left-1/2 -translate-x-1/2",
  corner: "-bottom-1 -right-1",
};

export function Avatar({
  emoji,
  size = "md",
  accessoryId,
}: {
  emoji: string | null;
  size?: "sm" | "md" | "lg";
  accessoryId?: string | null;
}) {
  const sizes = SIZE_CLASSES[size];
  const accessory = getAccessory(accessoryId);

  return (
    <div className={`relative ${sizes.box}`}>
      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-duo-gray bg-white">
        {emoji ?? "❓"}
      </div>
      {accessory && (
        <span className={`absolute ${sizes.accessory} ${POSITION_CLASSES[accessory.position]} drop-shadow`}>
          {accessory.emoji}
        </span>
      )}
    </div>
  );
}
