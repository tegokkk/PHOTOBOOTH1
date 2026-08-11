"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Nama lengkap minimal 2 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).max(72, { message: "Password maksimal 72 karakter" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });
      
      const resData = await res.json();
      
      if (resData.success) {
        setAuth(resData.data.token, resData.data.user);
        showToast("Pendaftaran berhasil!", "success");
        router.push("/");
      } else {
        showToast(resData.message || "Gagal mendaftar", "error");
      }
    } catch {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-paper-white p-8 sketch-border hard-shadow-lg flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic underline decoration-wavy decoration-blueprint-blue">
            Daftar Akun
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Buat akun untuk menyimpan memori fotomu
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-ink-black">Nama Lengkap</label>
            <Input
              type="text"
              {...register("fullName")}
              placeholder="Joko Susilo"
              aria-invalid={!!errors.fullName}
              className="bg-surface-container-highest"
            />
            {errors.fullName && (
              <p className="text-error text-sm font-bold mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-ink-black">Email</label>
            <Input
              type="email"
              {...register("email")}
              placeholder="nama@email.com"
              aria-invalid={!!errors.email}
              className="bg-surface-container-highest"
            />
            {errors.email && (
              <p className="text-error text-sm font-bold mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-ink-black">Password</label>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="bg-surface-container-highest"
            />
            {errors.password && (
              <p className="text-error text-sm font-bold mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-ink-black">Konfirmasi Password</label>
            <Input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
              className="bg-surface-container-highest"
            />
            {errors.confirmPassword && (
              <p className="text-error text-sm font-bold mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 py-6 bg-blueprint-blue hover:bg-blueprint-blue/80 text-paper-white"
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <div className="text-center font-body-md text-sm mt-4 border-t-2 border-ink-black pt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-curtain-red font-bold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </main>
  );
}
