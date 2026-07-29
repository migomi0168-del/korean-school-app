import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isDemoId, updateDemoStudent } from "@/lib/demoStore";
import type { NativeLanguage, Student } from "@/types";

const studentsCol = collection(db, "students");

function randomPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function pinExists(pin: string) {
  const q = query(studentsCol, where("pinCode", "==", pin), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

async function generateUniquePin() {
  let pin = randomPin();
  let tries = 0;
  while (await pinExists(pin) && tries < 10) {
    pin = randomPin();
    tries += 1;
  }
  return pin;
}

function toStudent(id: string, data: Record<string, unknown>): Student {
  return {
    id,
    classId: data.classId as string,
    pinCode: data.pinCode as string,
    nickname: data.nickname as string,
    avatar: (data.avatar as string) ?? null,
    nativeLanguage: (data.nativeLanguage as NativeLanguage) ?? null,
    grade: data.grade as number,
    xp: (data.xp as number) ?? 0,
    points: (data.points as number) ?? 0,
    streakCount: (data.streakCount as number) ?? 0,
    lastAttendanceDate: (data.lastAttendanceDate as string) ?? null,
    wrongWordIds: (data.wrongWordIds as string[]) ?? [],
    wrongPhraseIds: (data.wrongPhraseIds as string[]) ?? [],
    escapeCleared: (data.escapeCleared as string[]) ?? [],
    practiceDate: (data.practiceDate as string) ?? null,
    practiceChecked: (data.practiceChecked as string[]) ?? [],
    practiceOptionIds: (data.practiceOptionIds as string[]) ?? [],
    practiceSuccessCount: (data.practiceSuccessCount as number) ?? 0,
    equippedAccessory: (data.equippedAccessory as string) ?? null,
    ownedAccessories: (data.ownedAccessories as string[]) ?? [],
    ownedFurniture: (data.ownedFurniture as string[]) ?? [],
    ownedRoomColors: (data.ownedRoomColors as string[]) ?? [],
    roomColor: (data.roomColor as string) ?? null,
    teacherMessage: (data.teacherMessage as Student["teacherMessage"]) ?? null,
    lastChatLog: (data.lastChatLog as Student["lastChatLog"]) ?? null,
    formalMistakeCount: (data.formalMistakeCount as number) ?? 0,
    studyDate: (data.studyDate as string) ?? null,
    studyMinutesToday: (data.studyMinutesToday as number) ?? 0,
    peerMessages: (data.peerMessages as Student["peerMessages"]) ?? [],
    lastSeenPeerMessageAt: (data.lastSeenPeerMessageAt as number) ?? 0,
    proficiencyTier: (data.proficiencyTier as Student["proficiencyTier"]) ?? null,
    diagnosticCorrect: (data.diagnosticCorrect as number) ?? null,
    teacherAssignment: (data.teacherAssignment as Student["teacherAssignment"]) ?? null,
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export async function createStudent(params: { classId: string; nickname: string; grade: number }) {
  const pinCode = await generateUniquePin();
  const docRef = await addDoc(studentsCol, {
    classId: params.classId,
    pinCode,
    nickname: params.nickname,
    grade: params.grade,
    nativeLanguage: null,
    avatar: null,
    xp: 0,
    points: 0,
    streakCount: 0,
    lastAttendanceDate: null,
    wrongWordIds: [],
    wrongPhraseIds: [],
    escapeCleared: [],
    practiceDate: null,
    practiceChecked: [],
    practiceOptionIds: [],
    practiceSuccessCount: 0,
    equippedAccessory: null,
    ownedAccessories: [],
    ownedFurniture: [],
    ownedRoomColors: [],
    roomColor: null,
    teacherMessage: null,
    lastChatLog: null,
    formalMistakeCount: 0,
    studyDate: null,
    studyMinutesToday: 0,
    peerMessages: [],
    lastSeenPeerMessageAt: 0,
    proficiencyTier: null,
    diagnosticCorrect: null,
    teacherAssignment: null,
    createdAt: Date.now(),
  });
  return toStudent(docRef.id, { classId: params.classId, pinCode, nickname: params.nickname, grade: params.grade });
}

export async function loginWithPin(pin: string): Promise<Student | null> {
  const q = query(studentsCol, where("pinCode", "==", pin), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toStudent(d.id, d.data());
}

export async function updateStudent(studentId: string, data: Partial<Student>) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, ...data }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), data);
}

// Atomic, immediate per-answer writes (arrayUnion/increment) instead of
// batching everything until a session's last question. A student quitting
// partway through used to silently lose every wrong answer before that
// point since the old flow only wrote once at the end.
// Points are granted 1:1 alongside XP for every learning activity; XP still
// drives levels, points are the separate spendable balance for the shop.
export async function addXp(studentId: string, amount: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, xp: s.xp + amount, points: s.points + amount }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { xp: increment(amount), points: increment(amount) });
}

