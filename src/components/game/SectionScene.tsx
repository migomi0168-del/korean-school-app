const SCENE_STYLES: Record<string, { gradient: string; motif: string }> = {
  hallway: { gradient: "from-amber-200 to-orange-300", motif: "🚪🔔👋" },
  classroom: { gradient: "from-sky-200 to-blue-300", motif: "🏫📚✏️" },
  playground: { gradient: "from-lime-200 to-emerald-300", motif: "☀️🏃⚽" },
  cafeteria: { gradient: "from-orange-200 to-red-300", motif: "🍱🍚🥢" },
  nurse: { gradient: "from-teal-100 to-cyan-200", motif: "🏥💊🩹" },
};

export function SectionScene({ background, emoji }: { background: string; emoji: string }) {
  const style = SCENE_STYLES[background] ?? SCENE_STYLES.classroom;
  return (
    <div className={`flex flex-col items-center gap-1 rounded-3xl bg-gradient-to-b ${style.gradient} py-8 text-center`}>
      <div className="text-6xl">{emoji}</div>
      <div className="text-2xl opacity-70">{style.motif}</div>
    </div>
  );
}
