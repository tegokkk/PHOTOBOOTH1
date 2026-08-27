"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getFramePreviewUrl, getPhotoCount } from "@/lib/frameMeta";
import { FramePreviewDialog } from "@/components/frame/FramePreviewDialog";

export function FrameSelectionScreen() {
  const { frames, isLoadingFrames, frameLoadError, fetchFrames, selectedFrameId, setSelectedFrameId, setCurrentStep } =
    useAppStore();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [previewFrameId, setPreviewFrameId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(frames.map((frame) => frame.category).filter(Boolean))).sort()],
    [frames]
  );

  useEffect(() => {
    if (frames.length === 0) fetchFrames();
  }, [fetchFrames, frames.length]);

  const effectiveCategory = categories.includes(activeCategory) ? activeCategory : "Semua";
  const filtered = useMemo(
    () => effectiveCategory === "Semua"
      ? frames
      : frames.filter((f) => f.category === effectiveCategory),
    [effectiveCategory, frames]
  );

  const previewFrame = useMemo(
    () => frames.find((frame) => frame.id === previewFrameId),
    [frames, previewFrameId]
  );

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrameId(frameId);
  };

  return (
    <>
    {/* Main Content Area */}
    <div className="flex-1 flex flex-col w-full bg-cyber-purple relative">
      {/* TopAppBar inside the view */}
      <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full z-50 bg-background border-b-border-thick border-ink-black sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">CYBER-BOOTH_V1.0</h1>
          <div className="hidden md:flex h-6 border-l-2 border-outline-variant mx-2"></div>
          <span className="hidden md:block font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 1 • PILIH FRAME</span>
        </div>
        <div className="flex items-center gap-4 text-neon-yellow">
          <span className="material-symbols-outlined text-[24px]">wifi_tethering</span>
          <span className="material-symbols-outlined text-[24px]">timer</span>
        </div>
      </header>

      {/* Mobile Step Indicator */}
      <div className="md:hidden bg-ink-black p-2 border-b-border-thick border-ink-black flex justify-center z-40 relative">
        <span className="font-tech-mono text-tech-mono uppercase text-neon-yellow font-bold">LANGKAH 1 • PILIH FRAME</span>
      </div>

      {/* Canvas */}
      <main className="flex-1 p-margin-mobile md:p-margin-desktop relative pb-[120px]">
        {/* Background pattern for that cyber-sketch feel */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "radial-gradient(#DFFF00 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Instructions Module */}
          <div className="w-full max-w-3xl mx-auto bg-stark-white border-border-thick border-ink-black hard-shadow mb-8 md:mb-12">
            {/* Window Controls */}
            <div className="border-b-border-thick border-ink-black bg-ink-black p-1 flex gap-1">
              <div className="w-2 h-2 bg-stark-white"></div>
              <div className="w-2 h-2 bg-neon-yellow"></div>
              <div className="w-2 h-2 bg-error-red"></div>
            </div>
            <div className="p-5 md:p-6 flex items-start gap-4">
              <span className="material-symbols-outlined text-ink-black text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera_back</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-ink-black uppercase leading-tight">PILIH FRAME FOTO</h2>
                <p className="font-body-md text-base md:text-lg leading-relaxed text-ink-black/80 font-bold mt-2">Klik frame yang kamu suka untuk melihat pratinjau. Jika sudah sesuai, lanjutkan ke sesi foto.</p>
              </div>
            </div>
          </div>

          {/* Category Tabs (Adapted to Cyber-Sketch) */}
          <div className="flex justify-center md:justify-start gap-2 overflow-x-auto no-scrollbar pb-6 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  shrink-0 px-4 py-2 font-label-caps text-label-caps text-sm border-2 border-ink-black uppercase
                  transition-all duration-150 hard-shadow-sm
                  ${
                      effectiveCategory === cat
                      ? "bg-neon-yellow text-ink-black font-bold hard-shadow"
                      : "bg-surface-container-high text-ink-black hover:bg-surface-container-highest"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Frame Grid */}
          {isLoadingFrames ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-surface-container-high animate-pulse border-border-thick border-ink-black"
                />
              ))}
            </div>
          ) : frameLoadError ? (
            <div className="mx-auto max-w-xl bg-paper-white border-border-thick border-ink-black hard-shadow-lg p-6 md:p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-curtain-red" aria-hidden="true">cloud_off</span>
              <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase">
                Frame belum tersedia
              </h2>
              <p className="mt-2 font-body-md text-on-surface-variant">
                {frameLoadError}
              </p>
              <button
                type="button"
                onClick={() => void fetchFrames()}
                className="mt-5 px-6 py-3 bg-neon-yellow text-ink-black font-label-caps text-label-caps font-bold border-border-thick border-ink-black hard-shadow jiggle-active"
              >
                <span className="material-symbols-outlined align-middle mr-2 text-base" aria-hidden="true">refresh</span>
                MUAT ULANG FRAME
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-xl bg-surface-container border-border-thick border-ink-black hard-shadow-lg p-6 md:p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-neon-yellow" aria-hidden="true">photo_library</span>
              <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-ink-black uppercase">
                Belum ada frame
              </h2>
              <p className="mt-2 font-body-md text-on-surface-variant">
                Belum ada frame aktif pada kategori ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((frame) => {
                const isSelected = selectedFrameId === frame.id;
                const previewUrl = getFramePreviewUrl(frame);
                
                return (
                  <label
                    key={frame.id}
                    className="cursor-pointer group relative block"
                    onClick={() => setPreviewFrameId(frame.id)}
                  >
                    <input 
                      type="radio" 
                      name="frame_selection" 
                      className="peer sr-only" 
                      checked={isSelected}
                      onChange={() => handleFrameSelect(frame.id)}
                    />
                    {/* Card Container */}
                    <div className="bg-surface-container border-border-thick border-ink-black hard-shadow h-full flex flex-col peer-checked:border-neon-yellow peer-checked:shadow-[8px_8px_0_0_#DFFF00] transition-all duration-200 jiggle-active hover:translate-y-[-4px] hover:translate-x-[-4px]">
                      
                      {/* Header */}
                      <div className="border-b-border-thick border-ink-black peer-checked:border-neon-yellow bg-ink-black p-2 flex justify-between items-center">
                        <span className="font-tech-mono text-tech-mono text-stark-white peer-checked:text-neon-yellow truncate mr-2 uppercase">
                          {frame.name}
                        </span>
                        <div className={`w-3 h-3 border-2 shrink-0 ${isSelected ? 'border-neon-yellow bg-neon-yellow' : 'border-stark-white'}`}></div>
                      </div>
                      
                      {/* Preview Area */}
                      <div className="p-6 flex-1 flex items-center justify-center relative bg-surface-container-highest min-h-[300px]">
                        {/* Tape Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 bg-ink-black transform -rotate-45 -translate-x-2 -translate-y-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-ink-black transform rotate-45 translate-x-2 -translate-y-2"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 bg-ink-black transform rotate-45 -translate-x-2 translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-ink-black transform -rotate-45 translate-x-2 translate-y-2"></div>
                        
                        {/* The Frame Visual Representation */}
                        <div className="w-full max-w-[80%] aspect-[3/4] p-2 relative flex items-center justify-center">
                           {previewUrl ? (
                             <img src={previewUrl} alt={frame.name} className="w-full h-full object-contain filter drop-shadow-md" loading="lazy" />
                           ) : (
                             <div className="w-full h-full border-4 border-stark-white border-dashed flex items-center justify-center">
                               <span className="material-symbols-outlined text-stark-white/50 text-[48px]">person</span>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      {/* Footer Details */}
                      <div className="p-3 border-t-border-thick border-ink-black peer-checked:border-neon-yellow bg-surface-container flex justify-between items-center">
                        <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">camera</span>
                          {previewUrl ? getPhotoCount(previewUrl) : '?'} FOTO
                        </span>
                        {isSelected && (
                          <span className="font-label-caps text-label-caps text-ink-black bg-neon-yellow px-2 py-1 font-bold">DIPILIH</span>
                        )}
                      </div>

                    </div>
                  </label>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>

    {previewFrame && (
      <FramePreviewDialog
        frame={previewFrame}
        onClose={() => setPreviewFrameId(null)}
        onContinue={() => {
          setPreviewFrameId(null);
          setCurrentStep("camera");
        }}
      />
    )}
    </>
  );
}
