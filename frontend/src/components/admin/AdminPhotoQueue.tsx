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

async function fetchPhotoBlobUrl(
  photo: AdminPhoto,
  token: string
): Promise<string> {
  const response = await fetch(`${API_URL}${photo.compositeImageUrl}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Foto tidak dapat dimuat");
  return URL.createObjectURL(await response.blob());
}

async function fetchPhotoDataUrl(
  photo: AdminPhoto,
  token: string
): Promise<string> {
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
  const [printPhoto, setPrintPhoto] = useState<{
    imageUrl: string;
    frameName: string;
  } | null>(null);
  const [loadingPhotoId, setLoadingPhotoId] = useState<string | null>(null);
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    let active = true;
    const loadedUrls: string[] = [];
    void Promise.all(
      photos.map(async (photo) => {
        try {
          const url = await fetchPhotoBlobUrl(photo, token);
          loadedUrls.push(url);
          return [photo.id, url] as const;
        } catch {
          return null;
        }
      })
    ).then((entries) => {
      if (!active) return;
      setImageUrls(
        Object.fromEntries(
          entries.filter(
            (entry): entry is readonly [string, string] => Boolean(entry)
          )
        )
      );
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
      setPrintPhoto({
        imageUrl,
        frameName: photo.frame?.name || "Tanpa Frame",
      });
    } catch {
      showToast("Foto tidak dapat disiapkan untuk cetak ulang.", "error");
    } finally {
      setLoadingPhotoId(null);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-black uppercase text-black">
            Antrean & Riwayat Foto
          </h2>
          <p className="text-xs md:text-sm font-semibold text-black/55 mt-0.5">
            Foto terbaru untuk pengecekan dan cetak ulang cepat.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase">
          Maks. 50 foto
        </span>
      </div>

      {photos.length === 0 ? (
        <div className="p-8 rounded-[1.5rem] bg-[#F8F9FA] text-center text-sm font-semibold text-black/60">
          Belum ada foto tersimpan di server.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#F8F9FA] rounded-[1.5rem] border border-gray-100 overflow-hidden flex flex-col shadow-sm"
            >
              <div className="aspect-[3/4] bg-white p-2 flex items-center justify-center border-b border-gray-100">
                {imageUrls[photo.id] ? (
                  <img
                    src={imageUrls[photo.id]}
                    alt={`Foto ${photo.id}`}
                    className="w-full h-full object-contain drop-shadow-xs"
                    loading="lazy"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-gray-300">
                    image
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <p className="font-black text-xs text-black truncate">
                    {photo.frame?.name || "Tanpa Frame"}
                  </p>
                  <p className="text-[11px] font-medium text-black/55 mt-0.5">
                    {new Date(photo.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleReprint(photo)}
                  disabled={loadingPhotoId === photo.id}
                  className="w-full min-h-[40px] mt-3 py-2 px-3 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-[11px] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
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
