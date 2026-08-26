"use client";

import { useState } from "react";

interface ShareDownloadButtonProps {
  imageUrl: string;
  filename?: string;
}

/** Uses a Blob URL so iPad/Safari can download a cross-origin protected image. */
export function ShareDownloadButton({ imageUrl, filename = "ririi-photobooth.jpg" }: ShareDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Gambar tidak dapat diunduh");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      // The fallback keeps the image reachable if Safari blocks a Blob download.
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="w-full px-4 py-4 bg-blueprint-blue text-paper-white font-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
      {isDownloading ? "Menyiapkan Unduhan..." : "Unduh Gambar"}
    </button>
  );
}
