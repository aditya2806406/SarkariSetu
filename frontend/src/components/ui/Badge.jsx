import clsx from "clsx";

const tones = {
  marigold: "bg-marigold/12 text-marigold-bright border-marigold/25",
  growth: "bg-growth/12 text-growth-bright border-growth/25",
  neutral: "bg-white/5 text-slate border-border",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

/**
 * Badge — for scheme category chips and status labels (e.g. "Active",
 * "Agriculture"). Sentence case, never all-caps — see writing guidance.
 */
export function Badge({ tone = "neutral", variant, className, children }) {
  const selectedTone = variant || tone;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[selectedTone] || tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;