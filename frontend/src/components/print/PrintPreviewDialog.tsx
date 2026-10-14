"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/store/useUIStore";
import { hasPrintBridge, retryPrintJob, sendPrintJob } from "@/lib/printAdapter";
import { createPrintJob, PrintJob, updatePrintJob } from "@/lib/printQueue";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  compositeDataUrl: string;
  frameName: string;
  onClose: () => void;
  onNewSession: () => void;
}

/** Browser-print fallback until a local printer bridge is installed at the booth. */
export function PrintPreviewDialog({
  isOpen,
  compositeDataUrl,
  frameName,
  onClose,
  onNewSession,
}: PrintPreviewDialogProps) {
  const showToast = useUIStore((state) => state.showToast);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copies, setCopies] = useState(1);
  const [printLayout, setPrintLayout] = useState<"single" | "twin">("single");
  const [printSize, setPrintSize] = useState<"compact" | "mini" | "full">("compact");
  const [imageRatio, setImageRatio] = useState<number>(0.33); // width / height
  const [mounted, setMounted] = useState(false);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const afterPrintCleanupRef = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!compositeDataUrl) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > 0) {
        setImageRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = compositeDataUrl;
  }, [compositeDataUrl]);

  const isStrip = imageRatio < 0.65;

  useEffect(() => {
    if (!isOpen) {
      afterPrintCleanupRef.current?.();
      afterPrintCleanupRef.current = null;
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      afterPrintCleanupRef.current?.();
      afterPrintCleanupRef.current = null;
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBrowserPrint = () => {
    afterPrintCleanupRef.current?.();

    const handleAfterPrint = () => {
      afterPrintCleanupRef.current = null;
      showToast("Dialog cetak ditutup. Konfirmasi hasil fisik di bawah.", "info");
    };

    window.addEventListener("afterprint", handleAfterPrint, { once: true });
    afterPrintCleanupRef.current = () => window.removeEventListener("afterprint", handleAfterPrint);

    // Keep this directly in the click flow for iPad/Safari user-gesture rules.
    window.print();
    showToast("Dialog cetak dibuka. Periksa printer setelah dialog ditutup.", "info");
  };

  const markPrintCompleted = async () => {
    if (!printJob || isPrinting) return;
    afterPrintCleanupRef.current?.();
    afterPrintCleanupRef.current = null;
    const completedJob = await updatePrintJob(printJob.id, {
      status: "completed",
      errorMessage: undefined,
    });
    setPrintJob(completedJob || { ...printJob, status: "completed", errorMessage: undefined });
    showToast("Cetak ditandai berhasil. Pastikan hasil fisiknya sesuai.", "success");
  };

  const markPrintFailed = async () => {
    if (!printJob || isPrinting) return;
    afterPrintCleanupRef.current?.();
    afterPrintCleanupRef.current = null;
    const failedJob = await updatePrintJob(printJob.id, {
      status: "failed",
      errorMessage: "Hasil cetak belum keluar atau dialog dibatalkan.",
    });
    setPrintJob(failedJob || {
      ...printJob,
      status: "failed",
      errorMessage: "Hasil cetak belum keluar atau dialog dibatalkan.",
    });
    showToast("Cetak ditandai gagal. Silakan coba lagi.", "error");
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      if (!hasPrintBridge()) {
        const job = createPrintJob({ imageDataUrl: compositeDataUrl, frameName, copies });
        setPrintJob({ ...job, status: "printing" });
        void updatePrintJob(job.id, { status: "printing" }).then((updatedJob) => {
          if (updatedJob) setPrintJob(updatedJob);
        });
        handleBrowserPrint();
      } else {
        const job = await sendPrintJob({ imageDataUrl: compositeDataUrl, frameName, copies });
        setPrintJob(job);
        showToast("Job sent to printer bridge.", "success");
      }
    } catch (error) {
      console.error("Print bridge error:", error);
      const failedJob = error && typeof error === "object" && "printJob" in error
        ? (error as { printJob?: PrintJob }).printJob
        : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(error instanceof Error ? error.message : "Failed to send print job.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleRetry = async () => {
    if (!printJob || isPrinting) return;
    setIsPrinting(true);
    try {
      if (!hasPrintBridge()) {
        const retryJob: PrintJob = {
          ...printJob,
          status: "printing",
          errorMessage: undefined,
          attempts: printJob.attempts + 1,
          updatedAt: new Date().toISOString(),
        };
        setPrintJob(retryJob);
        void updatePrintJob(printJob.id, {
          status: "printing",
          errorMessage: undefined,
          attempts: printJob.attempts + 1,
        });
        handleBrowserPrint();
      } else {
        setPrintJob(await retryPrintJob(printJob));
        showToast("Job retried successfully.", "success");
      }
    } catch (error) {
      const failedJob = error && typeof error === "object" && "printJob" in error
        ? (error as { printJob?: PrintJob }).printJob
        : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(error instanceof Error ? error.message : "Failed to retry print.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const statusLabels: Record<PrintJob["status"], string> = {
    queued: "Menunggu antrean",
    printing: "Sedang mencetak",
    completed: "Cetak selesai",
    failed: "Cetak gagal",
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-stark-white border-border-thick border-ink-black pixel-corners hard-shadow-lg flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
        tabIndex={-1}
      >
        <div className="pixel-corners-inner"></div>

        <div className="flex items-center justify-between px-6 py-4 border-b-border-thick border-ink-black sticky top-0 bg-ink-black text-stark-white z-10">
          <div className="flex flex-col">
            <h2 id="print-dialog-title" className="font-tech-mono font-bold text-lg uppercase tracking-widest text-neon-yellow">PRINT_SYS</h2>
            <p className="font-tech-mono text-[10px] text-on-surface-variant uppercase">TARGET_FRAME: {frameName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border-2 border-stark-white bg-error-red text-stark-white hover:bg-error-red/80 transition-colors jiggle-active" aria-label="Tutup dialog cetak">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 bg-stark-white">
          {/* Paper Sheet Preview Simulation */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-tech-mono text-[11px] font-bold uppercase tracking-wider text-ink-black flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-cyber-purple">format_align_left</span>
                SIMULASI KERTAS CETAK (FLUSH KIRI)
              </span>
              <span className="font-tech-mono text-[10px] font-black bg-neon-yellow text-ink-black px-2 py-0.5 border border-ink-black uppercase">
                MARGIN: 0MM
              </span>
            </div>

            {/* Paper Sheet Representation */}
            <div className="w-full bg-[#f4f4f4] border-2 border-ink-black p-3 md:p-4 pixel-corners hard-shadow-sm flex justify-center items-center">
              <div className="pixel-corners-inner"></div>
              <div className="relative h-64 md:h-72 aspect-[2/3] bg-stark-white border-2 border-dashed border-ink-black/40 flex flex-col items-stretch justify-start overflow-hidden shadow-md">
                
                {/* Photo Row (flush top-left) */}
                <div className={`flex flex-row items-stretch justify-start ${
                  printSize === "compact" ? "h-[65%]" : printSize === "mini" ? "h-[48%]" : "h-full"
                }`}>
                  {/* Photo Strip 1 */}
                  <div className="h-full flex-shrink-0 relative border-r-2 border-dashed border-ink-black/60 bg-white">
                    <img
                      src={compositeDataUrl}
                      alt="Preview foto rata kiri"
                      className="h-full w-auto object-contain block"
                      decoding="async"
                    />
                    <div className="absolute top-1 left-1 bg-ink-black/80 text-neon-yellow font-tech-mono text-[7px] font-bold px-1 py-0.5 pointer-events-none">
                      KIRI (0MM)
                    </div>
                  </div>

                  {/* Twin strip if active */}
                  {printLayout === "twin" && isStrip && (
                    <div className="h-full flex-shrink-0 relative border-r-2 border-dashed border-ink-black/60 bg-white">
                      <img
                        src={compositeDataUrl}
                        alt="Preview foto twin"
                        className="h-full w-auto object-contain block"
                        decoding="async"
                      />
                    </div>
                  )}

                  {/* Right Leftover Area */}
                  <div className="flex-1 bg-[repeating-linear-gradient(45deg,#f9f9f9,#f9f9f9_8px,#f0f0f0_8px,#f0f0f0_16px)] flex flex-col items-center justify-center p-2 text-center select-none">
                    <span className="material-symbols-outlined text-ink-black/40 text-lg">content_cut</span>
                    <span className="font-tech-mono text-[8px] font-bold text-ink-black/60 uppercase">
                      SISA KERTAS KANAN
                    </span>
                    <span className="font-tech-mono text-[7px] text-ink-black/40 uppercase">
                      HEMAT / POTONG ✂️
                    </span>
                  </div>
                </div>

                {/* Bottom Leftover Area (when not full) */}
                {printSize !== "full" && (
                  <div className="w-full flex-1 border-t-2 border-dashed border-ink-black/40 bg-[repeating-linear-gradient(45deg,#f9f9f9,#f9f9f9_8px,#f0f0f0_8px,#f0f0f0_16px)] flex items-center justify-center select-none p-1">
                    <span className="font-tech-mono text-[8px] font-bold text-ink-black/50 uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">content_cut</span>
                      SISA KERTAS BAWAH (TIDAK PENUH 1 LEMBAR) ✂️
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="font-tech-mono text-[10px] text-on-surface-variant text-center uppercase">
              Foto dicetak lebih kecil di sudut kiri (0mm margin) agar tidak penuh satu kertas dan sisa kertas dapat disimpan/dipotong.
            </p>
          </div>

          {/* Print Size Selector (Kompak ~15cm, Mini ~12cm, Penuh 1 Kertas) */}
          <div className="flex flex-col gap-2 bg-surface-container p-3 border-border-thick border-ink-black hard-shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-tech-mono font-bold text-xs text-ink-black uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-cyber-purple">straighten</span>
                PILIH UKURAN CETAK
              </span>
              <span className="font-tech-mono text-[10px] font-bold text-cyber-purple bg-stark-white px-2 py-0.5 border border-ink-black">
                {printSize === "compact" ? "KOMPAK (~14.5 CM)" : printSize === "mini" ? "MINI (~11.5 CM)" : "PENUH KERTAS"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrintSize("compact")}
                className={`py-2 px-1 font-tech-mono font-bold text-xs uppercase border-2 border-ink-black flex flex-col items-center justify-center gap-0.5 transition-all jiggle-active ${
                  printSize === "compact"
                    ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.01]"
                    : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30"
                }`}
              >
                <span>KOMPAK</span>
                <span className="text-[9px] font-normal opacity-80">(~14.5 CM)</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("mini")}
                className={`py-2 px-1 font-tech-mono font-bold text-xs uppercase border-2 border-ink-black flex flex-col items-center justify-center gap-0.5 transition-all jiggle-active ${
                  printSize === "mini"
                    ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.01]"
                    : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30"
                }`}
              >
                <span>MINI</span>
                <span className="text-[9px] font-normal opacity-80">(~11.5 CM)</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintSize("full")}
                className={`py-2 px-1 font-tech-mono font-bold text-xs uppercase border-2 border-ink-black flex flex-col items-center justify-center gap-0.5 transition-all jiggle-active ${
                  printSize === "full"
                    ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.01]"
                    : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30"
                }`}
              >
                <span>PENUH</span>
                <span className="text-[9px] font-normal opacity-80">(100%)</span>
              </button>
            </div>
          </div>

          {/* Layout Mode for Strips */}
          {isStrip && (
            <div className="flex flex-col gap-2 bg-surface-container p-3 border-border-thick border-ink-black hard-shadow-sm">
              <span className="font-tech-mono font-bold text-xs text-ink-black uppercase">
                TATA LETAK STRIP
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintLayout("single")}
                  className={`py-2 px-3 font-tech-mono font-bold text-xs uppercase border-2 border-ink-black flex items-center justify-center gap-1.5 transition-all jiggle-active ${
                    printLayout === "single"
                      ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.01]"
                      : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">format_align_left</span>
                  1 STRIP (SISA KANAN)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLayout("twin")}
                  className={`py-2 px-3 font-tech-mono font-bold text-xs uppercase border-2 border-ink-black flex items-center justify-center gap-1.5 transition-all jiggle-active ${
                    printLayout === "twin"
                      ? "bg-neon-yellow text-ink-black hard-shadow-sm scale-[1.01]"
                      : "bg-stark-white text-ink-black/70 hover:bg-neon-yellow/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">view_column</span>
                  2 STRIP KEMBAR
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 bg-surface-container p-3 border-border-thick border-ink-black hard-shadow-sm">
            <label htmlFor="print-copies" className="font-tech-mono font-bold text-ink-black text-sm uppercase">COPIES_REQ</label>
            <select
              id="print-copies"
              value={copies}
              onChange={(event) => setCopies(Number(event.target.value))}
              disabled={isPrinting || Boolean(printJob)}
              className="border-2 border-ink-black bg-stark-white px-3 py-2 font-tech-mono font-bold text-ink-black focus:outline-none focus:ring-2 focus:ring-neon-yellow"
            >
              {[1, 2, 3].map((count) => <option key={count} value={count}>{count} SET</option>)}
            </select>
          </div>

          {printJob && (
            <div className={`p-4 border-border-thick border-ink-black pixel-corners text-sm ${printJob.status === "failed" ? "bg-error-red text-stark-white" : "bg-neon-yellow text-ink-black"}`}>
              <div className="pixel-corners-inner"></div>
              <div className="flex items-center justify-between gap-2 font-tech-mono relative z-10">
                <strong className="uppercase">STATUS: {statusLabels[printJob.status]}</strong>
                <span className="text-[10px]">#{printJob.id.slice(0, 8)}</span>
              </div>
              {printJob.errorMessage && <p className="mt-2 font-tech-mono text-xs uppercase relative z-10">{printJob.errorMessage}</p>}

              {printJob.status === "printing" && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10">
                  <button
                    onClick={() => void markPrintCompleted()}
                    disabled={isPrinting}
                    className="px-3 py-3 bg-stark-white text-ink-black border-2 border-ink-black font-tech-mono font-bold uppercase hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    HASIL SUDAH KELUAR
                  </button>
                  <button
                    onClick={() => void markPrintFailed()}
                    disabled={isPrinting}
                    className="px-3 py-3 bg-error-red text-stark-white border-2 border-ink-black font-tech-mono font-bold uppercase hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    TIDAK KELUAR
                  </button>
                </div>
              )}
              
              {printJob.status === "failed" && (
                <button onClick={handleRetry} disabled={isPrinting} className="mt-3 w-full px-4 py-3 bg-stark-white text-ink-black border-2 border-ink-black font-tech-mono font-bold uppercase hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all relative z-10">
                  RETRY_JOB
                </button>
              )}
              {printJob.status === "completed" && (
                <button onClick={handleRetry} disabled={isPrinting} className="mt-3 w-full px-4 py-3 bg-stark-white text-ink-black border-2 border-ink-black font-tech-mono font-bold uppercase hard-shadow-sm hover:scale-[1.01] active:scale-95 transition-all relative z-10">
                  REPRINT_JOB
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button onClick={handlePrint} disabled={isPrinting} className="py-4 bg-neon-yellow text-ink-black font-tech-mono font-bold text-sm uppercase border-border-thick border-ink-black hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
              {isPrinting ? "SPOOLING..." : "EXEC_PRINT"}
            </button>
            <button onClick={onNewSession} className="py-4 bg-cyber-purple text-neon-yellow font-tech-mono font-bold text-sm uppercase border-border-thick border-ink-black hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">restart_alt</span>
              NEW_SESSION
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Dedicated Print Portal attached directly to document.body for true 0mm left-aligned print */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="photobooth-print-surface" className={`print-size-${printSize}`} aria-hidden="true">
          <img
            src={compositeDataUrl}
            alt="Foto photobooth 1"
            className="photobooth-print-img"
          />
          {printLayout === "twin" && isStrip && (
            <img
              src={compositeDataUrl}
              alt="Foto photobooth 2"
              className="photobooth-print-img"
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
}
