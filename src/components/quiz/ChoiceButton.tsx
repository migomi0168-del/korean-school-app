"use client";

type Status = "idle" | "correct" | "wrong" | "faded";

const STATUS_CLASSES: Record<Status, string> = {
  idle: "bg-white border-duo-gray text-ink",
  correct: "bg-duo-green border-duo-green-dark text-white",
  wrong: "bg-duo-red border-duo-red-dark text-white",
  faded: "bg-white border-duo-gray text-ink/40",
};

export function ChoiceButton({
  label,
  status,
  onClick,
}: {
  label: string;
  status: Status;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status !== "idle"}
      className={`duo-btn w-full rounded-2xl border-2 px-4 py-4 text-left text-lg font-bold ${STATUS_CLASSES[status]}`}
    >
      {label}
    </button>
  );
}
