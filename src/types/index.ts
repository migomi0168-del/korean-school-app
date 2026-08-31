export type NativeLanguage = "zh" | "en" | "vi" | "ja";

export type Difficulty = "easy" | "normal" | "hard";

export interface TeacherMessage {
  text: string;
  points: number;
  sentAt: number;
  read: boolean;
}

export interface ChatLog {
  partner: string;
  location: string;
  messages: { role: "user" | "ai"; text: string }[];
  savedAt: number;
}

export interface PeerMessage {
  from: string;
  fromNickname: string;
  text: string;
  sentAt: number;
}

export interface TeacherAssignment {
  situationId: string;
  label: string;
  assignedAt: number;
  completed: boolean;
  count: number;
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
  equippedBadges: string[];
  ownedAccessories: string[];
  ownedFurniture: string[];
  ownedRoomColors: string[];
  roomColor: string | null;
  teacherMessage: TeacherMessage | null;
  lastChatLog: ChatLog | null;
  formalMistakeCount: number;
  studyDate: string | null;
  studyMinutesToday: number;
  peerMessages: PeerMessage[];
  lastSeenPeerMessageAt: number;
  proficiencyTier: Difficulty | null;
  diagnosticCorrect: number | null;
  teacherAssignment: TeacherAssignment | null;
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
  alternates?: string[];
  reading: string;
  emoji: string;
  category: string;
  difficulty: Difficulty;
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
  difficulty: Difficulty;
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

export type AccessoryCategory = "avatar" | "badge";

export interface Accessory {
  id: string;
  emoji: string;
  name: string;
  price: number;
  position: AccessoryPosition;
  // "avatar" items render on the character and occupy the single
  // equippedAccessory slot; "badge" items (medals/gems) render in the room
  // display case instead and can be equipped many at once (equippedBadges).
  category: AccessoryCategory;
}

export interface Furniture {
  id: string;
  emoji: string;
  name: string;
  price: number;
}

export type RoomPattern = "solid" | "stripes" | "dots";

export interface RoomColor {
  id: string;
  name: string;
  price: number;
  pattern: RoomPattern;
  colors: [string, string];
}

export interface Mission {
  id: string;
  category: string;
  ko: string;
  translations: Record<NativeLanguage, string>;
  exampleIds: string[];
}
