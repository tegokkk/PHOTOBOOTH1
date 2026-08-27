"use client";

import { useEffect, useRef, useState } from "react";
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
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const afterPrintCleanupRef = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
          <div className="bg-surface-container-highest p-4 border-border-thick border-ink-black flex justify-center pixel-corners hard-shadow-sm">
            <div className="pixel-corners-inner"></div>
            <img src={compositeDataUrl} alt="Preview foto yang akan dicetak" className="max-h-[48vh] w-auto max-w-full object-contain relative z-10" decoding="async" />
          </div>
          <p className="font-tech-mono text-[10px] text-on-surface-variant text-center uppercase">
            Pastikan ukuran kertas sesuai dengan printer booth.
          </p>
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

        <div id="photobooth-print-surface" aria-hidden="true" className="hidden">
          <img src={compositeDataUrl} alt="Foto photobooth" />
        </div>
      </div>
      </div>
    </>
  );
}
