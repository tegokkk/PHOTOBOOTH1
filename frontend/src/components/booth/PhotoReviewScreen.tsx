"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BoothHeader } from "./BoothHeader";

export function PhotoReviewScreen() {
  const { capturedPhotos, totalPhotosNeeded, startRetake, setCurrentStep } = useAppStore();
  const [selected, setSelected] = useState<number[]>([]);
  const indices = Array.from({ length: totalPhotosNeeded }, (_, index) => index);
  const isComplete = indices.every((index) => Boolean(capturedPhotos[index]));
  const containerWidth = totalPhotosNeeded === 1
    ? "max-w-md"
    : totalPhotosNeeded === 2
      ? "max-w-xl"
      : totalPhotosNeeded === 4
        ? "max-w-4xl"
        : "max-w-3xl";

  const gridColumns = totalPhotosNeeded === 1
    ? "grid-cols-1 max-w-xs mx-auto"
    : totalPhotosNeeded === 4
      ? "grid-cols-2 lg:grid-cols-4"
      : totalPhotosNeeded === 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  const toggle = (index: number) => setSelected((current) =>
    current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-studio-pattern">
      <BoothHeader currentStep={3} />
      <main className={`w-full ${containerWidth} mx-auto flex-1 flex flex-col justify-center px-4 py-4 sm:py-6`}>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">Periksa foto kamu</h1>
          <p className="text-xs leading-relaxed text-white/75">
            Pilih kolom untuk diambil ulang, atau langsung lanjutkan ke hasil foto.
          </p>
        </div>

        <section aria-label="Pilih kolom untuk retake" className="mt-3 rounded-2xl bg-white p-3.5 sm:p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p role="status" className="text-xs font-semibold text-slate-500">
              {selected.length ? `${selected.length} kolom dipilih untuk retake` : "Belum ada kolom dipilih"}
            </p>
            <button
              type="button"
              onClick={() => setSelected(selected.length === indices.length ? [] : indices)}
              className="min-h-8 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0038FF] hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {selected.length === indices.length ? "Batalkan pilihan" : "Pilih semua"}
            </button>
          </div>

          <div className={`grid gap-2.5 sm:gap-3 ${gridColumns}`}>
            {indices.map((index) => {
              const isSelected = selected.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Retake kolom ${index + 1}`}
                  aria-pressed={isSelected}
                  onClick={() => toggle(index)}
                  className={`min-w-0 overflow-hidden rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0038FF] ${
                    isSelected
                      ? "border-[#0038FF] ring-2 ring-[#0038FF]/20 bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    {capturedPhotos[index] ? (
                      <img src={capturedPhotos[index]} alt={`Hasil foto kolom ${index + 1}`} className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada foto</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1.5 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">Kolom {index + 1}</p>
                      <p className={`text-[11px] truncate ${isSelected ? "text-[#0038FF] font-semibold" : "text-slate-400"}`}>
                        {isSelected ? "Diambil ulang" : "Ketuk pilih"}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`material-symbols-outlined text-[18px] shrink-0 ${isSelected ? "text-[#0038FF]" : "text-slate-300"}`}
                    >
                      {isSelected ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Ketuk foto jika ingin retake
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                disabled={!selected.length}
                onClick={() => startRetake(selected)}
                className="min-h-10 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-[#0038FF] hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Retake pilihan{selected.length ? ` (${selected.length})` : ""}
              </button>
              <button
                type="button"
                disabled={!isComplete}
                onClick={() => setCurrentStep("preview")}
                className="min-h-10 rounded-xl bg-[#CCFF00] px-4 py-2 text-xs font-black text-black hover:bg-[#b8e600] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Foto sudah sesuai, lanjut
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
