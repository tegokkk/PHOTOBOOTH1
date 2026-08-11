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

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.success) {
        setAuth(resData.data.token, resData.data.user);
        showToast("Login berhasil!", "success");
        if (resData.data.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        showToast(resData.message || "Email atau password salah", "error");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      showToast("Tidak dapat terhubung ke server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-paper-white p-8 sketch-border hard-shadow-lg flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black italic underline decoration-wavy decoration-curtain-red">
            Login
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Masuk untuk menyimpan foto ke galerimu
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 py-6"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="text-center font-body-md text-sm mt-4 border-t-2 border-ink-black pt-4">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blueprint-blue font-bold hover:underline">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}