export async function spendPoints(studentId: string, amount: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, points: s.points - amount }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { points: increment(-amount) });
}

export async function buyAccessory(studentId: string, accessoryId: string, price: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      points: s.points - price,
      ownedAccessories: s.ownedAccessories.includes(accessoryId) ? s.ownedAccessories : [...s.ownedAccessories, accessoryId],
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    points: increment(-price),
    ownedAccessories: arrayUnion(accessoryId),
  });
}

export async function buyFurniture(studentId: string, furnitureId: string, price: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      points: s.points - price,
      ownedFurniture: s.ownedFurniture.includes(furnitureId) ? s.ownedFurniture : [...s.ownedFurniture, furnitureId],
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    points: increment(-price),
    ownedFurniture: arrayUnion(furnitureId),
  });
}

export async function buyRoomColor(studentId: string, colorId: string, price: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      points: s.points - price,
      ownedRoomColors: s.ownedRoomColors.includes(colorId) ? s.ownedRoomColors : [...s.ownedRoomColors, colorId],
      roomColor: colorId,
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    points: increment(-price),
    ownedRoomColors: arrayUnion(colorId),
    roomColor: colorId,
  });
}

export async function selectRoomColor(studentId: string, colorId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, roomColor: colorId }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { roomColor: colorId });
}

// Counts an answer that was correct in meaning but not polite enough during
// 자기설계학습 with a 선생님 partner — feeds the AI 추천학습 recommendation.
export async function recordFormalMistake(studentId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, formalMistakeCount: s.formalMistakeCount + 1 }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { formalMistakeCount: increment(1) });
}

export async function setDailyMissions(studentId: string, dateStr: string, optionIds: string[]) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, practiceDate: dateStr, practiceOptionIds: optionIds, practiceChecked: [] }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    practiceDate: dateStr,
    practiceOptionIds: optionIds,
    practiceChecked: [],
  });
}

export async function completeMission(studentId: string, missionId: string, reward: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      practiceChecked: s.practiceChecked.includes(missionId) ? s.practiceChecked : [...s.practiceChecked, missionId],
      practiceSuccessCount: s.practiceSuccessCount + 1,
      xp: s.xp + reward,
      points: s.points + reward,
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    practiceChecked: arrayUnion(missionId),
    practiceSuccessCount: increment(1),
    xp: increment(reward),
    points: increment(reward),
  });
}

// Undoes a mistaken tap: reverses exactly what completeMission granted.
export async function undoMission(studentId: string, missionId: string, reward: number) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      practiceChecked: s.practiceChecked.filter((id) => id !== missionId),
      practiceSuccessCount: Math.max(0, s.practiceSuccessCount - 1),
      xp: Math.max(0, s.xp - reward),
      points: Math.max(0, s.points - reward),
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), {
    practiceChecked: arrayRemove(missionId),
    practiceSuccessCount: increment(-1),
    xp: increment(-reward),
    points: increment(-reward),
  });
}

export async function sendTeacherMessage(studentId: string, text: string, bonusPoints: number) {
  const updates: Record<string, unknown> = {
    teacherMessage: { text, points: bonusPoints, sentAt: Date.now(), read: false },
  };
  if (bonusPoints > 0) {
    updates.points = increment(bonusPoints);
  }
  await updateDoc(doc(db, "students", studentId), updates);
}

