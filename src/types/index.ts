export type NativeLanguage = "zh" | "en" | "vi";

export interface Student {
  id: string;
  classId: string;
  pinCode: string;
  nickname: string;
  avatar: string | null;
  nativeLanguage: NativeLanguage | null;
  grade: number;
  xp: number;
  streakCount: number;
  lastAttendanceDate: string | null;
  wrongWordIds: string[];
  wrongPhraseIds: string[];
  escapeCleared: string[];
  practiceDate: string | null;
  practiceChecked: string[];
  createdAt: number;
}

export interface ClassRoom {
  id: string;
  teacherId: string;
  className: string;
  createdAt: number;
}

export interface Word {
  id: string;
  ko: string;
  reading: string;
  emoji: string;
  translations: Record<NativeLanguage, string>;
  templateKo: string;
  templateTranslations: Record<NativeLanguage, string>;
}

export interface Phrase {
  id: string;
  section: string;
  ko: string;
  alternates?: string[];
  translations: Record<NativeLanguage, string>;
}

export interface Section {
  id: string;
  name: string;
  emoji: string;
  order: number;
  background: string;
}
