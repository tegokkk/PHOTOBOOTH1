"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { useUIStore } from "@/store/useUIStore";

export interface AdminPhoto {
  id: string;
  compositeImageUrl: string;
  createdAt: string;
  width?: number | null;
  height?: number | null;
  frame?: { name: string; category?: string | null } | null;
}

interface AdminPhotoQueueProps {
  photos: AdminPhoto[];
  token: string;
}

async function fetchPhotoBlobUrl(photo: AdminPhoto, token: string): Promise<string> {
  const response = await fetch(`${API_URL}${photo.compositeImageUrl}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Foto tidak dapat dimuat");
  return URL.createObjectURL(await response.blob());
}

async function fetchPhotoDataUrl(photo: AdminPhoto, token: string): Promise<string> {
  const response = await fetch(`${API_URL}${photo.compositeImageUrl}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Foto tidak dapat dimuat");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Foto tidak dapat diproses"));
    reader.readAsDataURL(blob);
  });
}

export function AdminPhotoQueue({ photos, token }: AdminPhotoQueueProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [printPhoto, setPrintPhoto] = useState<{ imageUrl: string; frameName: string } | null>(null);
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    let active = true;
    const loadedUrls: string[] = [];
    void Promise.all(photos.map(async (photo) => {
      try {
        const url = await fetchPhotoBlobUrl(photo, token);
        loadedUrls.push(url);
        return [photo.id, url] as const;
      } catch {
        return null;
      }
    })).then((entries) => {
      if (!active) return;
      setImageUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))));
    });

    return () => {
      active = false;
      loadedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos, token]);

  const handleReprint = async (photo: AdminPhoto) => {
    setLoadingPhotoId(photo.id);
    try {
      const imageUrl = await fetchPhotoDataUrl(photo, token);
      setPrintPhoto({ imageUrl, frameName: photo.frame?.name || "Tanpa Frame" });
    } catch {
      showToast("Foto tidak dapat disiapkan untuk cetak ulang.", "error");
    } finally {
      setLoadingPhotoId(null);
    }
  };

  return (
    <section className="mt-8 border-t-2 border-ink-black pt-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">Foto Operasional</h2>
          <p className="font-body-md text-sm text-on-surface-variant">Foto terbaru untuk pengecekan dan cetak ulang.</p>
        </div>
        <span className="font-label-caps text-xs text-on-surface-variant">Maks. 50 foto</span>
      </div>

      {photos.length === 0 ? (
        <div className="p-6 bg-surface-container border-2 border-ink-black sketch-border text-center text-on-surface-variant">Belum ada foto tersimpan.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-paper-white border-2 border-ink-black sketch-border hard-shadow overflow-hidden">
              <div className="aspect-[3/4] bg-surface-container-highest flex items-center justify-center">
                {imageUrls[photo.id] ? (
                  <img src={imageUrls[photo.id]} alt={`Foto ${photo.id}`} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">image</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-label-caps text-xs truncate">{photo.frame?.name || "Tanpa Frame"}</p>
                <p className="text-[10px] text-on-surface-variant mt-1">{new Date(photo.createdAt).toLocaleString("id-ID")}</p>
                <button
                  onClick={() => void handleReprint(photo)}
                  disabled={loadingPhotoId === photo.id}
                  className="w-full mt-3 py-2 bg-curtain-red text-paper-white border-2 border-ink-black font-label-caps text-xs disabled:opacity-60"
                >
                  {loadingPhotoId === photo.id ? "Menyiapkan..." : "Cetak Ulang"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {printPhoto && (
        <PrintPreviewDialog
          isOpen
          compositeDataUrl={printPhoto.imageUrl}
          frameName={printPhoto.frameName}
          onClose={() => setPrintPhoto(null)}
          onNewSession={() => setPrintPhoto(null)}
        />
      )}
    </section>
  );
}
