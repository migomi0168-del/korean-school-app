export type NativeLanguage = "zh" | "en" | "vi" | "ja";

export interface TeacherMessage {
  text: string;
  points: number;
  sentAt: number;
  read: boolean;
}

export interface Student {
  id: string;
  classId: string;
  pinCode: string;
  nickname: string;
  avatar: string | null;
  nativeLanguage: NativeLanguage | null;
  grade: number;
  xp: number;
  points: number;
  streakCount: number;
  lastAttendanceDate: string | null;
  wrongWordIds: string[];
  wrongPhraseIds: string[];
  escapeCleared: string[];
  practiceDate: string | null;
  practiceChecked: string[];
  practiceOptionIds: string[];
  practiceSuccessCount: number;
  equippedAccessory: string | null;
  ownedAccessories: string[];
  ownedFurniture: string[];
  ownedRoomColors: string[];
  roomColor: string | null;
  teacherMessage: TeacherMessage | null;
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
  category: string;
  translations: Record<NativeLanguage, string>;
  templateKo: string;
  templateTranslations: Record<NativeLanguage, string>;
}

export interface Phrase {
  id: string;
  section: string;
  emoji: string;
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

export type AccessoryPosition = "top" | "center" | "bottom" | "corner";

export interface Accessory {
  id: string;
  emoji: string;
  name: string;
  price: number;
  position: AccessoryPosition;
}

export interface Furniture {
  id: string;
  emoji: string;
  name: string;
  price: number;
}

export interface RoomColor {
  id: string;
  name: string;
  gradient: string;
  price: number;
}

export interface Mission {
  id: string;
  category: string;
  translations: Record<NativeLanguage, string>;
  exampleIds: string[];
}
