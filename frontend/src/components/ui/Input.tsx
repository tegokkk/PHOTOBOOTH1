import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-[#DBEAFE] bg-white text-[#0F172A] placeholder:text-[#475569]/60 selection:bg-[#DBEAFE] selection:text-[#1D4ED8] flex h-12 w-full min-w-0 rounded-xl border px-4 py-2.5 text-base shadow-2xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-[#2563EB] focus-visible:ring-3 focus-visible:ring-[#2563EB]/20 aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
