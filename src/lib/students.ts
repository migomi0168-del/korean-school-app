import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NativeLanguage, Student, UnitProgress } from "@/types";

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
    nativeLanguage: data.nativeLanguage as NativeLanguage,
    grade: data.grade as number,
    xp: (data.xp as number) ?? 0,
    streakCount: (data.streakCount as number) ?? 0,
    lastAttendanceDate: (data.lastAttendanceDate as string) ?? null,
    progress: (data.progress as Record<string, UnitProgress>) ?? {},
    createdAt: (data.createdAt as number) ?? Date.now(),
  };
}

export async function createStudent(params: {
  classId: string;
  nickname: string;
  grade: number;
  nativeLanguage: NativeLanguage;
}) {
  const pinCode = await generateUniquePin();
  const docRef = await addDoc(studentsCol, {
    classId: params.classId,
    pinCode,
    nickname: params.nickname,
    grade: params.grade,
    nativeLanguage: params.nativeLanguage,
    avatar: null,
    xp: 0,
    streakCount: 0,
    lastAttendanceDate: null,
    progress: {},
    createdAt: Date.now(),
  });
  return toStudent(docRef.id, {
    classId: params.classId,
    pinCode,
    nickname: params.nickname,
    grade: params.grade,
    nativeLanguage: params.nativeLanguage,
  });
}

export async function loginWithPin(pin: string): Promise<Student | null> {
  const q = query(studentsCol, where("pinCode", "==", pin), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toStudent(d.id, d.data());
}

export async function getStudent(studentId: string): Promise<Student | null> {
  const snap = await getDoc(doc(db, "students", studentId));
  if (!snap.exists()) return null;
  return toStudent(snap.id, snap.data());
}

export async function updateStudent(studentId: string, data: Partial<Student>) {
  await updateDoc(doc(db, "students", studentId), data);
}

export async function listStudentsForClass(classId: string): Promise<Student[]> {
  const q = query(studentsCol, where("classId", "==", classId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toStudent(d.id, d.data()));
}
