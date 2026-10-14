export type PrintJobStatus = "queued" | "printing" | "completed" | "failed";

export interface PrintJobRequest {
  imageDataUrl: string;
  frameName: string;
  copies: number;
}

export interface PrintJob extends PrintJobRequest {
  id: string;
  status: PrintJobStatus;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

import { API_URL } from "@/lib/api";

const memoryJobs = new Map<string, PrintJob>();

// Base API URL for backend print queue
const PRINT_API_BASE = `${API_URL.replace(/\/api\/?$/, "")}/api/print`;

async function parseJsonSafely(res: Response) {
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getPrintJob(id: string): Promise<PrintJob | null> {
  try {
    const res = await fetch(`${PRINT_API_BASE}/${id}`);
    const data = await parseJsonSafely(res);
    if (data?.success && data.data) {
      const job = data.data as PrintJob;
      memoryJobs.set(id, job);
      return job;
    }
  } catch (error) {
    console.warn("Failed to get print job from server", error);
  }
  return memoryJobs.get(id) || null;
}

export async function listPrintJobs(limit = 20): Promise<PrintJob[]> {
  try {
    const res = await fetch(`${PRINT_API_BASE}/queue?limit=${limit}`);
    const data = await parseJsonSafely(res);
    if (data?.success && Array.isArray(data.data)) {
      const jobs = data.data as PrintJob[];
      jobs.forEach(job => memoryJobs.set(job.id, job));
      return jobs;
    }
  } catch (error) {
    console.warn("Failed to list print jobs from server", error);
  }
  return Array.from(memoryJobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function createPrintJob(request: PrintJobRequest): PrintJob {
  const now = new Date().toISOString();
  const tempId = crypto.randomUUID();
  const job: PrintJob = {
    ...request,
    copies: Math.max(1, Math.min(3, Math.round(request.copies))),
    id: tempId,
    status: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  memoryJobs.set(tempId, job);

  // Async API call without blocking
  fetch(PRINT_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, id: tempId })
  }).then(async (res) => {
    const data = await parseJsonSafely(res);
    if (data?.success && data.data) {
      memoryJobs.set(data.data.id, data.data as PrintJob);
    }
  }).catch(err => console.warn("Failed to create print job on server", err));

  return job;
}

export async function updatePrintJob(
  id: string,
  update: Partial<Pick<PrintJob, "status" | "errorMessage" | "attempts" | "copies">>,
): Promise<PrintJob | null> {
  const current = memoryJobs.get(id) || { id, ...update } as PrintJob;
  const updated = { ...current, ...update, updatedAt: new Date().toISOString() };
  memoryJobs.set(id, updated);

  try {
    const res = await fetch(`${PRINT_API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });
    const data = await parseJsonSafely(res);
    if (data?.success && data.data) {
      memoryJobs.set(data.data.id, data.data as PrintJob);
      return data.data;
    }
  } catch (error) {
    console.warn("Failed to update print job on server", error);
  }
  return updated;
}
