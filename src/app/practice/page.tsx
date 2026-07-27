"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { TTSButton } from "@/components/learn/TTSButton";
import { NativeText } from "@/components/common/NativeText";
import { useStudentSession } from "@/hooks/useStudentSession";
import { setDailyMissions, completeMission, undoMission } from "@/lib/students";
import { levelFromXp, todayStr } from "@/lib/xp";
import { getMission, getMissionExamples, pickDailyMissionIds } from "@/lib/missions";
import { t } from "@/lib/i18n";

const PRACTICE_REWARD = 20; // 5 completions ≈ 100 xp ≈ 1 level

export default function PracticePage() {
  const { student, loading, refresh } = useStudentSession();
  const router = useRouter();
  const [openExampleId, setOpenExampleId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const today = todayStr();

  useEffect(() => {
    if (!student || rolling) return;
    if (student.practiceDate === today && student.practiceOptionIds.length > 0) return;
    setRolling(true);
    setDailyMissions(student.id, today, pickDailyMissionIds(today)).then(refresh).finally(() => setRolling(false));
  }, [student, today, rolling, refresh]);

  if (loading) return null;
  if (!student) {
    router.push("/login");
    return null;
  }

  const optionIds = student.practiceDate === today ? student.practiceOptionIds : [];
  const checkedToday = student.practiceDate === today ? student.practiceChecked : [];
  const todaysMissions = optionIds.map((id) => getMission(id)).filter((m): m is NonNullable<typeof m> => m !== null);

  async function handleComplete(missionId: string) {
    if (!student) return;
    setBusyId(missionId);
    const prevLevel = levelFromXp(student.xp);
    await completeMission(student.id, missionId, PRACTICE_REWARD);
    await refresh();
    const newLevel = levelFromXp(student.xp + PRACTICE_REWARD);
    setToast(newLevel > prevLevel ? "레벨 업! 🏆" : `+${PRACTICE_REWARD} 포인트 획득! 💰`);
    setBusyId(null);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleUndo(missionId: string) {
    if (!student) return;
    setBusyId(missionId);
    await undoMission(student.id, missionId, PRACTICE_REWARD);
    await refresh();
    setBusyId(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/home" className="text-sm text-ink/40">
        ← 돌아가기
      </Link>
      <h1 className="text-center font-display text-2xl">🌟 오늘의 실천 미션</h1>
      <p className="text-center text-sm text-ink/50"><NativeText text={t("practiceIntro", student.nativeLanguage)} lang={student.nativeLanguage} /></p>
      <p className="text-center text-xs text-ink/40">
        미션 1개 완료할 때마다 +{PRACTICE_REWARD} 포인트 &amp; XP · 5개 성공하면 레벨 1개 상승!
        (지금까지 {student.practiceSuccessCount}개 성공)
      </p>

      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border-2 border-duo-yellow bg-white px-4 py-2 font-display text-sm shadow-lg">
          {toast}
        </div>
      )}

      {rolling || todaysMissions.length === 0 ? (
        <Card className="text-center text-sm text-ink/50">오늘의 미션을 준비하고 있어요...</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {todaysMissions.map((m) => {
            const done = checkedToday.includes(m.id);
            const isOpen = openExampleId === m.id;
            const examples = getMissionExamples(m);
            return (
              <Card key={m.id} className={done ? "border-duo-green bg-duo-green/5" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold">{m.ko}</p>
                  </div>
                  <button
                    onClick={() => setOpenExampleId(isOpen ? null : m.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-duo-blue text-sm font-bold text-duo-blue-dark"
                    aria-label="설명 보기"
                  >
                    ?
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl bg-duo-blue/10 p-3">
                    <p className="text-sm text-ink">
                      <NativeText text={m.translations[student.nativeLanguage ?? "en"]} lang={student.nativeLanguage} />
                    </p>
                    {examples.length > 0 && (
                      <>
                        <p className="mt-1 text-xs font-bold text-duo-blue-dark">
                          <NativeText text={t("practiceExampleLabel", student.nativeLanguage)} lang={student.nativeLanguage} />
                        </p>
                        {examples.map((ex) => (
                          <div key={ex.id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-ink">{ex.emoji} {ex.ko}</p>
                              <TTSButton text={ex.ko} size="sm" />
                            </div>
                            <p className="text-xs text-ink/50">
                              <NativeText text={ex.translations[student.nativeLanguage ?? "en"]} lang={student.nativeLanguage} />
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => (done ? handleUndo(m.id) : handleComplete(m.id))}
                  disabled={busyId === m.id}
                  className={`mt-3 w-full rounded-2xl border-2 py-2 text-sm font-bold ${
                    done
                      ? "border-duo-green bg-duo-green text-white"
                      : "border-duo-pink bg-duo-pink/10 text-duo-pink-dark"
                  }`}
                >
                  {busyId === m.id
                    ? "저장 중..."
                    : done
                      ? "완료했어요! ✅ (다시 누르면 취소)"
                      : `실천했어요! (+${PRACTICE_REWARD}P)`}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
