import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground border-2 border-border shadow-sm p-6",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
