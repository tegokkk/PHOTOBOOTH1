"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/lib/api";
import { downloadMedia } from "@/lib/media";
import { useRouter } from "next/navigation";

import { PhotoRecord } from "@/types/gallery";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { PhotoDetailModal } from "@/components/gallery/PhotoDetailModal";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // Tabs: 'active' | 'trash'
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const { showToast } = useUIStore();
  const { user, token } = useAuthStore();
  const router = useRouter();

  const fetchPhotos = useCallback(async (reset = false) => {
    if (!user) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const url = new URL(`${API_URL}/api/photos`);
      url.searchParams.append("status", activeTab);
      url.searchParams.append("limit", "20");
      
      // If we are not resetting, use the nextCursor to fetch the next page
      if (!reset && nextCursor) {
        url.searchParams.append("cursor", nextCursor);
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(url.toString(), { headers });
      const data = await res.json();
      
      if (data.success) {
        setPhotos(prev => reset ? data.data : [...prev, ...data.data]);
        setHasNextPage(data.pagination?.hasNextPage || false);
        setNextCursor(data.pagination?.nextCursor || null);
      }
    } catch {
      showToast("Gagal memuat galeri foto.", "error");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user, token, activeTab, nextCursor, showToast]);

  // Initial load when tab or user changes
  useEffect(() => {
    const task = window.setTimeout(() => {
      void fetchPhotos(true);
    }, 0);
    return () => window.clearTimeout(task);
  }, [activeTab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteConfirmId) setDeleteConfirmId(null);
        else if (selectedPhoto) setSelectedPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, deleteConfirmId]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${API_URL}/api/photos/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local state instantly
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setSelectedPhoto(null);
        setDeleteConfirmId(null);
        showToast("Foto dipindah ke Tong Sampah.", "success");
      }
    } catch {
      showToast("Gagal menghapus foto.", "error");
      setDeleteConfirmId(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!id) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${API_URL}/api/photos/${id}/restore`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        // Remove from trash list locally
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setSelectedPhoto(null);
        showToast("Foto berhasil dipulihkan ke Galeri.", "success");
      }
    } catch {
      showToast("Gagal memulihkan foto.", "error");
    }
  };

  const handleDownload = async (photo: PhotoRecord) => {
    try {
      await downloadMedia(photo.compositeImageUrl, token, `photobooth_${photo.id}.png`);
      showToast("Foto diunduh!", "success");
    } catch {
      showToast("Foto tidak dapat diunduh.", "error");
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-gutter pt-6 pb-[100px] md:pb-gutter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-2 border-ink-black pb-4">
        <div>
          <h1 className="font-headline-lg text-ink-black italic">Galeri Foto</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Lihat, simpan, atau kelola memori fotomu.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-curtain-red text-paper-white font-label-caps text-label-caps border-2 border-ink-black sketch-border hard-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
          Foto Baru
        </button>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`font-label-caps text-sm px-4 py-2 border-b-2 transition-colors ${
              activeTab === "active" ? "border-ink-black text-ink-black" : "border-transparent text-on-surface-variant hover:text-ink-black"
            }`}
          >
            GALERI AKTIF
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`font-label-caps text-sm px-4 py-2 border-b-2 transition-colors ${
              activeTab === "trash" ? "border-curtain-red text-curtain-red" : "border-transparent text-on-surface-variant hover:text-ink-black"
            }`}
          >
            TONG SAMPAH
          </button>
        </div>
      )}

      {!user && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">lock</span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">Login Dibutuhkan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
            Silakan login untuk melihat dan menyimpan foto pribadi kamu.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blueprint-blue text-paper-white font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-105 transition-all mt-4"
          >
            Login / Daftar
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && user && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface-container-high animate-pulse sketch-border" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && photos.length === 0 && user && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">
            {activeTab === "active" ? "photo_library" : "delete"}
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">
            {activeTab === "active" ? "Belum ada foto" : "Tong sampah kosong"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
            {activeTab === "active" 
              ? "Foto yang kamu ambil dan simpan akan muncul di sini." 
              : "Foto yang dihapus akan masuk ke sini sebelum terhapus permanen."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-curtain-red text-paper-white font-interactive-btn text-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-105 transition-all mt-4"
            >
              Mulai Foto Sekarang
            </button>
          )}
        </div>
      )}

      {/* Photo Grid */}
      {!isLoading && photos.length > 0 && (
        <PhotoGrid
          photos={photos}
          activeTab={activeTab}
          onSelectPhoto={setSelectedPhoto}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => fetchPhotos(false)}
          token={token}
        />
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal
          key={selectedPhoto.id}
          photo={selectedPhoto}
          activeTab={activeTab}
          onClose={() => setSelectedPhoto(null)}
          onDownload={handleDownload}
          onDeleteClick={(id) => setDeleteConfirmId(id)}
          onRestore={handleRestore}
          token={token}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 bg-ink-black/60 backdrop-blur-sm z-[60]" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-paper-white sketch-border shadow-[8px_8px_0_0_#0F0F0F] flex flex-col overflow-hidden w-11/12 max-w-sm">
            <div className="p-6">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-curtain-red text-2xl">warning</span>
                Hapus Foto
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Foto akan dipindahkan ke Tong Sampah. Anda masih bisa memulihkannya nanti.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t-2 border-ink-black bg-surface-container-lowest">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 bg-paper-white text-ink-black font-label-caps text-label-caps border-2 border-ink-black sketch-border hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 bg-curtain-red text-paper-white font-label-caps text-label-caps border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.02] active:scale-95 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
