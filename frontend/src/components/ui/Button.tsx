import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/** Utility for Tailwind class merging */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "default",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base brutalist classes
    const baseStyles =
      "inline-flex items-center justify-center font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-ink-black active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

    // Size variations
    const sizes = {
      default: "px-6 py-3 min-h-[44px]",
      sm: "px-4 py-2 min-h-[44px] text-sm", // Ensure min-h 44px for tap target
      lg: "px-8 py-4 min-h-[56px] text-lg",
      icon: "w-11 h-11 min-h-[44px] min-w-[44px] p-2", // 44x44 minimum tap target
    };

    // Color variations
    const variants = {
      primary:
        "bg-blueprint-blue text-paper-white hover:bg-blueprint-blue/90 hover:scale-[1.01] hover:hard-shadow-lg",
      secondary:
        "bg-paper-white text-ink-black hover:bg-surface-container-low hover:scale-[1.01] hover:hard-shadow-lg",
      danger:
        "bg-curtain-red text-paper-white hover:bg-curtain-red/90 hover:scale-[1.01] hover:hard-shadow-lg",
      outline:
        "bg-transparent text-ink-black sketch-border-thin hover:bg-surface-container-high hard-shadow-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
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
