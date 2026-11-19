"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/store/useUIStore";
import { hasPrintBridge, retryPrintJob, sendPrintJob } from "@/lib/printAdapter";
import { createPrintJob, PrintJob, updatePrintJob } from "@/lib/printQueue";
import { prepare4RPrint, type PrintFitMode, type PrintLayout } from "@/lib/print4R";

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
  const [printLayout, setPrintLayout] = useState<PrintLayout>("single");
  const [fitMode, setFitMode] = useState<PrintFitMode>("cover");
  const [preparedPrint, setPreparedPrint] = useState<{
    source: string;
    layout: PrintLayout;
    fitMode: PrintFitMode;
    imageDataUrl?: string;
    isStrip?: boolean;
    error?: string;
  } | null>(null);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const afterPrintCleanupRef = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !compositeDataUrl) return;
    let active = true;
    void prepare4RPrint(compositeDataUrl, printLayout, fitMode).then((result) => {
      if (active) setPreparedPrint({ source: compositeDataUrl, layout: printLayout, fitMode, ...result });
    }).catch((error: unknown) => {
      if (active) setPreparedPrint({
        source: compositeDataUrl,
        layout: printLayout,
        fitMode,
        error: error instanceof Error ? error.message : "Gagal menyiapkan cetak 4R.",
      });
    });
    return () => { active = false; };
  }, [isOpen, compositeDataUrl, printLayout, fitMode]);

  const currentPrint =
    preparedPrint?.source === compositeDataUrl &&
    preparedPrint.layout === printLayout &&
    preparedPrint.fitMode === fitMode
      ? preparedPrint
      : null;
  const printImage = currentPrint?.imageDataUrl;
  const isStrip = Boolean(preparedPrint?.source === compositeDataUrl && preparedPrint.isStrip);

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

  const handleBrowserPrint = async () => {
    afterPrintCleanupRef.current?.();
    const images = document.querySelectorAll<HTMLImageElement>("#photobooth-print-surface img");
    await Promise.all(Array.from(images, (image) => image.decode()));

    const handleAfterPrint = () => {
      afterPrintCleanupRef.current = null;
      showToast("Dialog cetak ditutup. Konfirmasi hasil fisik di bawah.", "info");
    };

    window.addEventListener("afterprint", handleAfterPrint, { once: true });
    afterPrintCleanupRef.current = () =>
      window.removeEventListener("afterprint", handleAfterPrint);

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
    setPrintJob(
      completedJob || { ...printJob, status: "completed", errorMessage: undefined }
    );
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
    setPrintJob(
      failedJob || {
        ...printJob,
        status: "failed",
        errorMessage: "Hasil cetak belum keluar atau dialog dibatalkan.",
      }
    );
    showToast("Cetak ditandai gagal. Silakan coba lagi.", "error");
  };

  const handlePrint = async () => {
    if (isPrinting || !printImage) return;
    setIsPrinting(true);
    try {
      if (!hasPrintBridge()) {
        const job = createPrintJob({
          imageDataUrl: printImage,
          frameName,
          copies,
        });
        setPrintJob({ ...job, status: "printing" });
        void updatePrintJob(job.id, { status: "printing" }).then((updatedJob) => {
          if (updatedJob) setPrintJob(updatedJob);
        });
        await handleBrowserPrint();
      } else {
        const job = await sendPrintJob({
          imageDataUrl: printImage,
          frameName,
          copies,
        });
        setPrintJob(job);
        showToast("Job dikirim ke printer bridge.", "success");
      }
    } catch (error) {
      console.error("Print bridge error:", error);
      const failedJob =
        error && typeof error === "object" && "printJob" in error
          ? (error as { printJob?: PrintJob }).printJob
          : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(
        error instanceof Error ? error.message : "Gagal mengirim job cetak.",
        "error"
      );
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
        await handleBrowserPrint();
      } else {
        setPrintJob(await retryPrintJob(printJob));
        showToast("Cetak ulang berhasil dikirim.", "success");
      }
    } catch (error) {
      const failedJob =
        error && typeof error === "object" && "printJob" in error
          ? (error as { printJob?: PrintJob }).printJob
          : undefined;
      if (failedJob) setPrintJob(failedJob);
      showToast(
        error instanceof Error ? error.message : "Gagal mencetak ulang.",
        "error"
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const statusLabels: Record<PrintJob["status"], string> = {
    queued: "Menunggu Antrean",
    printing: "Sedang Mencetak",
    completed: "Cetak Selesai",
    failed: "Cetak Gagal",
  };

  return (
    <>
      {typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={dialogRef}
          className="relative z-10 w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-[2.5rem] border-4 border-[#0038FF] shadow-[0_24px_60px_rgba(0,0,0,0.4)] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-dialog-title"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  print
                </span>
              </div>
              <div className="min-w-0">
                <h2
                  id="print-dialog-title"
                  className="text-lg font-black uppercase text-black"
                >
                  Pratinjau & Cetak
                </h2>
                <p className="text-xs font-semibold text-black/55 truncate">
                  Bingkai: {frameName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 min-h-10 min-w-10 rounded-full bg-[#F8F9FA] hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup dialog cetak"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-black">Pratinjau Kertas 4R</span>
                <span className="text-[11px] font-black bg-[#CCFF00] text-black px-3 py-1 rounded-full">4 × 6 inci</span>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-slate-100 p-4 flex justify-center">
                <div className="h-64 sm:h-72 aspect-[2/3] bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {printImage ? (
                    <img src={printImage} alt="Pratinjau cetak 4R" className="w-full h-full object-contain" />
                  ) : (
                    <p role={currentPrint?.error ? "alert" : "status"} className="px-3 text-center text-xs text-slate-500">
                      {currentPrint?.error || "Menyiapkan pratinjau 4R..."}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3.5">
                <p className="text-sm font-bold text-[#0038FF]">Ukuran tetap: 4R · 10,16 × 15,24 cm</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {fitMode === "cover"
                    ? "Mode Penuh 4R mengisi 100% kertas 4 × 6 inci (1200 × 1800 px) tanpa tepi putih atas/bawah."
                    : "Mode Utuh menjaga seluruh tepi bingkai tetap terlihat dengan area sisa berwarna putih."}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Pada dialog printer: pilih kertas <strong>4 × 6 inci (102 × 152 mm)</strong>, <strong>Margins: None</strong>, <strong>Scale: 100% / Actual size</strong>, matikan header/footer, dan aktifkan <strong>Borderless</strong> jika printer mendukung.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-[#F8F9FA] p-3.5 rounded-[1.5rem] border border-gray-100">
              <span className="font-black uppercase text-xs text-black">
                Skala Bingkai pada Kertas 4R
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFitMode("cover")}
                  disabled={isPrinting || Boolean(printJob)}
                  aria-pressed={fitMode === "cover"}
                  className={`min-h-[44px] py-2 px-3 rounded-full font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    fitMode === "cover"
                      ? "bg-[#0038FF] text-white shadow-md"
                      : "bg-white text-black/70 border border-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    fit_screen
                  </span>
                  Penuh 4R (Fill)
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode("contain")}
                  disabled={isPrinting || Boolean(printJob)}
                  aria-pressed={fitMode === "contain"}
                  className={`min-h-[44px] py-2 px-3 rounded-full font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    fitMode === "contain"
                      ? "bg-[#0038FF] text-white shadow-md"
                      : "bg-white text-black/70 border border-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    crop_free
                  </span>
                  Utuh (Fit)
                </button>
              </div>
            </div>

            {isStrip && (
              <div className="flex flex-col gap-2 bg-[#F8F9FA] p-3.5 rounded-[1.5rem] border border-gray-100">
                <span className="font-black uppercase text-xs text-black">
                  Tata Letak Strip
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintLayout("single")}
                    disabled={isPrinting || Boolean(printJob)}
                    aria-pressed={printLayout === "single"}
                    className={`min-h-[44px] py-2 px-3 rounded-full font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      printLayout === "single"
                        ? "bg-[#0038FF] text-white shadow-md"
                        : "bg-white text-black/70 border border-gray-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      format_align_left
                    </span>
                    1 Strip
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintLayout("twin")}
                    disabled={isPrinting || Boolean(printJob)}
                    aria-pressed={printLayout === "twin"}
                    className={`min-h-[44px] py-2 px-3 rounded-full font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      printLayout === "twin"
                        ? "bg-[#0038FF] text-white shadow-md"
                        : "bg-white text-black/70 border border-gray-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      view_column
                    </span>
                    2 Strip Kembar
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 bg-[#F8F9FA] px-4 py-3 rounded-[1.5rem] border border-gray-100">
              <label
                htmlFor="print-copies"
                className="font-black uppercase text-black text-xs"
              >
                Jumlah Cetak
              </label>
              <select
                id="print-copies"
                value={copies}
                onChange={(event) => setCopies(Number(event.target.value))}
                disabled={isPrinting || Boolean(printJob)}
                className="min-h-[42px] rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-[#0038FF]"
              >
                {[1, 2, 3].map((count) => (
                  <option key={count} value={count}>
                    {count} Lembar
                  </option>
                ))}
              </select>
            </div>

            {printJob && (
              <div
                className={`p-4 rounded-[1.5rem] border text-sm ${
                  printJob.status === "failed"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-[#CCFF00]/30 border-[#CCFF00] text-black"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="font-black text-xs uppercase tracking-wide">
                    Status: {statusLabels[printJob.status]}
                  </strong>
                  <span className="font-mono text-xs text-black/60">
                    #{printJob.id.slice(0, 8)}
                  </span>
                </div>
                {printJob.errorMessage && (
                  <p className="mt-1.5 text-xs text-red-700 font-semibold">
                    {printJob.errorMessage}
                  </p>
                )}

                {printJob.status === "printing" && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => void markPrintCompleted()}
                      disabled={isPrinting}
                      className="min-h-[44px] px-3 py-2.5 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-xs uppercase transition-all cursor-pointer"
                    >
                      Hasil Sudah Keluar
                    </button>
                    <button
                      type="button"
                      onClick={() => void markPrintFailed()}
                      disabled={isPrinting}
                      className="min-h-[44px] px-3 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase transition-all cursor-pointer"
                    >
                      Tidak Keluar
                    </button>
                  </div>
                )}

                {printJob.status === "failed" && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isPrinting}
                    className="mt-3 w-full min-h-[44px] px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 text-black border border-red-200 font-black text-xs uppercase transition-all cursor-pointer"
                  >
                    Coba Cetak Lagi
                  </button>
                )}
                {printJob.status === "completed" && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isPrinting}
                    className="mt-3 w-full min-h-[44px] px-4 py-2.5 rounded-full bg-white hover:bg-gray-100 text-[#0038FF] border border-[#0038FF]/30 font-black text-xs uppercase transition-all cursor-pointer"
                  >
                    Cetak Ulang
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting || !printImage}
                className="min-h-[52px] py-3.5 px-5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  print
                </span>
                {isPrinting || (!printImage && !currentPrint?.error) ? "Menyiapkan..." : "Cetak 4R"}
              </button>
              <button
                type="button"
                onClick={onNewSession}
                className="min-h-[52px] py-3.5 px-5 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">
                  restart_alt
                </span>
                Sesi Baru
              </button>
            </div>
          </div>
        </div>
      </div>, document.body)}

      {/* Every copy is a complete 4R page; preview and bridge use this same raster. */}
      {typeof document !== "undefined" && printImage &&
        createPortal(
          <div id="photobooth-print-surface" aria-hidden="true">
            {Array.from({ length: copies }, (_, index) => (
              <div className="photobooth-print-page" key={index}>
                <img src={printImage} alt={`Foto photobooth 4R ${index + 1}`} className="photobooth-print-img" />
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
