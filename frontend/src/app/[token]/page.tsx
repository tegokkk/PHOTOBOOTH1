import { notFound } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { toApiUrl } from "@/lib/media";
import { Metadata } from "next";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

// Fetch photo data from backend
async function getSharedPhoto(token: string, purpose?: "prefetch") {
  try {
    const headers = purpose ? { "x-purpose": purpose } : undefined;
    const res = await fetch(`${API_URL}/api/share/${token}`, {
      cache: "no-store", // Don't cache so access count updates correctly
      headers,
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// Generate dynamic metadata for social media sharing
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const photo = await getSharedPhoto(token, "prefetch");
  
  if (!photo) {
    return {
      title: "Foto Tidak Ditemukan | Photobooth",
    };
  }

  const frameText = photo.frame ? ` dengan frame ${photo.frame.name}` : "";
  const title = `Foto Photobooth Baru${frameText}!`;
  
  return {
    title,
    description: "Seseorang membagikan memori fotonya dengan Anda.",
    robots: { index: false, follow: false },
    openGraph: {
      title,
      images: [toApiUrl(photo.imageUrl)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [toApiUrl(photo.imageUrl)],
    },
  };
}

export default async function SharedPhotoPage({ params }: SharePageProps) {
  const { token } = await params;
  const photo = await getSharedPhoto(token);

  if (!photo) {
    notFound();
  }

  const imageUrl = toApiUrl(photo.imageUrl);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-paper-white p-4 md:p-8 sketch-border hard-shadow-lg flex flex-col gap-6">
        
        <div className="text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic">
            Memori yang Dibagikan
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Seseorang berbagi foto photobooth ini kepada Anda!
          </p>
        </div>

        <div className="relative w-full overflow-hidden sketch-border border-2 border-ink-black bg-surface-container-highest">
          <img 
            src={imageUrl} 
            alt="Shared Photo" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-4 w-full">
          {photo.frame && (
            <div className="flex justify-between items-center bg-surface-container p-3 sketch-border-thin">
              <span className="font-label-caps text-on-surface-variant text-xs">FRAME</span>
              <span className="font-bold text-ink-black">{photo.frame.name}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <a
              href={imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-4 bg-blueprint-blue text-paper-white font-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
              Unduh Gambar
            </a>
            
            <Link
              href="/"
              className="w-full px-4 py-4 bg-paper-white text-ink-black font-interactive-btn border-2 border-ink-black sketch-border hard-shadow hover:bg-surface-container-low active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
              Buat Foto Sendiri
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
