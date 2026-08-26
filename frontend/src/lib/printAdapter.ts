import {
  createPrintJob,
  PrintJob,
  PrintJobRequest,
  updatePrintJob,
} from "@/lib/printQueue";

export type { PrintJob, PrintJobRequest } from "@/lib/printQueue";

const PRINT_BRIDGE_URL = process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL?.replace(/\/$/, "") || "";

export function hasPrintBridge(): boolean {
  return Boolean(PRINT_BRIDGE_URL);
}

/**
 * Sends a durable local print job to the optional bridge. The image is kept in
 * IndexedDB so a failed job can be retried without asking the customer to pose again.
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
