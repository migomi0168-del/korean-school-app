"use client";

import { useState } from "react";
import { updateStudent } from "@/lib/students";
import type { Accessory } from "@/types";

export function UnlockNotice({ accessories, studentId }: { accessories: Accessory[]; studentId: string }) {
  const [equipped, setEquipped] = useState<string | null>(null);

  if (accessories.length === 0) return null;

  function handleEquip(id: string) {
    updateStudent(studentId, { equippedAccessory: id });
    setEquipped(id);
  }

  return (
    <div className="rounded-2xl border-2 border-duo-yellow bg-duo-yellow/10 p-4">
      <p className="font-display text-sm text-duo-yellow-dark">🎁 새 아이템 획득! 지금 착용해볼까요?</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {accessories.map((a) => (
          <button
            key={a.id}
            onClick={() => handleEquip(a.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2 ${
              equipped === a.id ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white"
            }`}
          >
            <span className="text-3xl">{a.emoji}</span>
            <span className="text-[10px] font-bold text-ink/60">
              {equipped === a.id ? "착용됨 ✅" : a.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
