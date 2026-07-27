const MESSAGES = [
  "오늘도 접속하셨네요! 잘하고 있습니다 👍",
  "한국어 실력이 많이 늘었어요. 오늘도 화이팅! 💪",
  "꾸준히 학습하는 멋진 학생이군요! 🌟",
  "매일 조금씩, 한국어가 늘고 있어요!",
  "오늘 하루도 힘차게 시작해볼까요? 😊",
];

export function getEncouragementMessage(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return MESSAGES[h % MESSAGES.length];
}
