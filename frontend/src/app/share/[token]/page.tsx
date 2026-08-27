import { notFound } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { toApiUrl } from "@/lib/media";
import { Metadata } from "next";
import { ShareDownloadButton } from "@/components/share/ShareDownloadButton";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

async function getSharedPhoto(token: string, purpose?: "prefetch") {
  try {
    const headers = purpose ? { "x-purpose": purpose } : undefined;
    const response = await fetch(`${API_URL}/api/share/${encodeURIComponent(token)}`, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const photo = await getSharedPhoto(token, "prefetch");

  if (!photo) {
    return { title: "Foto Tidak Ditemukan | Photobooth" };
  }

  const frameText = photo.frame ? ` dengan frame ${photo.frame.name}` : "";
  const title = `Foto Photobooth Baru${frameText}!`;

  return {
    title,
    description: "Seseorang membagikan memori fotonya dengan Anda.",
    robots: { index: false, follow: false },
    openGraph: { title, images: [toApiUrl(photo.imageUrl)] },
    twitter: { card: "summary_large_image", title, images: [toApiUrl(photo.imageUrl)] },
  };
}

export default async function SharedPhotoPage({ params }: SharePageProps) {
  const { token } = await params;
  const photo = await getSharedPhoto(token);

  if (!photo) notFound();

  const imageUrl = toApiUrl(photo.imageUrl);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 bg-ink-black">
      <div className="w-full max-w-2xl bg-stark-white p-6 md:p-8 border-border-thick border-ink-black pixel-corners hard-shadow-lg flex flex-col gap-6 relative">
        <div className="pixel-corners-inner"></div>
        <div className="text-center relative z-10">
          <h1 className="font-tech-mono text-xl uppercase tracking-widest text-ink-black font-bold">SHARED_MEMORY_SYS</h1>
          <p className="font-tech-mono text-[10px] text-on-surface-variant mt-2 uppercase">Someone shared this photobooth memory with you!</p>
        </div>

        <div className="relative w-full overflow-hidden border-border-thick border-ink-black bg-surface-container-highest hard-shadow-sm p-2 pixel-corners z-10">
          <div className="pixel-corners-inner"></div>
          <img src={imageUrl} alt="Shared Photo" fetchPriority="high" decoding="async" className="w-full h-auto object-contain relative z-10" />
        </div>

        <div className="flex flex-col gap-4 w-full relative z-10">
          {photo.frame && (
            <div className="flex justify-between items-center bg-surface-container p-3 border-border-thick border-ink-black pixel-corners">
              <div className="pixel-corners-inner"></div>
              <span className="font-tech-mono text-on-surface-variant text-[10px] uppercase font-bold relative z-10">TARGET_FRAME</span>
              <span className="font-tech-mono font-bold text-neon-yellow uppercase bg-ink-black px-2 py-1 text-xs border border-ink-black relative z-10">{photo.frame.name}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <ShareDownloadButton imageUrl={imageUrl} filename={`ririi-${photo.frame?.name || "photobooth"}.jpg`} />
            <Link href="/" className="w-full px-4 py-4 bg-stark-white text-ink-black font-tech-mono font-bold uppercase border-border-thick border-ink-black hard-shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
              CREATE_YOUR_OWN
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
