export interface PrintJobRequest {
  imageDataUrl: string;
  frameName: string;
  copies: number;
}

const PRINT_BRIDGE_URL = process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL?.replace(/\/$/, "") || "";

export function hasPrintBridge(): boolean {
  return Boolean(PRINT_BRIDGE_URL);
}

/** Sends a job to the optional local bridge. Without it, the UI uses window.print(). */
export async function sendPrintJob(job: PrintJobRequest): Promise<void> {
  if (!PRINT_BRIDGE_URL) throw new Error("Print bridge belum dikonfigurasi");

  const response = await fetch(PRINT_BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Printer tidak dapat menerima pekerjaan cetak.");
  }
}
