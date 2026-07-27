import type { NativeLanguage } from "@/types";

const DICT = {
  typeWordHint: {
    zh: "请把这个单词用韩语写出来",
    en: "Type this word in Korean",
    vi: "Hãy gõ từ này bằng tiếng Hàn",
    ja: "この単語を韓国語で書いてください",
  },
  typeBlankHint: {
    zh: "请在空格处填入缺少的单词",
    en: "Type the missing word in the blank",
    vi: "Hãy điền từ còn thiếu vào chỗ trống",
    ja: "空欄に入る言葉を書いてください",
  },
  typeSentenceHint: {
    zh: "请把这个句子用韩语写出来",
    en: "Type this sentence in Korean",
    vi: "Hãy gõ câu này bằng tiếng Hàn",
    ja: "この文を韓国語で書いてください",
  },
  typeDoorHint: {
    zh: "请用韩语输入这句话来开门",
    en: "Type this phrase in Korean to open the door",
    vi: "Hãy gõ câu này bằng tiếng Hàn để mở cửa",
    ja: "このフレーズを韓国語で入力してドアを開けてください",
  },
  bombWatchHint: {
    zh: "看看掉下来的意思，把韩语单词打在火箭里！",
    en: "Watch the falling meaning and type the Korean word into the rocket!",
    vi: "Nhìn nghĩa đang rơi xuống và gõ từ tiếng Hàn vào tên lửa nhé!",
    ja: "落ちてくる意味を見て、韓国語の単語をロケットに入力してね！",
  },
  practiceIntro: {
    zh: "在学校里实际说说看这些话吧！完成任务就能获得积分和经验值。",
    en: "Try actually saying these at school! Completing a mission earns you points and XP.",
    vi: "Hãy thử nói những câu này ở trường nhé! Hoàn thành nhiệm vụ sẽ được điểm và kinh nghiệm.",
    ja: "学校で実際に言ってみましょう！ミッションを達成するとポイントと経験値がもらえます。",
  },
  practiceExampleLabel: {
    zh: "例句",
    en: "Example phrases",
    vi: "Câu ví dụ",
    ja: "例文",
  },
  correctionLabel: {
    zh: "更自然的说法是：",
    en: "A more natural way to say it:",
    vi: "Cách nói tự nhiên hơn là:",
    ja: "より自然な言い方は：",
  },
  translatedLabel: {
    zh: "韩语可以这样说：",
    en: "In Korean, say it like this:",
    vi: "Tiếng Hàn thì nói thế này:",
    ja: "韓国語ではこう言います：",
  },
} as const;

type DictKey = keyof typeof DICT;

export function t(key: DictKey, lang: NativeLanguage | null): string {
  return DICT[key][lang ?? "en"];
}
