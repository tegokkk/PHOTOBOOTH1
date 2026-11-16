"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getFramePreviewUrl, getPhotoCount } from "@/lib/frameMeta";
import { FramePreviewDialog } from "@/components/frame/FramePreviewDialog";
import { BoothHeader } from "./BoothHeader";

export function FrameSelectionScreen() {
  const {
    frames,
    isLoadingFrames,
    frameLoadError,
    fetchFrames,
    selectedFrameId,
    setSelectedFrameId,
    setCurrentStep,
  } = useAppStore();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [previewFrameId, setPreviewFrameId] = useState<string | null>(null);

  const categories = useMemo(
    () => [
      "Semua",
      ...Array.from(
        new Set(
          frames
            .map((frame) => frame.category)
            .filter((cat): cat is string => Boolean(cat))
        )
      ).sort(),
    ],
    [frames]
  );

  useEffect(() => {
    if (frames.length === 0) fetchFrames();
  }, [fetchFrames, frames.length]);

  const effectiveCategory = categories.includes(activeCategory)
    ? activeCategory
    : "Semua";
  const filtered = useMemo(
    () =>
      effectiveCategory === "Semua"
        ? frames
        : frames.filter((f) => f.category === effectiveCategory),
    [effectiveCategory, frames]
  );

  const previewFrame = useMemo(
    () => frames.find((frame) => frame.id === previewFrameId),
    [frames, previewFrameId]
  );

  const selectedFrame = useMemo(
    () => frames.find((frame) => frame.id === selectedFrameId),
    [frames, selectedFrameId]
  );

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrameId(frameId);
  };

  return (
    <>
      <div className="flex-1 flex flex-col w-full min-h-screen bg-studio-pattern relative">
        <BoothHeader currentStep={1} />

        <main className="flex-1 px-4 md:px-10 py-6 md:py-10 relative pb-36">
          <div className="max-w-6xl mx-auto relative z-10 space-y-6">
            {/* Hero-style Title & Category Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider mb-3 shadow-md">
                  <span className="material-symbols-outlined text-sm">
                    filter_frames
                  </span>
                  LANGKAH 01
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white text-3d-blue-sm leading-none">
                  PILIH BINGKAI <span className="text-[#CCFF00]">FOTO</span>
                </h2>
                <p className="text-sm md:text-base text-white/85 font-semibold mt-2">
                  Ketuk bingkai untuk melihat pratinjau ukuran penuh dan jumlah slot pose.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div
                className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0"
                role="tablist"
                aria-label="Filter kategori frame"
              >
                {categories.map((cat) => {
                  const isActive = effectiveCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 min-h-[44px] px-5 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#CCFF00] text-black border-2 border-white shadow-lg scale-[1.03]"
                          : "bg-white/10 text-white border border-white/35 hover:bg-white/20"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Grid */}
            {isLoadingFrames ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[2rem] bg-white/90 p-4 flex flex-col gap-3 animate-pulse shadow-xl"
                  >
                    <div className="flex-1 rounded-[1.5rem] bg-gray-200" />
                    <div className="h-5 w-2/3 rounded-full bg-gray-200" />
                    <div className="h-4 w-1/3 rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : frameLoadError ? (
              <div className="mx-auto max-w-lg bg-white rounded-[2rem] p-8 text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl" aria-hidden="true">
                    cloud_off
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black uppercase text-black">
                  Frame Belum Tersedia
                </h3>
                <p className="mt-1.5 text-sm text-black/65 font-medium">
                  {frameLoadError}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchFrames()}
                  className="mt-5 min-h-[48px] px-7 py-3 rounded-full bg-[#CCFF00] hover:bg-[#d8ff33] text-black font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    refresh
                  </span>
                  Muat Ulang Frame
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mx-auto max-w-lg bg-white rounded-[2rem] p-8 text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-[#0038FF]/10 text-[#0038FF] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl" aria-hidden="true">
                    photo_library
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black uppercase text-black">
                  Belum Ada Frame
                </h3>
                <p className="mt-1.5 text-sm text-black/65 font-medium">
                  Belum ada frame aktif pada kategori ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((frame) => {
                  const isSelected = selectedFrameId === frame.id;
                  const previewUrl = getFramePreviewUrl(frame);
                  const photoCount = previewUrl
                    ? getPhotoCount(previewUrl)
                    : frame.slots?.length || 1;

                  return (
                    <label
                      key={frame.id}
                      className="cursor-pointer group relative block"
                      onClick={() => {
                        handleFrameSelect(frame.id);
                        setPreviewFrameId(frame.id);
                      }}
                    >
                      <input
                        type="radio"
                        name="frame_selection"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => handleFrameSelect(frame.id)}
                      />
                      <div
                        className={`h-full rounded-[2rem] bg-white p-3.5 flex flex-col transition-all duration-200 ${
                          isSelected
                            ? "ring-4 ring-[#CCFF00] shadow-[0_20px_45px_rgba(0,0,0,0.35)] -translate-y-1"
                            : "shadow-xl hover:-translate-y-1 hover:shadow-2xl"
                        }`}
                      >
                        {/* Neutral Frame Thumbnail Stage */}
                        <div className="relative rounded-[1.5rem] bg-[#F8F9FA] border border-gray-100 p-4 flex-1 flex items-center justify-center min-h-[250px] overflow-hidden">
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[11px] font-black uppercase shadow-md">
                              <span className="material-symbols-outlined text-[14px]">
                                check
                              </span>
                              Dipilih
                            </div>
                          )}

                          <div className="w-full h-56 flex items-center justify-center">
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={frame.name}
                                className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-36 h-48 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 text-black/60">
                                <span className="material-symbols-outlined text-3xl text-[#0038FF]">
                                  crop_free
                                </span>
                                <span className="text-xs font-bold">
                                  Tanpa Frame
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Details Footer */}
                        <div className="pt-3.5 px-1.5 pb-1 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-black text-sm text-black truncate">
                              {frame.name}
                            </h3>
                            <p className="text-xs text-black/55 font-semibold truncate mt-0.5">
                              {frame.category || "Umum"}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black uppercase ${
                              isSelected
                                ? "bg-[#CCFF00] text-black"
                                : "bg-[#0038FF] text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              photo_camera
                            </span>
                            {photoCount} Foto
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Sticky Bottom Action Bar when a frame is selected */}
        {selectedFrame && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0038FF]/95 backdrop-blur-md border-t border-white/20 shadow-[0_-12px_32px_rgba(0,0,0,0.3)] px-4 md:px-10 py-3.5">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0 shadow-md">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">
                    Frame Terpilih
                  </p>
                  <p className="text-sm md:text-base font-black text-white truncate">
                    {selectedFrame.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewFrameId(selectedFrame.id)}
                  className="hidden sm:inline-flex min-h-[48px] px-5 py-2.5 rounded-full border border-white text-white hover:bg-white hover:text-[#0038FF] font-bold text-xs uppercase tracking-wide items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                  Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep("camera")}
                  className="min-h-[48px] px-7 py-2.5 rounded-full bg-[#CCFF00] hover:bg-white text-black hover:text-[#0038FF] border-2 border-white font-black text-xs md:text-sm uppercase tracking-wider shadow-lg inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Kamera</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {previewFrame && (
        <FramePreviewDialog
          frame={previewFrame}
          onClose={() => setPreviewFrameId(null)}
          onContinue={() => {
            setSelectedFrameId(previewFrame.id);
            setPreviewFrameId(null);
            setCurrentStep("camera");
          }}
        />
      )}
    </>
  );
}
