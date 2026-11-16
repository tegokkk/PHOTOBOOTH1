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
    const baseStyles =
      "inline-flex items-center justify-center font-black uppercase tracking-wide rounded-full transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-[#CCFF00]/60 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const sizes = {
      default: "px-6 py-3 min-h-[48px] text-xs md:text-sm",
      sm: "px-4 py-2 min-h-[42px] text-xs",
      lg: "px-8 py-4 min-h-[56px] text-sm md:text-base",
      icon: "w-11 h-11 min-h-[44px] min-w-[44px] p-2",
    };

    const variants = {
      primary:
        "bg-[#CCFF00] text-black border-2 border-white shadow-lg hover:bg-[#d8ff33] hover:scale-[1.02]",
      secondary:
        "bg-[#0038FF] text-white border border-[#0038FF] shadow-md hover:bg-[#002db3] hover:scale-[1.02]",
      danger:
        "bg-red-500 text-white border border-red-400 shadow-md hover:bg-red-600",
      outline:
        "bg-white text-black border-2 border-gray-200 hover:border-[#0038FF] hover:text-[#0038FF]",
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
