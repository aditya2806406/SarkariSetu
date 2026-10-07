import clsx from "clsx";

/**
 * Card — glass morphism surface used for scheme cards, chat bubbles,
 * feature tiles, and the eligibility form. `hover` adds a quiet lift;
 * only enable it where the card is actually interactive.
 */
export function Card({ className, hover = false, children, ...props }) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl p-6",
        hover &&
          "transition-transform duration-200 hover:-translate-y-0.5 hover:border-marigold/25 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;