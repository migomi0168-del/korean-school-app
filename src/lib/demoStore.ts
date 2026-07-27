import type { Student } from "@/types";

// Demo sessions (PIN 111111) never touch Firestore: each browser tab keeps
// its own student entirely in sessionStorage, so any number of people can
// "log in" at once without colliding, and nothing survives once the tab/
// browser is closed.
const DEMO_KEY = "hakgyomal_demo_student";

type Listener = (student: Student) => void;
const listeners = new Set<Listener>();

export function isDemoId(id: string | null | undefined): boolean {
  return !!id && id.startsWith("demo-");
}

function createDemoStudent(): Student {
  return {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    classId: "demo",
    pinCode: "111111",
    nickname: "테스트 사용자",
    avatar: null,
    nativeLanguage: null,
    grade: 3,
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
    createdAt: Date.now(),
  };
}

function read(): Student | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DEMO_KEY);
  return raw ? (JSON.parse(raw) as Student) : null;
}

function write(student: Student) {
  sessionStorage.setItem(DEMO_KEY, JSON.stringify(student));
  listeners.forEach((cb) => cb(student));
}

export function startDemoSession(): Student {
  const student = createDemoStudent();
  write(student);
  return student;
}

export function clearDemoSession() {
  sessionStorage.removeItem(DEMO_KEY);
}

export function getDemoStudent(): Student | null {
  return read();
}

export function subscribeDemoStudent(cb: Listener) {
  listeners.add(cb);
  const current = read();
  if (current) cb(current);
  return () => listeners.delete(cb);
}

export function updateDemoStudent(updater: (s: Student) => Student) {
  const current = read();
  if (!current) return;
  write(updater(current));
}
