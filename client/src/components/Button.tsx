import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          
          // Variants
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px]",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          
          // Sizes
          size === "sm" && "h-9 px-4 text-xs",
          size === "md" && "h-12 px-8 text-sm",
          size === "lg" && "h-14 px-10 text-base",
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
