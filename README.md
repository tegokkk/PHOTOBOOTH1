<div align="center">
  <img src="https://raw.githubusercontent.com/tegokkk/RIRI/main/frontend/public/icons/icon-512x512.png" alt="Logo" width="120" height="120" style="border-radius: 20px;">
  <h1 align="center">📸 RIRI Photobooth</h1>
  <p align="center">
    <strong>A Modern, Serverless Digital Photobooth Application</strong>
    <br />
    <br />
    <a href="#sparkles-features">Features</a>
    ·
    <a href="#rocket-tech-stack">Tech Stack</a>
    ·
    <a href="#package-installation">Installation</a>
    ·
    <a href="#cloud-deployment">Deployment</a>
  </p>
</div>

<hr />

## 🌟 Overview

**RIRI Photobooth** adalah aplikasi web modern interaktif yang memungkinkan pengguna untuk mengambil foto layaknya berada di dalam mesin *photobooth* fisik sungguhan. Dilengkapi dengan bingkai kustom (custom frames), pengaturan *timer*, efek filter kamera, dan penyimpanan cloud terintegrasi.

Aplikasi ini dirancang menggunakan arsitektur **Serverless** mutakhir (Next.js & Express on Vercel) dan dikombinasikan dengan ekosistem **Supabase** (PostgreSQL & Cloud Storage) untuk skalabilitas tanpa batas.

---

## ✨ Features

- 📱 **Native Camera Feel:** Pengalaman kamera "mirip iPhone" (Pratinjau Mirroring, Hasil Un-mirrored).
- 🎨 **Dynamic Frames:** Dukungan multi-bingkai dengan sistem *compositing* gambar presisi tinggi.
- ⚡ **Anti-Spam & Debounce:** UI tangguh dengan status proteksi klik-ganda (*loading states*).
- ☁️ **Cloud Storage Integration:** Otomatis menyimpan foto ke *Supabase Storage* secara instan.
- 🔐 **Access Control:** Sistem sesi tamu (Guest Session) & Panel Admin terproteksi (JWT).
- 🚀 **Serverless Ready:** Backend API yang siap *deploy* di Vercel tanpa perlu mengatur server manual.
- 🌈 **Modern UI/UX:** Desain *glassmorphism* & animasi interaktif menggunakan Tailwind CSS.

---

## 🚀 Tech Stack

### 🖥️ Frontend (Client)
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router / Pages)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons:** Google Material Symbols

### ⚙️ Backend (Serverless API)
- **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Hosting Target:** [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

### 🗄️ Database & Storage
- **Database:** [PostgreSQL via Supabase](https://supabase.com/)
- **File Storage:** Supabase Storage (Private Buckets)

---

## 📦 Installation (Local Development)

Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah berikut:

### 1. Kloning Repositori
```bash
git clone https://github.com/tegokkk/RIRI.git
cd RIRI
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Buat file `.env` di dalam folder `backend` dan isi konfigurasi Supabase Anda:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-secret-role-key"
JWT_SECRET="secret-key-anda-minimal-32-karakter"
```
Jalankan migrasi database lokal & mulai server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Setup Frontend
Buka terminal baru.
```bash
cd frontend
npm install
```
Buat file `.env` di dalam folder `frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Mulai *Development Server*:
```bash
npm run dev
```
Aplikasi kini berjalan di `http://localhost:3000` 🎉

---

## ☁️ Deployment (Vercel)

Aplikasi ini sudah dikonfigurasi (*Zero-Config*) untuk langsung di-*deploy* ke **Vercel**.

1. **Deploy Backend:**
   - Impor folder `backend` di Vercel.
   - Pilih *Framework Preset*: `Other`.
   - Masukkan *Environment Variables* (Database URL, Supabase Keys, JWT Secret).
   - *Deploy*.
2. **Deploy Frontend:**
   - Impor folder `frontend` di Vercel.
   - Pilih *Framework Preset*: `Next.js`.
   - Masukkan variabel `NEXT_PUBLIC_API_URL` dengan URL Backend yang baru saja Anda deploy.
   - *Deploy*.

*(Lihat panduan lengkapnya di dalam menu `Serverless Deployment Guide`)*

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk proyek RIRI Photobooth.</p>
</div>
