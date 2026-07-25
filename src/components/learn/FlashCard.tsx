import { Card } from "@/components/common/Card";
import { TTSButton } from "@/components/learn/TTSButton";

export function FlashCard({
  emoji,
  ko,
  sub,
  translation,
}: {
  emoji?: string;
  ko: string;
  sub?: string;
  translation: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      {emoji && <div className="text-7xl">{emoji}</div>}
      <div className="flex items-center gap-3">
        <h2 className="font-display text-3xl">{ko}</h2>
        <TTSButton text={ko} />
      </div>
      {sub && <p className="text-sm text-ink/50">{sub}</p>}
      <p className="text-xl font-bold text-duo-blue-dark">{translation}</p>
    </Card>
  );
}