export async function acknowledgeTeacherMessage(studentId: string) {
  await updateDoc(doc(db, "students", studentId), { "teacherMessage.read": true });
}

// Lets a teacher self-serve a forgotten/lost PIN instead of needing a direct
// database edit, reusing the same uniqueness check createStudent relies on.
export async function resetStudentPin(studentId: string): Promise<string> {
  const pinCode = await generateUniquePin();
  await updateDoc(doc(db, "students", studentId), { pinCode });
  return pinCode;
}

// Lets a teacher push "today's focus" to one or more students at once,
// instead of only ever relying on each student's own auto-picked weak spot.
export async function assignTeacherContent(studentIds: string[], situationId: string, label: string) {
  const assignment = { situationId, label, assignedAt: Date.now(), completed: false };
  await Promise.all(
    studentIds.map((id) => updateDoc(doc(db, "students", id), { teacherAssignment: assignment }))
  );
}

export async function clearTeacherAssignment(studentId: string) {
  await updateDoc(doc(db, "students", studentId), { teacherAssignment: null });
}

export async function completeTeacherAssignment(studentId: string) {
  await updateDoc(doc(db, "students", studentId), { "teacherAssignment.completed": true });
}

export async function recordWrongWord(studentId: string, wordId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      wrongWordIds: s.wrongWordIds.includes(wordId) ? s.wrongWordIds : [...s.wrongWordIds, wordId],
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { wrongWordIds: arrayUnion(wordId) });
}

export async function clearWrongWord(studentId: string, wordId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, wrongWordIds: s.wrongWordIds.filter((id) => id !== wordId) }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { wrongWordIds: arrayRemove(wordId) });
}

export async function recordWrongPhrase(studentId: string, phraseId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({
      ...s,
      wrongPhraseIds: s.wrongPhraseIds.includes(phraseId) ? s.wrongPhraseIds : [...s.wrongPhraseIds, phraseId],
    }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { wrongPhraseIds: arrayUnion(phraseId) });
}

export async function clearWrongPhrase(studentId: string, phraseId: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) => ({ ...s, wrongPhraseIds: s.wrongPhraseIds.filter((id) => id !== phraseId) }));
    return;
  }
  await updateDoc(doc(db, "students", studentId), { wrongPhraseIds: arrayRemove(phraseId) });
}

// Approximate "study time" heartbeat: the caller (a tracker mounted once at
// the app root) already has the student's live studyDate via onSnapshot, so
// it decides reset-vs-increment itself rather than requiring a read here.
export async function bumpStudyMinutes(studentId: string, currentStudyDate: string | null, today: string) {
  if (isDemoId(studentId)) {
    updateDemoStudent((s) =>
      s.studyDate !== today
        ? { ...s, studyDate: today, studyMinutesToday: 1 }
        : { ...s, studyMinutesToday: s.studyMinutesToday + 1 }
    );
    return;
  }
  if (currentStudyDate !== today) {
    await updateDoc(doc(db, "students", studentId), { studyDate: today, studyMinutesToday: 1 });
  } else {
    await updateDoc(doc(db, "students", studentId), { studyMinutesToday: increment(1) });
  }
}

export async function sendPeerMessage(toId: string, fromId: string, fromNickname: string, text: string) {
  await updateDoc(doc(db, "students", toId), {
    peerMessages: arrayUnion({ from: fromId, fromNickname, text, sentAt: Date.now() }),
  });
}

export async function markPeerMessagesSeen(studentId: string) {
  await updateDoc(doc(db, "students", studentId), { lastSeenPeerMessageAt: Date.now() });
}

export async function listStudentsForClass(classId: string): Promise<Student[]> {
  const q = query(studentsCol, where("classId", "==", classId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toStudent(d.id, d.data()));
}

export function subscribeToClassStudents(classId: string, onChange: (students: Student[]) => void) {
  const q = query(studentsCol, where("classId", "==", classId));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => toStudent(d.id, d.data())));
  });
}

export function subscribeToStudent(studentId: string, onChange: (student: Student | null) => void) {
  return onSnapshot(doc(db, "students", studentId), (snap) => {
    onChange(snap.exists() ? toStudent(snap.id, snap.data()) : null);
  });
}
