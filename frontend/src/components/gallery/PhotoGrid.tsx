import { useEffect, useRef, useState } from "react";
import { PhotoRecord } from "@/types/gallery";
import { fetchMediaObjectUrl, isProtectedMedia, toApiUrl } from "@/lib/media";

interface PhotoGridProps {
  photos: PhotoRecord[];
  activeTab: "active" | "trash";
  onSelectPhoto: (photo: PhotoRecord) => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  token: string | null;
}

export function PhotoGrid({
  photos,
  activeTab,
  onSelectPhoto,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  token,
}: PhotoGridProps) {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadMedia = async () => {
      const entries = await Promise.all(
        photos.map(async (photo) => {
          try {
            const url = await fetchMediaObjectUrl(photo.compositeImageUrl, token);
            return [photo.id, url] as const;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) {
        entries.forEach((entry) => {
          if (entry?.[1].startsWith("blob:")) URL.revokeObjectURL(entry[1]);
        });
        return;
      }

      objectUrlsRef.current = entries
        .map((entry) => entry?.[1])
        .filter((url): url is string => Boolean(url?.startsWith("blob:")));
      setMediaUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))));
    };

    void loadMedia();

    return () => {
      cancelled = true;
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, [photos, token]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const imgSrc = mediaUrls[photo.id] || (!isProtectedMedia(photo.compositeImageUrl)
            ? toApiUrl(photo.compositeImageUrl)
            : null);

          return (
            <button
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className="relative aspect-[3/4] group sketch-border hard-shadow overflow-hidden hover:scale-[1.02] transition-transform duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-curtain-red"
              aria-label={`Lihat foto ${photo.id}`}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt="Foto photobooth"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover ${
                    activeTab === "trash" ? "grayscale opacity-80" : ""
                  }`}
                />
              ) : (
                <div className="absolute inset-0 animate-pulse bg-surface-container-high" aria-label="Memuat foto" />
              )}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-label-caps text-paper-white text-[10px] truncate">
                  {photo.frame?.name || "Tanpa Frame"}
                </p>
                <p className="font-label-caps text-paper-white/70 text-[10px]">
                  {new Date(photo.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-paper-white text-ink-black font-interactive-btn border-2 border-ink-black sketch-border hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        </div>
      )}
    </>
  );
}
