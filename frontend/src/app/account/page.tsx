"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/Button";
import { LogOut, User, Settings, Camera } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

export default function AccountPage() {
  const { user, token, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
    }
  }, [token, user, router]);

  if (!user) return null; // Avoid flicker before redirect

  const handleLogout = () => {
    logout();
    showToast("Berhasil keluar", "success");
    router.push("/");
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-paper-white p-8 sketch-border hard-shadow-lg flex flex-col gap-6">
        
        <div className="flex items-center gap-4 border-b-2 border-ink-black pb-4">
          <div className="bg-surface-dim p-4 sketch-border-thin">
            <User className="size-12 text-ink-black" />
          </div>
          <div>
            <h1 className="font-headline-lg-mobile text-2xl text-ink-black font-bold">
              {user.fullName || "Pengguna"}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {user.email}
            </p>
            {user.isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blueprint-blue text-paper-white text-xs font-bold sketch-border-thin">
                Admin
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Settings className="size-5" /> Pengaturan Akun
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline" className="h-16 flex items-center justify-start gap-3 w-full">
                <Camera className="size-5" />
                <span>Mulai Foto Baru</span>
              </Button>
            </Link>

            {/* Placeholder for future features */}
            <Button variant="outline" className="h-16 flex items-center justify-start gap-3 w-full opacity-50 cursor-not-allowed">
              <User className="size-5" />
              <span>Edit Profil (Segera)</span>
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-ink-black pt-6 mt-2 flex justify-end">
          <Button 
            variant="danger" 
            className="flex items-center gap-2"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="size-4" />
            Keluar Akun
          </Button>
        </div>

      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <p className="mb-6 font-body-md">
          Apakah Anda yakin ingin keluar dari akun ini? Anda harus login kembali untuk menyimpan foto ke galeri privat Anda.
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Ya, Keluar
          </Button>
        </div>
      </Modal>

    </main>
  );
}
