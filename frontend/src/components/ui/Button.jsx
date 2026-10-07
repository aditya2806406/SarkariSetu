import { forwardRef } from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-marigold text-base font-semibold hover:bg-marigold-bright active:bg-marigold-dim shadow-glow",
  secondary:
    "bg-surface2 text-ink font-semibold border border-border hover:bg-[#1a2647] hover:border-marigold/30",
  ghost: "text-ink/80 hover:text-ink hover:bg-white/5 font-medium",
};

const sizes = {
  sm: "text-sm px-4 py-2 rounded-lg",
  md: "text-[15px] px-5 py-2.5 rounded-xl",
  lg: "text-base px-7 py-3.5 rounded-xl",
};

/**
 * Button — shared across the app. Keep variant names tied to intent
 * (primary action, secondary action, quiet action), not to color.
 */
export const Button = forwardRef(
  (
    { as: Tag = "button", variant = "primary", size = "md", className, children, ...props },
    ref
  ) => {
    return (
      <Tag
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Button.displayName = "Button";
export default Button;