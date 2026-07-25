export type NativeLanguage = "zh" | "en" | "vi";

export interface UnitProgress {
  wordsDone: boolean;
  sentencesDone: boolean;
  quizDone: boolean;
  quizScore: number;
}

export interface Student {
  id: string;
  classId: string;
  pinCode: string;
  nickname: string;
  avatar: string | null;
  nativeLanguage: NativeLanguage;
  grade: number;
  xp: number;
  streakCount: number;
  lastAttendanceDate: string | null;
  progress: Record<string, UnitProgress>;
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
}

export interface Sentence {
  id: string;
  ko: string;
  translations: Record<NativeLanguage, string>;
  situation: string;
}

export interface QuizQuestion {
  id: string;
  type: "word" | "sentence";
  refId: string;
}

export interface Unit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  wordIds: string[];
  sentenceIds: string[];
  quiz: QuizQuestion[];
}
