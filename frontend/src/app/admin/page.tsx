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
    const correctPin = process.env.NEXT_PUBLIC_OPERATOR_PIN || "0909";
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
      const data = await metricsResponse.json();
      const photosData = await photosResponse.json();

      if (data.success) {
        setMetrics(data.data);
      } else {
        showToast(data.message || "Gagal memuat metrik.", "error");
      }
      if (photosData.success && Array.isArray(photosData.data)) setPhotos(photosData.data);
    } catch {
      showToast("Terjadi kesalahan saat menghubungi server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-grow w-full max-w-md mx-auto p-4 md:p-8 pt-24 pb-24 flex flex-col items-center justify-center">
        <div className="bg-surface-container border-2 border-ink-black hard-shadow p-8 w-full">
          <h1 className="font-headline-lg text-ink-black mb-6 text-center">Login Admin</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Masukkan PIN Operator"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-stark-white border-2 border-ink-black px-4 py-3 font-tech-mono text-center tracking-widest text-lg focus:outline-none focus:ring-4 focus:ring-neon-yellow"
              autoFocus
            />
            <Button type="submit" variant="primary" className="w-full">
              Masuk
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/")}>
              Kembali
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-5xl mx-auto p-4 md:p-8 pt-6 pb-24">
      <div className="flex items-center justify-between mb-8 border-b-2 border-ink-black pb-4">
        <div>
          <h1 className="font-headline-lg text-ink-black flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-curtain-red" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
            Dashboard Admin
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Pantau aktivitas dan statistik aplikasi.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} aria-label="Keluar dari akun admin">
          <span className="material-symbols-outlined mr-2" aria-hidden="true">logout</span>
          Keluar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-surface-container-high animate-pulse sketch-border" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Foto" 
            value={metrics.totalPhotos?.toString() || "0"} 
            icon="photo_library"
            color="bg-paper-white text-ink-black" 
          />
          <MetricCard 
            title="Foto Hari Ini" 
            value={metrics.photosToday?.toString() || "0"} 
            icon="today"
            color="bg-yellow-300 text-ink-black" 
          />
          <MetricCard 
            title="Penyimpanan" 
            value={`${metrics.totalStorageMB || 0} MB`} 
            icon="storage"
            color="bg-curtain-red text-paper-white" 
          />
        </div>
      ) : (
        <div className="bg-red-50 text-red-800 p-4 border-2 border-red-800 sketch-border flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>Gagal memuat data dasbor. Pastikan Backend menyala.</span>
        </div>
      )}
      
      <div className="mt-8 pt-8 border-t-2 border-ink-black">
        <h2 className="font-headline-lg-mobile text-ink-black mb-4">Aksi Cepat</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => fetchData()}>
            <span className="material-symbols-outlined mr-2">refresh</span>
            Refresh Metrik
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>

      <AdminPhotoQueue photos={photos} token={""} />
    </main>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) {
  return (
    <div className={`p-6 border-2 border-ink-black sketch-border hard-shadow flex flex-col justify-between ${color}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-label-caps text-sm opacity-90">{title}</h3>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <p className="font-headline-lg text-4xl truncate">{value}</p>
    </div>
  );
}
