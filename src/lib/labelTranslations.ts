import type { NativeLanguage } from "@/types";

// Small gray native-language hints shown under Korean option labels (situation
// pickers, chat partner/location pickers) so a student who can't read Korean
// yet still knows what each button means. Keyed by the exact Korean label.
const LABEL_TRANSLATIONS: Record<string, Record<NativeLanguage, string>> = {
  인사: { zh: "打招呼", en: "Greeting", vi: "Chào hỏi", ja: "あいさつ" },
  수업시간: { zh: "上课时间", en: "Class time", vi: "Giờ học", ja: "授業[じゅぎょう]時間[じかん]" },
  쉬는시간: { zh: "课间休息", en: "Break time", vi: "Giờ ra chơi", ja: "休[やす]み時間[じかん]" },
  급식실: { zh: "营养午餐室", en: "Cafeteria", vi: "Phòng ăn", ja: "給食室[きゅうしょくしつ]" },
  보건실: { zh: "保健室", en: "Nurse's office", vi: "Phòng y tế", ja: "保健室[ほけんしつ]" },
  도서관: { zh: "图书馆", en: "Library", vi: "Thư viện", ja: "図書館[としょかん]" },
  특별실: { zh: "专用教室", en: "Special room", vi: "Phòng chức năng", ja: "特別教室[とくべつきょうしつ]" },
  "등하교/알림장": { zh: "上下学/通知本", en: "Commute / notices", vi: "Đi học về / Sổ liên lạc", ja: "登下校[とうげこう]/連絡帳[れんらくちょう]" },
  "친구 갈등": { zh: "朋友冲突", en: "Friend conflict", vi: "Xung đột bạn bè", ja: "友達[ともだち]とのけんか" },
  친구: { zh: "朋友", en: "Friend", vi: "Bạn", ja: "友達[ともだち]" },
  선생님: { zh: "老师", en: "Teacher", vi: "Giáo viên", ja: "先生[せんせい]" },
  기타: { zh: "其他", en: "Other", vi: "Khác", ja: "その他[た]" },
  교실: { zh: "教室", en: "Classroom", vi: "Lớp học", ja: "教室[きょうしつ]" },
  "복도 또는 운동장": { zh: "走廊或操场", en: "Hallway or playground", vi: "Hành lang hoặc sân chơi", ja: "廊下[ろうか]または運動場[うんどうじょう]" },
  "또래 친구": { zh: "同龄朋友", en: "Peer friend", vi: "Bạn cùng lứa", ja: "同[おな]い年[どし]の友達[ともだち]" },
};

export function getNativeLabel(ko: string, lang: NativeLanguage | null | undefined): string | null {
  if (!lang) return null;
  return LABEL_TRANSLATIONS[ko]?.[lang] ?? null;
}
