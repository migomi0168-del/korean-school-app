"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { useStudentSession } from "@/hooks/useStudentSession";
import { accessories } from "@/lib/accessories";
import { furniture } from "@/lib/furniture";
import { roomColors, getRoomBackgroundStyle } from "@/lib/roomColors";
import { buyAccessory, buyFurniture, buyRoomColor, selectRoomColor, updateStudent } from "@/lib/students";

type Tab = "accessory" | "furniture" | "color";

const TABS: { id: Tab; label: string }[] = [
  { id: "accessory", label: "👑 액세서리" },
  { id: "furniture", label: "🛋️ 가구" },
  { id: "color", label: "🎨 방 색깔" },
];

export default function ShopPage() {
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("accessory");
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  async function run(id: string, action: () => Promise<unknown>) {
    setBusy(id);
    await action();
    await refresh();
    setBusy(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/mypage" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🛍️ 상점</h1>
      <p className="text-center font-display text-lg text-duo-yellow-dark">💰 내 포인트: {student.points}</p>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-2xl border-2 py-2 text-sm font-bold ${
              tab === t.id ? "border-duo-green bg-duo-green/10" : "border-duo-gray bg-white text-ink/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "accessory" && (
        <Card>
          <div className="grid grid-cols-2 gap-3">
            {accessories.map((a) => {
              const owned = student.ownedAccessories.includes(a.id);
              const equipped = student.equippedAccessory === a.id;
              const canAfford = student.points >= a.price;
              return (
                <div key={a.id} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-duo-gray p-3 text-center">
                  <span className="text-4xl">{a.emoji}</span>
                  <span className="text-sm font-bold">{a.name}</span>
                  {owned ? (
                    <button
                      onClick={() =>
                        run(a.id, () => updateStudent(student.id, { equippedAccessory: equipped ? null : a.id }))
                      }
                      disabled={busy === a.id}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold ${
                        equipped ? "bg-duo-green text-white" : "bg-duo-gray/30 text-ink"
                      }`}
                    >
                      {equipped ? "장착됨 ✅" : "장착하기"}
                    </button>
                  ) : (
                    <button
                      onClick={() => run(a.id, () => buyAccessory(student.id, a.id, a.price))}
                      disabled={!canAfford || busy === a.id}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold ${
                        canAfford ? "bg-duo-yellow text-ink" : "bg-duo-gray/30 text-ink/40"
                      }`}
                    >
                      💰{a.price} 구매
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "furniture" && (
        <Card>
          <div className="grid grid-cols-2 gap-3">
            {furniture.map((f) => {
              const owned = student.ownedFurniture.includes(f.id);
              const canAfford = student.points >= f.price;
              return (
                <div key={f.id} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-duo-gray p-3 text-center">
                  <span className="text-4xl">{f.emoji}</span>
                  <span className="text-sm font-bold">{f.name}</span>
                  {owned ? (
                    <span className="w-full rounded-xl bg-duo-green/20 px-3 py-2 text-xs font-bold text-duo-green-dark">
                      보유 중 ✅
                    </span>
                  ) : (
                    <button
                      onClick={() => run(f.id, () => buyFurniture(student.id, f.id, f.price))}
                      disabled={!canAfford || busy === f.id}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold ${
                        canAfford ? "bg-duo-yellow text-ink" : "bg-duo-gray/30 text-ink/40"
                      }`}
                    >
                      💰{f.price} 구매
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "color" && (
        <Card>
          <div className="grid grid-cols-2 gap-3">
            {roomColors.map((c) => {
              const owned = c.price === 0 || student.ownedRoomColors.includes(c.id);
              const applied = (student.roomColor ?? "sky") === c.id;
              const canAfford = student.points >= c.price;
              return (
                <div key={c.id} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-duo-gray p-3 text-center">
                  <div style={getRoomBackgroundStyle(c)} className="h-12 w-full rounded-xl" />
                  <span className="text-sm font-bold">{c.name}</span>
                  {owned ? (
                    <button
                      onClick={() => run(c.id, () => selectRoomColor(student.id, c.id))}
                      disabled={applied || busy === c.id}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold ${
                        applied ? "bg-duo-green text-white" : "bg-duo-gray/30 text-ink"
                      }`}
                    >
                      {applied ? "적용됨 ✅" : "적용하기"}
                    </button>
                  ) : (
                    <button
                      onClick={() => run(c.id, () => buyRoomColor(student.id, c.id, c.price))}
                      disabled={!canAfford || busy === c.id}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold ${
                        canAfford ? "bg-duo-yellow text-ink" : "bg-duo-gray/30 text-ink/40"
                      }`}
                    >
                      💰{c.price} 구매
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
