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

const DATABASE_NAME = "ririi-photobooth";
const DATABASE_VERSION = 1;
const STORE_NAME = "print-jobs";
const memoryJobs = new Map<string, PrintJob>();
let databasePromise: Promise<IDBDatabase> | null = null;

function canUseIndexedDb(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  if (!canUseIndexedDb()) return Promise.reject(new Error("IndexedDB tidak tersedia"));
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Gagal membuka antrean printer"));
  });

  return databasePromise;
}

async function putJob(job: PrintJob): Promise<PrintJob> {
  memoryJobs.set(job.id, job);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(job);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("Gagal menyimpan antrean printer"));
    });
  } catch {
    // Memory is a safe fallback for browsers with IndexedDB disabled.
  }
  return job;
}

export async function getPrintJob(id: string): Promise<PrintJob | null> {
  if (!canUseIndexedDb()) return memoryJobs.get(id) || null;
  try {
    const db = await openDatabase();
    const job = await new Promise<PrintJob | undefined>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result as PrintJob | undefined);
      request.onerror = () => reject(request.error);
    });
    if (job) memoryJobs.set(job.id, job);
    return job || memoryJobs.get(id) || null;
  } catch {
    return memoryJobs.get(id) || null;
  }
}

export async function listPrintJobs(limit = 20): Promise<PrintJob[]> {
  if (!canUseIndexedDb()) return Array.from(memoryJobs.values()).slice(-limit).reverse();
  try {
    const db = await openDatabase();
    const jobs = await new Promise<PrintJob[]>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve((request.result as PrintJob[]) || []);
      request.onerror = () => reject(request.error);
    });
    jobs.forEach((job) => memoryJobs.set(job.id, job));
    return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  } catch {
    return Array.from(memoryJobs.values()).slice(-limit).reverse();
  }
}

export async function createPrintJob(request: PrintJobRequest): Promise<PrintJob> {
  const now = new Date().toISOString();
  return putJob({
    ...request,
    copies: Math.max(1, Math.min(3, Math.round(request.copies))),
    id: crypto.randomUUID(),
    status: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updatePrintJob(
  id: string,
  update: Partial<Pick<PrintJob, "status" | "errorMessage" | "attempts" | "copies">>,
): Promise<PrintJob | null> {
  const current = await getPrintJob(id);
  if (!current) return null;
  return putJob({ ...current, ...update, updatedAt: new Date().toISOString() });
}
