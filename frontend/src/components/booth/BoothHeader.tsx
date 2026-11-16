"use client";

import React from "react";

interface BoothHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
  rightSlot?: React.ReactNode;
}

const STEPS = [
  { step: 1 as const, label: "1. PILIH FRAME", icon: "filter_frames" },
  { step: 2 as const, label: "2. AMBIL FOTO", icon: "photo_camera" },
  { step: 3 as const, label: "3. PERIKSA FOTO", icon: "fact_check" },
  { step: 4 as const, label: "4. HASIL & CETAK", icon: "print" },
];

export function BoothHeader({ currentStep, rightSlot }: BoothHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0038FF]/90 backdrop-blur-md border-b border-white/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        {/* Dual-Pill Logo (matching hero.tsx) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm">
            POINTER
            <div
              className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white"
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            />
          </div>
          <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3.5 py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
            BOOTH
          </div>
        </div>

        {/* Center Pill Stepper (matching hero.tsx navbar links) */}
        <nav
          aria-label="Tahapan sesi foto"
          className="hidden xl:flex items-center gap-2"
        >
          {STEPS.map((item) => {
            const isActive = item.step === currentStep;
            const isCompleted = item.step < currentStep;
            return (
              <div
                key={item.step}
                aria-current={isActive ? "step" : undefined}
                className={`px-3 xl:px-4 py-1.5 rounded-full text-[11px] xl:text-xs font-black uppercase tracking-wide flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#CCFF00] text-black border-[1.5px] border-white shadow-md scale-105"
                    : isCompleted
                    ? "bg-white text-[#0038FF] border border-white shadow-xs"
                    : "border border-white/30 text-white/80 bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isCompleted ? "check_circle" : item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot ?? (
            <span className="px-4 py-1.5 rounded-full border border-white text-white text-xs font-bold bg-white/10 backdrop-blur-xs">
              SESI AKTIF
            </span>
          )}
        </div>
      </div>

      {/* Mobile Step Bar */}
      <div className="xl:hidden px-4 sm:px-6 py-2 bg-black/20 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs font-black uppercase text-[#CCFF00] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">
            {STEPS[currentStep - 1].icon}
          </span>
          {STEPS[currentStep - 1].label}
        </span>
        <div className="flex items-center gap-1.5">
          {STEPS.map((item) => (
            <span
              key={item.step}
              className={`h-2 rounded-full transition-all ${
                item.step === currentStep
                  ? "w-7 bg-[#CCFF00]"
                  : item.step < currentStep
                  ? "w-3 bg-white"
                  : "w-3 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
