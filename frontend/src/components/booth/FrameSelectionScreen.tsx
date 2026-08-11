"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getPhotoCount } from "@/lib/frameMeta";

const CATEGORIES = ["Semua", "Basic", "Vintage", "Party", "Aesthetic"];

export function FrameSelectionScreen() {
  const { frames, isLoadingFrames, fetchFrames, selectedFrameId, setSelectedFrameId, setCurrentStep } =
    useAppStore();
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    fetchFrames();
  }, [fetchFrames]);

  const filtered =
    activeCategory === "Semua"
      ? frames
      : frames.filter((f) => f.category === activeCategory);

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  return (
    <main className="flex-grow flex flex-col md:flex-row relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-gutter gap-6 md:gap-gutter pb-[100px] md:pb-gutter pt-6">

      {/* ── Left Column: Gallery ─────────────────────────── */}
      <section className="w-full md:w-8/12 flex flex-col gap-4">

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-curtain-red text-paper-white font-label-caps text-label-caps px-3 py-1 sketch-border hard-shadow text-xs">
            LANGKAH 1 / 3
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic">
            Pilih Frame Kamu
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant -mt-2">
          Pilih frame yang kamu suka sebelum mulai memotret.
        </p>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                shrink-0 px-4 py-2 font-label-caps text-label-caps text-sm border-2 border-ink-black
                transition-all duration-150
                ${
                  activeCategory === cat
                    ? "bg-ink-black text-paper-white"
                    : "bg-paper-white text-ink-black hover:bg-surface-container-high"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Frame Grid */}
        {isLoadingFrames ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-surface-container-high animate-pulse sketch-border"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((frame) => {
              const isSelected = selectedFrameId === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrameId(frame.id)}
                  aria-pressed={isSelected}
                  aria-label={`Pilih frame ${frame.name}`}
                  className={`
                    relative aspect-[3/4] group focus:outline-none focus-visible:ring-4 focus-visible:ring-curtain-red
                    transition-transform duration-150
                    ${isSelected ? "scale-[1.03]" : "hover:scale-[1.02]"}
                  `}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <div className="absolute inset-0 border-4 border-curtain-red z-20 pointer-events-none" />
                  )}

                  <div
                    className={`
                      w-full h-full bg-surface-container sketch-border overflow-hidden
                      transition-all duration-150
                      ${isSelected ? "shadow-[4px_4px_0_0_#E61D2B]" : "hard-shadow group-hover:shadow-[4px_4px_0_0_#0F0F0F]"}
                    `}
                  >
                    {/* Frame image or CSS placeholder */}
                    {frame.imageUrl ? (
                      <img
                        src={frame.imageUrl}
                        alt={frame.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : frame.cssPlaceholder !== "border-0" ? (
                      <div className={`absolute inset-0 ${frame.cssPlaceholder}`} />
                    ) : (
                      <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                          crop_free
                        </span>
                      </div>
                    )}

                    {/* Name badge */}
                    <div className="absolute bottom-0 inset-x-0 p-2 z-10 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="font-label-caps text-[11px] text-paper-white block truncate">
                        {frame.name}
                      </span>
                      <span className="font-label-caps text-[10px] text-paper-white/70 block">
                        {frame.category}
                      </span>
                    </div>

                    {/* Photo count badge */}
                    {frame.imageUrl && getPhotoCount(frame.imageUrl) > 1 && (
                      <div className="absolute top-2 left-2 z-30 bg-ink-black text-paper-white text-[10px] font-label-caps px-2 py-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>camera</span>
                        {getPhotoCount(frame.imageUrl)}x
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-30 bg-curtain-red border-2 border-ink-black w-7 h-7 flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-paper-white text-base"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Right Column: Preview & CTA ─────────────────── */}
      <section className="w-full md:w-4/12 flex flex-col gap-4">
        <div className="bg-surface-container-lowest sketch-border hard-shadow p-4 md:p-6 sticky top-8">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black border-b-2 border-ink-black pb-2 mb-4">
            Preview Frame
          </h2>

          {selectedFrame ? (
            <>
              {/* Frame Preview Card */}
              <div className="relative aspect-[3/4] bg-surface-container sketch-border overflow-hidden mb-4 hard-shadow">
                {selectedFrame.imageUrl ? (
                  <img
                    src={selectedFrame.imageUrl}
                    alt={selectedFrame.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : selectedFrame.cssPlaceholder !== "border-0" ? (
                  <div className={`absolute inset-0 ${selectedFrame.cssPlaceholder}`} />
                ) : (
                  <div className="absolute inset-0 bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                      crop_free
                    </span>
                    <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">Tanpa Frame</p>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <p className="font-label-caps text-label-caps text-ink-black">{selectedFrame.name}</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">{selectedFrame.category}</p>
              </div>
            </>
          ) : (
            <div className="aspect-[3/4] bg-surface-container flex flex-col items-center justify-center mb-4 sketch-border">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                filter_frames
              </span>
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">
                Belum ada frame dipilih
              </p>
            </div>
          )}

          <button
            onClick={() => setCurrentStep("camera")}
            disabled={!selectedFrameId}
            className="
              w-full py-4 px-6 bg-curtain-red text-paper-white
              font-interactive-btn text-interactive-btn
              border-2 border-ink-black sketch-border hard-shadow
              hover:scale-[1.02] active:scale-95
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              flex items-center justify-center gap-2
            "
            aria-label="Lanjut ke kamera"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
            Mulai Sesi Foto →
          </button>
          {!selectedFrameId && (
            <p className="font-label-caps text-[11px] text-on-surface-variant text-center mt-2">
              Pilih frame terlebih dahulu
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
