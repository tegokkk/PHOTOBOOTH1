"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
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
  const { user, token } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);

  useEffect(() => {
    // Basic protection: Must be logged in & must be admin
    // Note: the real protection is on the backend. This is just UI routing.
    if (!user) {
      router.replace("/login");
      return;
    }
    
    if (user && !user.isAdmin) {
      showToast("Akses ditolak. Halaman khusus Admin.", "error");
      router.replace("/");
      return;
    }

    const fetchMetrics = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [metricsResponse, photosResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/metrics`, { headers }),
          fetch(`${API_URL}/api/admin/photos?limit=50`, { headers }),
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

    fetchMetrics();
  }, [user, token, router, showToast]);

  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
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
            title="Total Pengguna" 
            value={metrics.totalUsers.toString()} 
            icon="group"
            color="bg-blueprint-blue text-paper-white" 
          />
          <MetricCard 
            title="Total Foto" 
            value={metrics.totalPhotos.toString()} 
            icon="photo_library"
            color="bg-paper-white text-ink-black" 
          />
          <MetricCard 
            title="Foto Hari Ini" 
            value={metrics.photosToday.toString()} 
            icon="today"
            color="bg-yellow-300 text-ink-black" 
          />
          <MetricCard 
            title="Penyimpanan" 
            value={`${metrics.totalStorageMB} MB`} 
            icon="storage"
            color="bg-curtain-red text-paper-white" 
          />
        </div>
      ) : (
        <div className="bg-red-50 text-red-800 p-4 border-2 border-red-800 sketch-border flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>Gagal memuat data dasbor. Pastikan Backend menyala dan Anda memiliki akses admin.</span>
        </div>
      )}
      
      <div className="mt-8 pt-8 border-t-2 border-ink-black">
        <h2 className="font-headline-lg-mobile text-ink-black mb-4">Aksi Cepat</h2>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <span className="material-symbols-outlined mr-2">refresh</span>
            Refresh Metrik
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>

      {token && <AdminPhotoQueue photos={photos} token={token} />}
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
