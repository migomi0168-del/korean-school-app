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
    streakCount: (data.streakCount as number) ?? 0,
    lastAttendanceDate: (data.lastAttendanceDate as string) ?? null,
    wrongWordIds: (data.wrongWordIds as string[]) ?? [],
    wrongPhraseIds: (data.wrongPhraseIds as string[]) ?? [],
    escapeCleared: (data.escapeCleared as string[]) ?? [],
    practiceDate: (data.practiceDate as string) ?? null,
    practiceChecked: (data.practiceChecked as string[]) ?? [],
    equippedAccessory: (data.equippedAccessory as string) ?? null,
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
    streakCount: 0,
    lastAttendanceDate: null,
    wrongWordIds: [],
    wrongPhraseIds: [],
    escapeCleared: [],
    practiceDate: null,
    practiceChecked: [],
    equippedAccessory: null,
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
  await updateDoc(doc(db, "students", studentId), data);
}

// Atomic, immediate per-answer writes (arrayUnion/increment) instead of
// batching everything until a session's last question. A student quitting
// partway through used to silently lose every wrong answer before that
// point since the old flow only wrote once at the end.
export async function addXp(studentId: string, amount: number) {
  await updateDoc(doc(db, "students", studentId), { xp: increment(amount) });
}

export async function recordWrongWord(studentId: string, wordId: string) {
  await updateDoc(doc(db, "students", studentId), { wrongWordIds: arrayUnion(wordId) });
}

export async function clearWrongWord(studentId: string, wordId: string) {
  await updateDoc(doc(db, "students", studentId), { wrongWordIds: arrayRemove(wordId) });
}

export async function recordWrongPhrase(studentId: string, phraseId: string) {
  await updateDoc(doc(db, "students", studentId), { wrongPhraseIds: arrayUnion(phraseId) });
}

export async function clearWrongPhrase(studentId: string, phraseId: string) {
  await updateDoc(doc(db, "students", studentId), { wrongPhraseIds: arrayRemove(phraseId) });
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
