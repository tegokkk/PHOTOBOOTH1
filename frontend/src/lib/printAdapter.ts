import {
  createPrintJob,
  PrintJob,
  PrintJobRequest,
  updatePrintJob,
} from "@/lib/printQueue";
import { PRINT_4R } from "@/lib/print4R";

export type { PrintJob, PrintJobRequest } from "@/lib/printQueue";

const PRINT_BRIDGE_URL = process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL?.replace(/\/$/, "") || "";

export function hasPrintBridge(): boolean {
  return Boolean(PRINT_BRIDGE_URL);
}

/**
 * Sends a print job to the optional bridge. Keep its 4R raster in session memory
 * when the queue API returns metadata so retries retain the prepared print image.
 */
export async function sendPrintJob(request: PrintJobRequest): Promise<PrintJob> {
  const job = await createPrintJob(request);
  return dispatchPrintJob(job);
}

export async function retryPrintJob(job: PrintJob): Promise<PrintJob> {
  const nextJob = await updatePrintJob(job.id, {
    status: "queued",
    errorMessage: undefined,
    attempts: job.attempts,
  });
  return dispatchPrintJob(nextJob || job);
}

async function dispatchPrintJob(job: PrintJob): Promise<PrintJob> {
  if (!PRINT_BRIDGE_URL) return job;

  const printingJob = await updatePrintJob(job.id, {
    status: "printing",
    attempts: job.attempts + 1,
  });
  const activeJob = printingJob || job;

  try {
    const response = await fetch(PRINT_BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: activeJob.id,
        imageDataUrl: activeJob.imageDataUrl,
        frameName: activeJob.frameName,
        copies: activeJob.copies,
        paperSize: PRINT_4R.paperSize,
        widthMm: PRINT_4R.widthMm,
        heightMm: PRINT_4R.heightMm,
        dpi: PRINT_4R.dpi,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Printer tidak dapat menerima pekerjaan cetak.");
    }

    return (await updatePrintJob(activeJob.id, {
      status: "completed",
      errorMessage: undefined,
    })) || activeJob;
  } catch (error) {
    const failedJob = await updatePrintJob(activeJob.id, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Printer tidak dapat menerima pekerjaan cetak.",
    });
    throw Object.assign(error instanceof Error ? error : new Error("Gagal mencetak foto."), {
      printJob: failedJob || activeJob,
    });
  }
}
