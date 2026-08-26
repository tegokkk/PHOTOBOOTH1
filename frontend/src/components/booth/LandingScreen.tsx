"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export function LandingScreen() {
  const { resetSession, setCurrentStep } = useAppStore();
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      resetSession();
      setCurrentStep("frame-selection");
    }, 300);
  };

  return (
    <main 
      className={`
        flex-grow flex flex-col items-center justify-center p-4 md:p-gutter 
        min-h-[80vh] relative z-10 w-full max-w-[1600px] mx-auto overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExiting ? "opacity-0 scale-95 translate-y-10" : "opacity-100 scale-100 translate-y-0"}
      `}
    >
      
      {/* Decorative tapes */}
      <div className="absolute top-10 left-10 w-24 h-8 bg-yellow-200/80 -rotate-12 mix-blend-multiply z-20 pointer-events-none hidden md:block" />
      <div className="absolute bottom-20 right-10 w-20 h-8 bg-yellow-200/80 rotate-12 mix-blend-multiply z-20 pointer-events-none hidden md:block" />

      {/* Main Hero Container */}
      <div className="w-full max-w-3xl bg-surface-container-highest p-8 md:p-16 sketch-border hard-shadow-lg flex flex-col items-center text-center relative z-10 mt-12 md:mt-0">
        
        {/* Star Icon Badge */}
        <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-16 h-16 md:w-20 md:h-20 bg-yellow-400 sketch-border flex items-center justify-center -rotate-12 animate-[wiggle_2s_ease-in-out_infinite_alternate]">
          <span className="material-symbols-outlined text-4xl md:text-5xl text-ink-black" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        </div>

        {/* Title */}
        <h1 className="font-headline-xl text-[4rem] md:text-[6rem] leading-none text-ink-black tracking-tighter mb-4 -rotate-2">
          RIRII<span className="text-curtain-red">.</span>
        </h1>
        
        {/* Subtitle */}
        <div className="bg-ink-black text-paper-white font-label-caps text-label-caps px-4 py-2 sketch-border-thin mb-8 rotate-1">
          WEB PHOTOBOOTH EXPERIENCE
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-12">
          Tangkap momen seru kamu dengan gaya brutalist! Pilih frame favoritmu, ambil foto, dan simpan atau bagikan ke teman-teman.
        </p>

        {/* Action Button */}
        <button
          onClick={handleStart}
          className="
            group relative flex items-center gap-4
            bg-curtain-red text-paper-white
            font-interactive-btn text-interactive-btn text-xl md:text-2xl
            px-8 py-5 md:px-12 md:py-6 border-4 border-ink-black
            sketch-border hard-shadow-lg
            hover:scale-[1.02] active:scale-95 hover:bg-primary/90
            transition-all duration-200
          "
        >
          <span className="material-symbols-outlined text-3xl md:text-4xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            photo_camera
          </span>
          MULAI FOTO SEKARANG
        </button>
      </div>

      {/* Decorative Photos */}
      <div className="absolute top-20 right-[5%] w-32 h-40 bg-surface-container sketch-border shadow-[4px_4px_0_0_#0F0F0F] rotate-12 hidden lg:flex flex-col p-2">
        <div className="bg-ink-black/10 w-full h-full flex-grow mb-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-ink-black/20 text-4xl">face</span>
        </div>
      </div>
      
      <div className="absolute bottom-20 left-[5%] w-28 h-36 bg-surface-container sketch-border shadow-[4px_4px_0_0_#0F0F0F] -rotate-12 hidden lg:flex flex-col p-2">
        <div className="bg-ink-black/10 w-full h-full flex-grow mb-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-ink-black/20 text-4xl">cruelty_free</span>
        </div>
      </div>

    </main>
  );
}
