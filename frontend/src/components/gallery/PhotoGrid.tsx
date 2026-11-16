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
        })
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
      setMediaUrls(
        Object.fromEntries(
          entries.filter(
            (entry): entry is readonly [string, string] => Boolean(entry)
          )
        )
      );
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
          const imgSrc =
            mediaUrls[photo.id] ||
            (!isProtectedMedia(photo.compositeImageUrl)
              ? toApiUrl(photo.compositeImageUrl)
              : null);

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelectPhoto(photo)}
              className="relative aspect-[3/4] group rounded-2xl bg-white border border-[#DBEAFE] shadow-xs overflow-hidden hover:border-[#93C5FD] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#2563EB]/35 cursor-pointer"
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
                <div
                  className="absolute inset-0 animate-pulse bg-slate-100"
                  aria-label="Memuat foto"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-left">
                <p className="text-white font-semibold text-xs truncate">
                  {photo.frame?.name || "Tanpa Frame"}
                </p>
                <p className="text-white/75 text-[11px]">
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
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#1D4ED8] font-semibold text-sm border border-[#DBEAFE] shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoadingMore ? "Memuat..." : "Muat Lebih Banyak"}
          </button>
        </div>
      )}
    </>
  );
}
