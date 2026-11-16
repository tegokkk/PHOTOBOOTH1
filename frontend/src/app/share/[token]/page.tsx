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
    const response = await fetch(
      `${API_URL}/api/share/${encodeURIComponent(token)}`,
      {
        cache: "no-store",
        headers,
      }
    );

    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("application/json")
    )
      return null;
    const data = await response.json().catch(() => null);
    return data?.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const photo = await getSharedPhoto(token, "prefetch");

  if (!photo) {
    return { title: "Foto Tidak Ditemukan | Pointer Photobooth" };
  }

  const frameText = photo.frame ? ` dengan frame ${photo.frame.name}` : "";
  const title = `Foto Photobooth Baru${frameText}!`;

  return {
    title,
    description: "Seseorang membagikan memori fotonya dengan Anda.",
    robots: { index: false, follow: false },
    openGraph: { title, images: [toApiUrl(photo.imageUrl)] },
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

  if (!photo) notFound();

  const imageUrl = toApiUrl(photo.imageUrl);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 min-h-[calc(100vh-76px)] bg-studio-pattern">
      <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.35)] flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase mb-3 shadow-xs">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
            POINTER PHOTOBOOTH
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black">
            Kenangan Foto Studio
          </h1>
          <p className="text-xs md:text-sm font-semibold text-black/60 mt-1">
            Unduh hasil foto berkualitas tinggi langsung ke perangkatmu.
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-gray-100 bg-[#F8F9FA] p-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Foto Photobooth"
            fetchPriority="high"
            decoding="async"
            className="max-w-full max-h-[65vh] w-auto h-auto object-contain drop-shadow-md"
          />
        </div>

        <div className="flex flex-col gap-4 w-full">
          {photo.frame && (
            <div className="flex justify-between items-center bg-[#F8F9FA] px-4 py-3 rounded-2xl border border-gray-100">
              <span className="text-xs font-bold uppercase text-black/55">
                Bingkai Foto
              </span>
              <span className="font-black text-xs uppercase text-white bg-[#0038FF] px-3.5 py-1 rounded-full">
                {photo.frame.name}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShareDownloadButton
              imageUrl={imageUrl}
              filename={`pointer-${photo.frame?.name || "photobooth"}.jpg`}
            />
            <Link
              href="/"
              className="w-full min-h-[52px] px-5 py-3.5 rounded-full bg-[#0038FF] hover:bg-[#002db3] text-white font-black text-xs uppercase active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_a_photo
              </span>
              Buat Foto Baru
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
