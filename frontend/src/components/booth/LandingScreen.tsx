"use client";

import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowGreenLeft,
  ArrowGreenRight,
  ArrowBlack1,
  ArrowBlack2,
  CircularBadge,
} from "@/components/ui/hero";

const EXTRUDED_SHADOW =
  "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99";

export function LandingScreen() {
  const { resetSession, openSession } = useAppStore();
  const [isExiting, setIsExiting] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);
  const [operatorPin, setOperatorPin] = useState("");
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const paymentDialogRef = useRef<HTMLDivElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const correctPin = process.env.NEXT_PUBLIC_OPERATOR_PIN || "0606";

  const updatePin = (nextPin: string) => {
    const trimmed = nextPin.slice(0, 8);
    setOperatorPin(trimmed);
    setOperatorConfirmed(trimmed === correctPin);
  };

  const handleStart = () => {
    setOperatorConfirmed(false);
    setOperatorPin("");
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setOperatorConfirmed(false);
    setOperatorPin("");
  };

  const handleConfirmPayment = () => {
    if (!operatorConfirmed) return;
    setIsPaymentDialogOpen(false);
    setIsExiting(true);
    setTimeout(() => {
      resetSession();
      openSession();
    }, 280);
  };

  useEffect(() => {
    if (!isPaymentDialogOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const fallbackFocusTarget = startButtonRef.current;
    requestAnimationFrame(() => pinInputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClosePaymentDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previouslyFocused || fallbackFocusTarget)?.focus();
    };
  }, [isPaymentDialogOpen]);

  return (
    <div
      className={`
        min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full
        transition-all duration-300 ease-out
        ${isExiting ? "opacity-0 scale-98 translate-y-4" : "opacity-100 scale-100 translate-y-0"}
      `}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5 max-w-6xl mx-auto w-full">
        {/* Dual-Pill Logo */}
        <div className="flex items-center gap-1.5">
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

        {/* Desktop Pill Tags */}
        <div className="hidden lg:flex items-center space-x-2">
          {["1. Pilih Frame", "2. Ambil Foto", "3. Periksa Foto", "4. Cetak & QR"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={handleStart}
                className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-white/15 transition-colors cursor-pointer"
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Top Right Start Button */}
        <button
          ref={startButtonRef}
          type="button"
          onClick={handleStart}
          className="shrink-0 px-4 py-2 rounded-full bg-[#CCFF00] text-black border-2 border-white text-[11px] md:text-xs font-black uppercase tracking-wide shadow-lg hover:bg-white hover:text-[#0038FF] active:scale-95 transition-all cursor-pointer"
        >
          Mulai Sesi Foto
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-8 pb-14 md:pt-10 md:pb-20 px-6 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        <div className="relative w-full mx-auto flex flex-col items-center justify-center text-center z-10">
          {/* Compact responsive typography with room for the side decorations. */}
          <div className="w-full flex flex-col items-center relative z-10 space-y-3 md:space-y-4">
            {/* #POINTER */}
            <div className="w-full flex justify-center md:-translate-x-10 relative z-30">
              <h1
                className="text-[clamp(2rem,6vw,80px)] font-black leading-[0.95] tracking-tighter text-[#CCFF00] m-0 p-0 uppercase select-none"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: EXTRUDED_SHADOW,
                }}
              >
                #POINTER
              </h1>
            </div>

            {/* PHOTOBOOTH */}
            <div className="w-full flex justify-center relative z-20">
              <h1
                className="text-[clamp(1.5rem,7.6vw,100px)] font-black leading-[0.95] tracking-tighter text-white m-0 p-0 uppercase select-none"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: EXTRUDED_SHADOW,
                }}
              >
                PHOTOBOOTH
              </h1>
            </div>

            {/* STUDIO */}
            <div className="w-full flex justify-center md:translate-x-10 relative z-10">
              <h1
                className="text-[clamp(2rem,6vw,80px)] font-black leading-[0.95] tracking-tighter text-white m-0 p-0 uppercase select-none"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: EXTRUDED_SHADOW,
                }}
              >
                STUDIO
              </h1>
            </div>
          </div>

          {/* Primary Action Pill Button right below the 3D Title */}
          <div className="mt-8 relative z-40 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-3 md:px-8 md:py-3.5 rounded-full bg-[#CCFF00] text-black border-2 border-white font-black text-sm md:text-base uppercase tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-xl md:text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                photo_camera
              </span>
              <span>MULAI SESI FOTO</span>
            </button>
          </div>

          {/* Absolute Overlays (Floating Glass Cards, Hand-Drawn Arrows, Circular Badge) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Floating Glass Card 1 (Bottom Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden lg:block absolute bottom-[12%] left-[3%] z-30 pointer-events-auto"
            >
              <div
                onClick={handleStart}
                className="w-32 xl:w-36 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-3 flex flex-col items-center justify-center rotate-[-12deg] shadow-xl hover:rotate-0 transition-transform duration-500 cursor-pointer"
              >
                <div className="w-20 h-20 shrink-0 bg-white rounded-xl flex items-center justify-center mb-2 border border-white/60 overflow-hidden">
                  <Image
                    src="/images/logo-manajemen-informatika.png"
                    alt="Logo Manajemen Informatika"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center mt-1">
                  <p className="font-black text-xs text-white">
                    pointer.snap
                  </p>
                  <p className="text-[10px] text-[#CCFF00] font-bold mt-0.5">
                    HD Studio Camera
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 (Top Right) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="hidden lg:block absolute top-[2%] right-[3%] z-30 pointer-events-auto"
            >
              <div
                onClick={handleStart}
                className="w-32 xl:w-36 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-3xl p-3 flex flex-col items-center justify-center rotate-[12deg] shadow-xl hover:rotate-0 transition-transform duration-500 cursor-pointer"
              >
                <div className="w-20 h-20 shrink-0 bg-black rounded-xl flex items-center justify-center mb-2 border border-white/60 overflow-hidden">
                  <Image
                    src="/images/logo-d3-mi-polinela.png"
                    alt="Logo D3 Manajemen Informatika Polinela"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center mt-1">
                  <p className="font-black text-xs text-white">
                    instant.print
                  </p>
                  <p className="text-[10px] text-[#CCFF00] font-bold mt-0.5">
                    Cetak & Unduh QR
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Decorative Arrow Left */}
            <div className="hidden lg:block absolute bottom-[-6%] left-[7%] w-16 h-16 z-20">
              <ArrowGreenLeft />
            </div>

            {/* Decorative Arrow Right */}
            <div className="hidden lg:block absolute top-[-6%] right-0 w-16 h-16 z-20">
              <ArrowGreenRight />
            </div>

            {/* Spinning Circular Badge */}
            <div className="hidden lg:block absolute bottom-[-8%] right-[5%] z-40 pointer-events-auto [&>button]:w-24 [&>button]:h-24">
              <CircularBadge
                onClick={handleStart}
                text="MULAI SESI FOTO • POINTER BOOTH • "
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Features Section (Matching hero.tsx rounded white sheet & 3 step cards) */}
      <section className="bg-white text-black rounded-t-[2rem] md:rounded-t-[2.5rem] px-5 py-6 md:px-8 md:py-8 relative z-20 shadow-[0_-12px_36px_rgba(0,0,0,0.18)] mt-auto w-full">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {/* Card 1 */}
          <div
            onClick={handleStart}
            className="bg-[#F8F9FA] rounded-3xl p-5 flex flex-col items-center text-center relative min-h-52 border border-gray-100 hover:border-[#0038FF]/30 transition-all cursor-pointer"
          >
            <h3 className="text-lg lg:text-xl uppercase leading-tight mb-2 font-black">
              PILIH BINGKAI
              <br />
              FAVORITMU
            </h3>
            <p className="text-xs text-black/60 font-bold mb-auto">
              Berbagai pilihan frame strip & kolase eksklusif
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex flex-col items-center gap-2 mt-5">
              <div className="flex items-center bg-[#0038FF] rounded-2xl p-2 pr-3 text-white shadow-lg relative z-10">
                <div className="w-8 h-8 bg-[#CCFF00] text-black rounded-full mr-3 border border-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-base">
                    filter_frames
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black leading-none">
                    FRAME STUDIO
                  </p>
                  <p className="text-[9px] text-white/75 leading-none mt-1">
                    Siap digunakan
                  </p>
                </div>
              </div>
              <div className="bg-[#CCFF00] text-black font-black text-[10px] px-3 py-1.5 rounded-xl z-20 shadow-md">
                LANGKAH 01
              </div>
            </div>

            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30 pointer-events-none">
              <ArrowBlack1 />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={handleStart}
            className="bg-[#F8F9FA] rounded-3xl p-5 flex flex-col items-center text-center relative min-h-52 border border-gray-100 hover:border-[#0038FF]/30 transition-all cursor-pointer"
          >
            <h3 className="text-lg lg:text-xl uppercase leading-tight mb-2 font-black">
              POSE & AMBIL
              <br />
              FOTO STUDIO
            </h3>
            <p className="text-xs text-black/60 font-bold mb-auto">
              Kamera HD otomatis dengan hitung mundur
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex justify-center mt-5">
              <div className="flex items-center bg-[#0038FF] rounded-full p-1.5 text-white shadow-lg">
                <div className="bg-white/20 text-white font-black text-xs px-4 py-2 rounded-full mr-2">
                  TIMER 3S / 5S
                </div>
                <div className="font-black text-xs px-4">AUTO SNAP</div>
              </div>

              <div className="absolute -bottom-5 right-1/4 bg-[#CCFF00] rounded-full p-2.5 shadow-lg transform rotate-12 z-20">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-black stroke-current"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30 pointer-events-none">
              <ArrowBlack2 />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={handleStart}
            className="bg-[#F8F9FA] rounded-3xl p-5 flex flex-col items-center text-center relative min-h-52 border border-gray-100 hover:border-[#0038FF]/30 transition-all cursor-pointer"
          >
            <h3 className="text-lg lg:text-xl uppercase leading-tight mb-2 font-black">
              CETAK INSTAN
              <br />& UNDUH QR
            </h3>
            <p className="text-xs text-black/60 font-bold mb-auto">
              Cetak langsung dan simpan ke ponselmu
            </p>

            {/* Speech Bubble Lime Pill */}
            <div className="flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-6 py-3.5 text-black shadow-lg mt-5 relative w-full max-w-[210px]">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5">
                HASIL FOTO SIAP
              </p>
              <p className="text-lg font-black uppercase">PRINT & QR CODE</p>
              <div className="absolute -bottom-2 left-8 w-5 h-5 bg-[#CCFF00] transform rotate-45" />
            </div>
          </div>
        </div>
      </section>

      {/* Operator PIN Modal */}
      {isPaymentDialogOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={handleClosePaymentDialog}
            aria-hidden="true"
          />
          <div
            ref={paymentDialogRef}
            className="relative z-10 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white text-black rounded-3xl border-2 border-[#0038FF] shadow-[0_24px_60px_rgba(0,0,0,0.4)] p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-confirmation-title"
            aria-describedby="payment-confirmation-description"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
                <div>
                  <h2
                    id="payment-confirmation-title"
                    className="text-sm font-black uppercase tracking-tight text-black"
                  >
                    OTORISASI OPERATOR
                  </h2>
                  <p
                    id="payment-confirmation-description"
                    className="text-[11px] leading-relaxed font-bold text-black/60 mt-0.5"
                  >
                    Masukkan PIN untuk membuka sesi foto baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePaymentDialog}
                className="w-11 h-11 shrink-0 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup dialog"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmPayment();
              }}
              className="mt-4 flex flex-col gap-3"
            >
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                placeholder="••••"
                maxLength={8}
                value={operatorPin}
                onChange={(e) => updatePin(e.target.value)}
                className={`w-full rounded-xl border-2 px-3 py-2.5 text-center font-mono text-xl font-black tracking-[0.5em] text-black transition-all focus:outline-none ${
                  operatorConfirmed
                    ? "bg-[#CCFF00]/30 border-[#0038FF] ring-4 ring-[#CCFF00]"
                    : "bg-[#F8F9FA] border-gray-200 focus:border-[#0038FF] focus:bg-white"
                }`}
                autoFocus
              />

              {/* Touch Keypad */}
              <div className="grid grid-cols-3 gap-1.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => updatePin(operatorPin + digit)}
                    className="min-h-11 rounded-xl bg-[#F8F9FA] hover:bg-[#0038FF] hover:text-white active:scale-95 border border-gray-200 text-black font-black text-base transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updatePin("")}
                  className="min-h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-black/70 font-black text-[11px] uppercase transition-colors cursor-pointer"
                >
                  RESET
                </button>
                <button
                  type="button"
                  onClick={() => updatePin(operatorPin + "0")}
                  className="min-h-11 rounded-xl bg-[#F8F9FA] hover:bg-[#0038FF] hover:text-white active:scale-95 border border-gray-200 text-black font-black text-base transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => updatePin(operatorPin.slice(0, -1))}
                  className="min-h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Hapus karakter terakhir"
                >
                  <span className="material-symbols-outlined text-lg">
                    backspace
                  </span>
                </button>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleClosePaymentDialog}
                  className="min-h-11 py-2.5 px-3 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black font-black text-xs uppercase border border-gray-200 transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={!operatorConfirmed}
                  className="min-h-11 py-2.5 px-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase border-2 border-black/10 shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-lg">
                    lock_open
                  </span>
                  BUKA SESI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
