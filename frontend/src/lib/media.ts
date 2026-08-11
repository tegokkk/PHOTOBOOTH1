import { API_URL } from "@/lib/api";

const API_ORIGIN = API_URL.replace(/\/$/, "");

export function toApiUrl(resource: string): string {
  if (/^(https?:|data:|blob:)/i.test(resource)) return resource;
  return `${API_ORIGIN}/${resource.replace(/^\//, "")}`;
}

export function isProtectedMedia(resource: string): boolean {
  return resource.includes("/api/media/");
}

export async function fetchMediaObjectUrl(resource: string, token: string | null): Promise<string> {
  const url = toApiUrl(resource);
  if (!isProtectedMedia(resource)) return url;

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Media tidak dapat dimuat");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function downloadMedia(
  resource: string,
  token: string | null,
  filename: string,
): Promise<void> {
  const url = toApiUrl(resource);
  let downloadUrl = url;
  let shouldRevoke = false;

  if (isProtectedMedia(resource)) {
    downloadUrl = await fetchMediaObjectUrl(resource, token);
    shouldRevoke = downloadUrl.startsWith("blob:");
  }

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (shouldRevoke) URL.revokeObjectURL(downloadUrl);
}
