import type { NativeLanguage } from "@/types";

const DICT = {
  typeWordHint: {
    zh: "请把这个单词用韩语写出来",
    en: "Type this word in Korean",
    vi: "Hãy gõ từ này bằng tiếng Hàn",
  },
  typeBlankHint: {
    zh: "请在空格处填入缺少的单词",
    en: "Type the missing word in the blank",
    vi: "Hãy điền từ còn thiếu vào chỗ trống",
  },
  typeSentenceHint: {
    zh: "请把这个句子用韩语写出来",
    en: "Type this sentence in Korean",
    vi: "Hãy gõ câu này bằng tiếng Hàn",
  },
  typeDoorHint: {
    zh: "请用韩语输入这句话来开门",
    en: "Type this phrase in Korean to open the door",
    vi: "Hãy gõ câu này bằng tiếng Hàn để mở cửa",
  },
  bombWatchHint: {
    zh: "看看掉下来的意思，把韩语单词打在火箭里！",
    en: "Watch the falling meaning and type the Korean word into the rocket!",
    vi: "Nhìn nghĩa đang rơi xuống và gõ từ tiếng Hàn vào tên lửa nhé!",
  },
  practiceIntro: {
    zh: "勾选2个以上就会有掌声，还能升级哦！",
    en: "Check off 2 or more and you'll get applause and level up!",
    vi: "Đánh dấu từ 2 mục trở lên sẽ có tiếng vỗ tay và lên cấp đó!",
  },
  practiceDoneToday: {
    zh: "今天的实践已经完成啦，明天见！",
    en: "You already did today's practice. See you tomorrow!",
    vi: "Hôm nay con đã hoàn thành phần thực hành rồi. Hẹn gặp lại vào ngày mai!",
  },
  missionGreet: {
    zh: "跟朋友或老师打招呼",
    en: "Say hello to a friend or teacher",
    vi: "Chào một người bạn hoặc thầy cô",
  },
  missionThanks: {
    zh: "向朋友或老师表达感谢",
    en: "Say thank you to a friend or teacher",
    vi: "Nói lời cảm ơn với bạn hoặc thầy cô",
  },
  missionInvite: {
    zh: "邀请朋友一起玩",
    en: "Ask a friend to play together",
    vi: "Rủ bạn cùng chơi",
  },
  correctionLabel: {
    zh: "更自然的说法是：",
    en: "A more natural way to say it:",
    vi: "Cách nói tự nhiên hơn là:",
  },
} as const;

type DictKey = keyof typeof DICT;

export function t(key: DictKey, lang: NativeLanguage | null): string {
  return DICT[key][lang ?? "en"];
}
