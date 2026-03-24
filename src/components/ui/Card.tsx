import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-[var(--radius-lg)] border border-border bg-bg-elevated",
        elevated ? "shadow-md" : "shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";
