import type { NativeLanguage } from "@/types";

const DICT = {
  typeWordHint: {
    zh: "请把这个单词用韩语写出来",
    en: "Type this word in Korean",
    vi: "Hãy gõ từ này bằng tiếng Hàn",
    ja: "この単語[たんご]を韓国語[かんこくご]で書[か]いてください",
  },
  typeBlankHint: {
    zh: "请在空格处填入缺少的单词",
    en: "Type the missing word in the blank",
    vi: "Hãy điền từ còn thiếu vào chỗ trống",
    ja: "空欄[くうらん]に入[はい]る言葉[ことば]を書[か]いてください",
  },
  typeSentenceHint: {
    zh: "请把这个句子用韩语写出来",
    en: "Type this sentence in Korean",
    vi: "Hãy gõ câu này bằng tiếng Hàn",
    ja: "この文[ぶん]を韓国語[かんこくご]で書[か]いてください",
  },
  typeDoorHint: {
    zh: "请用韩语输入这句话来开门",
    en: "Type this phrase in Korean to open the door",
    vi: "Hãy gõ câu này bằng tiếng Hàn để mở cửa",
    ja: "このフレーズを韓国語[かんこくご]で入力[にゅうりょく]してドアを開[あ]けてください",
  },
  bombWatchHint: {
    zh: "看看掉下来的意思，把韩语单词打在火箭里！",
    en: "Watch the falling meaning and type the Korean word into the rocket!",
    vi: "Nhìn nghĩa đang rơi xuống và gõ từ tiếng Hàn vào tên lửa nhé!",
    ja: "落[お]ちてくる意味[いみ]を見[み]て、韓国語[かんこくご]の単語[たんご]をロケットに入力[にゅうりょく]してね！",
  },
  practiceIntro: {
    zh: "在学校里实际说说看这些话吧！完成任务就能获得积分和经验值。",
    en: "Try actually saying these at school! Completing a mission earns you points and XP.",
    vi: "Hãy thử nói những câu này ở trường nhé! Hoàn thành nhiệm vụ sẽ được điểm và kinh nghiệm.",
    ja: "学校[がっこう]で実際[じっさい]に言[い]ってみましょう！ミッションを達成[たっせい]するとポイントと経験値[けいけんち]がもらえます。",
  },
  practiceExampleLabel: {
    zh: "例句",
    en: "Example phrases",
    vi: "Câu ví dụ",
    ja: "例文[れいぶん]",
  },
  correctionLabel: {
    zh: "更自然的说法是：",
    en: "A more natural way to say it:",
    vi: "Cách nói tự nhiên hơn là:",
    ja: "より自然[しぜん]な言[い]い方[かた]は：",
  },
  diagnosticTitle: {
    zh: "我们来简单确认一下你的韩语水平",
    en: "Let's check your Korean level a little",
    vi: "Hãy cùng kiểm tra một chút trình độ tiếng Hàn của em nhé",
    ja: "韓国語[かんこくご]のレベルを少[すこ]し確認[かくにん]してみましょう",
  },
  diagnosticSubtext: {
    zh: "不会也没关系！写你知道的就可以了",
    en: "It's okay if you don't know! Just write as much as you can",
    vi: "Không biết cũng không sao! Hãy viết những gì em biết thôi",
    ja: "わからなくても大丈夫[だいじょうぶ]！わかる分[ぶん]だけ書[か]いてみてね",
  },
  diagnosticInputPlaceholder: {
    zh: "请用韩语输入或点击麦克风",
    en: "Type in Korean or tap the microphone",
    vi: "Hãy gõ bằng tiếng Hàn hoặc nhấn micro",
    ja: "韓国語で入力するか、マイクを押してください",
  },
  diagnosticSkip: {
    zh: "不太清楚（跳过）",
    en: "I'm not sure (skip)",
    vi: "Em chưa biết (bỏ qua)",
    ja: "わかりません（スキップ）",
  },
  chatInputPlaceholder: {
    zh: "请用韩语或中文输入...",
    en: "Type in Korean or English...",
    vi: "Hãy nhập bằng tiếng Hàn hoặc tiếng Việt...",
    ja: "韓国語か日本語で入力してください...",
  },
  koreanTranslationLabel: {
    zh: "韩语可以这样说：",
    en: "In Korean, that's:",
    vi: "Tiếng Hàn là:",
    ja: "韓国語[かんこくご]ではこう言[い]います：",
  },
} as const;

type DictKey = keyof typeof DICT;

export function t(key: DictKey, lang: NativeLanguage | null): string {
  return DICT[key][lang ?? "en"];
}
