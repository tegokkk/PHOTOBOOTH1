"use client";

import { useState } from "react";

interface ShareDownloadButtonProps {
  imageUrl: string;
  filename?: string;
}

/** Uses a Blob URL so iPad/Safari can download a cross-origin protected image. */
export function ShareDownloadButton({
  imageUrl,
  filename = "pointer-photobooth.jpg",
}: ShareDownloadButtonProps) {
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
      className="w-full min-h-[52px] px-5 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
    >
      <span
        className="material-symbols-outlined text-lg"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        download
      </span>
      {isDownloading ? "Mengunduh..." : "Unduh Foto"}
    </button>
  );
}
