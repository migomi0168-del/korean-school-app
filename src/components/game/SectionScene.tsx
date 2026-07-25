interface SceneStyle {
  gradient: string;
  decor: { emoji: string; className: string; delay: string }[];
  label: string;
}

const SCENE_STYLES: Record<string, SceneStyle> = {
  hallway: {
    gradient: "from-amber-200 via-orange-200 to-orange-400",
    label: "복도",
    decor: [
      { emoji: "🚪", className: "left-3 top-3 text-2xl", delay: "0s" },
      { emoji: "🔔", className: "right-4 top-4 text-xl", delay: "0.4s" },
      { emoji: "🪟", className: "left-4 bottom-4 text-xl", delay: "0.8s" },
      { emoji: "👋", className: "right-3 bottom-3 text-2xl", delay: "1.2s" },
    ],
  },
  classroom: {
    gradient: "from-sky-200 via-blue-200 to-blue-400",
    label: "교실",
    decor: [
      { emoji: "📚", className: "left-3 top-4 text-2xl", delay: "0s" },
      { emoji: "✏️", className: "right-4 top-3 text-xl", delay: "0.5s" },
      { emoji: "🪑", className: "left-4 bottom-3 text-2xl", delay: "1s" },
      { emoji: "🖊️", className: "right-3 bottom-4 text-xl", delay: "1.5s" },
    ],
  },
  playground: {
    gradient: "from-lime-200 via-emerald-200 to-emerald-400",
    label: "운동장",
    decor: [
      { emoji: "☀️", className: "right-4 top-3 text-2xl", delay: "0s" },
      { emoji: "⚽", className: "left-3 bottom-4 text-2xl", delay: "0.6s" },
      { emoji: "🌳", className: "left-4 top-4 text-xl", delay: "1.1s" },
      { emoji: "🎈", className: "right-3 bottom-3 text-xl", delay: "1.6s" },
    ],
  },
  cafeteria: {
    gradient: "from-orange-200 via-amber-200 to-red-300",
    label: "급식실",
    decor: [
      { emoji: "🍚", className: "left-3 top-4 text-2xl", delay: "0s" },
      { emoji: "🥢", className: "right-4 top-3 text-xl", delay: "0.4s" },
      { emoji: "🍽️", className: "left-4 bottom-3 text-2xl", delay: "0.8s" },
      { emoji: "🥗", className: "right-3 bottom-4 text-xl", delay: "1.2s" },
    ],
  },
  nurse: {
    gradient: "from-teal-100 via-cyan-100 to-cyan-300",
    label: "보건실",
    decor: [
      { emoji: "💊", className: "left-3 top-3 text-xl", delay: "0s" },
      { emoji: "🩹", className: "right-4 top-4 text-xl", delay: "0.5s" },
      { emoji: "🛏️", className: "left-4 bottom-3 text-2xl", delay: "1s" },
      { emoji: "🩺", className: "right-3 bottom-4 text-2xl", delay: "1.5s" },
    ],
  },
};

export function SectionScene({ background, emoji }: { background: string; emoji: string }) {
  const style = SCENE_STYLES[background] ?? SCENE_STYLES.classroom;
  return (
    <div
      className={`relative h-36 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-b shadow-inner ${style.gradient}`}
    >
      {style.decor.map((d, i) => (
        <span
          key={i}
          className={`scene-drift absolute drop-shadow ${d.className}`}
          style={{ animationDelay: d.delay }}
        >
          {d.emoji}
        </span>
      ))}
      <div className="flex h-full items-center justify-center">
        <span className="scene-bob text-7xl drop-shadow-lg">{emoji}</span>
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold text-ink/70 backdrop-blur-sm">
        {style.label}
      </div>
    </div>
  );
}
