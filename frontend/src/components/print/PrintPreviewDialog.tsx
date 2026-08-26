"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBrowserPrint = async (job: PrintJob) => {
    // Keep this directly inside the click handler for iPad/Safari user-gesture rules.
    window.print();
    const completedJob = await updatePrintJob(job.id, { status: "completed" });
    setPrintJob(completedJob || job);
    showToast("Dialog cetak selesai. Pastikan printer benar-benar mencetak foto.", "info");
  };

  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      if (!hasPrintBridge()) {
        const job = await createPrintJob({ imageDataUrl: compositeDataUrl, frameName, copies });
        setPrintJob(await updatePrintJob(job.id, { status: "printing" }) || job);
        await handleBrowserPrint(job);
      } else {
        const job = await sendPrintJob({ imageDataUrl: compositeDataUrl, frameName, copies });
        setPrintJob(job);
        showToast("Foto selesai dikirim ke printer.", "success");
      }
    } catch (error) {
      console.error("Print bridge error:", error);
      const failedJob = error && typeof error === "object" && "printJob" in error
        ? (error as { printJob?: PrintJob }).printJob
        : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(error instanceof Error ? error.message : "Gagal mengirim foto ke printer.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleRetry = async () => {
    if (!printJob || isPrinting) return;
    setIsPrinting(true);
    try {
      if (!hasPrintBridge()) {
        await handleBrowserPrint(printJob);
      } else {
        setPrintJob(await retryPrintJob(printJob));
        showToast("Foto berhasil dikirim ulang ke printer.", "success");
      }
    } catch (error) {
      const failedJob = error && typeof error === "object" && "printJob" in error
        ? (error as { printJob?: PrintJob }).printJob
        : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(error instanceof Error ? error.message : "Gagal mencoba ulang cetak.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink-black/50 backdrop-blur-sm z-[70]" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] w-auto md:w-full md:max-w-xl max-h-[92vh] overflow-y-auto bg-paper-white border-2 border-ink-black sketch-border hard-shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink-black">
          <div>
            <h2 id="print-dialog-title" className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">Cetak Foto</h2>
            <p className="font-body-md text-sm text-on-surface-variant">Frame: <strong>{frameName}</strong></p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border-2 border-ink-black" aria-label="Tutup dialog cetak">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-surface-container-highest p-4 sketch-border border-2 border-ink-black flex justify-center">
            <img src={compositeDataUrl} alt="Preview foto yang akan dicetak" className="max-h-[52vh] w-auto max-w-full object-contain" decoding="async" />
          </div>
          <p className="font-body-md text-sm text-on-surface-variant text-center">
            Ukuran mengikuti pengaturan printer. Untuk operasional booth, gunakan printer foto 4×6 atau ukuran yang sudah disetel.
          </p>
          <div className="flex items-center justify-between gap-4 bg-surface-container p-3 sketch-border-thin">
            <label htmlFor="print-copies" className="font-label-caps text-label-caps text-sm">Jumlah cetak</label>
            <select
              id="print-copies"
              value={copies}
              onChange={(event) => setCopies(Number(event.target.value))}
              disabled={isPrinting || Boolean(printJob)}
              className="border-2 border-ink-black bg-paper-white px-3 py-2 font-label-caps text-label-caps"
            >
              {[1, 2, 3].map((count) => <option key={count} value={count}>{count} lembar</option>)}
            </select>
          </div>
          {printJob && (
            <div className={`p-3 border-2 border-ink-black sketch-border-thin text-sm ${printJob.status === "failed" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-900"}`}>
              <div className="flex items-center justify-between gap-2">
                <strong>Status: {printJob.status === "completed" ? "Selesai" : printJob.status === "failed" ? "Gagal" : printJob.status === "printing" ? "Mencetak" : "Antrean"}</strong>
                <span className="font-mono text-xs">#{printJob.id.slice(0, 8)}</span>
              </div>
              {printJob.errorMessage && <p className="mt-1">{printJob.errorMessage}</p>}
              {printJob.status === "failed" && (
                <button onClick={handleRetry} disabled={isPrinting} className="mt-3 px-4 py-2 bg-curtain-red text-paper-white border-2 border-ink-black font-label-caps text-label-caps">
                  Coba Lagi
                </button>
              )}
              {printJob.status === "completed" && (
                <button onClick={handleRetry} disabled={isPrinting} className="mt-3 px-4 py-2 bg-paper-white text-ink-black border-2 border-ink-black font-label-caps text-label-caps">
                  Cetak Ulang
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={handlePrint} disabled={isPrinting} className="py-4 bg-curtain-red text-paper-white font-interactive-btn border-2 border-ink-black sketch-border hard-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
              {isPrinting ? "Mengirim..." : hasPrintBridge() ? "Kirim ke Printer" : "Cetak Sekarang"}
            </button>
            <button onClick={onNewSession} className="py-4 bg-paper-white text-ink-black font-interactive-btn border-2 border-ink-black sketch-border hard-shadow flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">restart_alt</span>
              Sesi Baru
            </button>
          </div>
        </div>

        <div id="photobooth-print-surface" aria-hidden="true">
          <img src={compositeDataUrl} alt="Foto photobooth" />
        </div>
      </div>
    </>
  );
}
