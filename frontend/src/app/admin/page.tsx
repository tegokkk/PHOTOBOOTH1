"use client";

import { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AdminPhoto, AdminPhotoQueue } from "@/components/admin/AdminPhotoQueue";

interface AdminMetrics {
  totalUsers: number;
  totalPhotos: number;
  photosToday: number;
  totalStorageMB: string | number;
}

export default function AdminDashboardPage() {
  const { showToast } = useUIStore();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_OPERATOR_PIN || "0606";
    if (pin === correctPin) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      showToast("PIN salah", "error");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin("");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsResponse, photosResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/metrics`),
        fetch(`${API_URL}/api/admin/photos?limit=50`),
      ]);
      const data =
        metricsResponse.ok &&
        metricsResponse.headers.get("content-type")?.includes("application/json")
          ? await metricsResponse.json().catch(() => null)
          : null;
      const photosData =
        photosResponse.ok &&
        photosResponse.headers.get("content-type")?.includes("application/json")
          ? await photosResponse.json().catch(() => null)
          : null;

      if (data?.success) {
        setMetrics(data.data);
      } else {
        showToast(data?.message || "Gagal memuat metrik.", "error");
      }
      if (photosData?.success && Array.isArray(photosData.data))
        setPhotos(photosData.data);
    } catch {
      showToast("Terjadi kesalahan saat menghubungi server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-grow w-full min-h-[calc(100vh-76px)] bg-studio-pattern p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white rounded-[2.5rem] border-4 border-white shadow-[0_24px_60px_rgba(0,0,0,0.35)] p-6 md:p-8 w-full max-w-md">
          <div className="w-14 h-14 rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto mb-4 shadow-md">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase text-black text-center">
            Login Admin Studio
          </h1>
          <p className="text-xs font-semibold text-black/60 text-center mt-1 mb-6">
            Masukkan PIN Operator untuk mengakses dasbor operasional.
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <input
              type="password"
              inputMode="numeric"
              placeholder="Masukkan PIN Operator"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-2xl bg-[#F8F9FA] border-2 border-gray-200 px-4 py-3.5 font-mono text-center tracking-[0.35em] text-lg font-black text-black focus:outline-none focus:border-[#0038FF] focus:bg-white"
              autoFocus
            />
            <Button type="submit" variant="primary" fullWidth>
              Masuk ke Dasbor
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => router.push("/")}
            >
              Kembali ke Studio
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full min-h-[calc(100vh-76px)] bg-studio-pattern">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-6 pb-24 space-y-6">
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0 shadow-sm">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                admin_panel_settings
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase text-black">
                Dashboard Admin
              </h1>
              <p className="text-xs md:text-sm font-semibold text-black/60">
                Pantau aktivitas sesi, penyimpanan, dan antrean cetak foto.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => fetchData()}>
              <span className="material-symbols-outlined mr-1.5 text-lg">
                refresh
              </span>
              Segarkan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Ke Photobooth
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              aria-label="Keluar dari akun admin"
            >
              <span className="material-symbols-outlined mr-1.5 text-lg" aria-hidden="true">
                logout
              </span>
              Keluar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-[2rem] bg-white animate-pulse p-6 shadow-xl"
              />
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MetricCard
              title="Total Foto Tersimpan"
              value={metrics.totalPhotos?.toString() || "0"}
              icon="photo_library"
              highlight="bg-[#CCFF00] text-black"
            />
            <MetricCard
              title="Foto Hari Ini"
              value={metrics.photosToday?.toString() || "0"}
              icon="today"
              highlight="bg-[#0038FF] text-white"
            />
            <MetricCard
              title="Total Penyimpanan"
              value={`${metrics.totalStorageMB || 0} MB`}
              icon="storage"
              highlight="bg-black text-[#CCFF00]"
            />
          </div>
        ) : (
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-center gap-2.5 text-sm font-bold shadow-lg">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span>Gagal memuat data dasbor. Pastikan server backend menyala.</span>
          </div>
        )}

        <AdminPhotoQueue photos={photos} token={""} />
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: string;
  highlight: string;
}) {
  return (
    <div className="p-6 rounded-[2rem] bg-white shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-black/55">
          {title}
        </h3>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs ${highlight}`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-3xl font-black text-black truncate">{value}</p>
    </div>
  );
}
