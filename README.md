<p align="center">
  <img src="./docs/banner.png" alt="RIRI PHOTOBOOTH" width="100%" />
</p>

<h1 align="center">RIRI PHOTOBOOTH</h1>

<p align="center">
  Aplikasi Photobooth Kiosk bergaya <strong>Light Neo-Brutalism</strong> untuk mengambil, mengedit, mencetak, dan membagikan foto. Didesain secara <i>stateless</i> tanpa memerlukan akun atau login.
</p>

<p align="center">
  <a href="https://github.com/tegokkk/RIRI/actions/workflows/ci.yml">
    <img src="https://github.com/tegokkk/RIRI/actions/workflows/ci.yml/badge.svg" alt="CI status" />
  </a>
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A" alt="React 19" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma 5" />
</p>

## Tentang Proyek

**RIRI PHOTOBOOTH** memindahkan pengalaman bilik foto (photobooth) ke perangkat apa pun yang memiliki kamera dan browser modern. Pengguna (guest) dapat memilih frame, mengambil foto, mengatur tampilan filter, lalu mencetak atau membuat tautan QR Code.

Pada pembaruan terbaru, sistem **Autentikasi (JWT) dan Multi-User telah sepenuhnya dihapus**. Aplikasi ini sekarang berfungsi murni sebagai **Stateless Kiosk**, yang mana tidak diperlukan registrasi, login, maupun manajemen pengguna yang rumit. Semuanya dioptimalkan untuk kecepatan dan kemudahan akses di lokasi (event, wedding, mall). 

Untuk melindungi antarmuka operator (seperti Queue Foto dan Print), aplikasi kini menggunakan sistem **PIN Operator lokal** yang lebih ringan. Antarmuka utamanya juga telah dirombak menggunakan skema warna **Light Neo-Brutalism** yang cerah (Krem, Kuning Neon, Pink) agar mencolok dan mengundang interaksi.

## Fitur Utama

| Area | Kapabilitas |
| --- | --- |
| **Kamera** | Permission kamera browser, pergantian kamera, mirror preview, countdown 3 detik, dan burst shot. |
| **Kreativitas** | Frame custom (SVG/PNG) dengan slot berlapis, compositing langsung di browser (Fabric.js), serta penyesuaian filter foto (brightness, contrast, saturation). |
| **Output** | Cetak melalui dialog browser, atau via **Print Bridge** ke printer sistem. Opsi simpan lokal (Download PNG) atau unggah ke Cloud untuk mendapatkan QR Code/Tautan Share. |
| **Kiosk Stateless** | Pelanggan langsung berfoto tanpa login (Guest Access). Sangat ideal untuk mesin yang beroperasi tanpa pengawasan (*unattended*). |
| **Keamanan Operator** | Dashboard Admin (Antrean Foto & Manajemen Mesin) dilindungi oleh PIN Operator statis, menghilangkan kerumitan sistem reset kata sandi atau token JWT kedaluwarsa. |
| **Privasi** | File foto tidak bersifat publik. Tamu dapat mengakses hasil scan QR mereka menggunakan `guestAccessToken` khusus, dan tautan akan otomatis kedaluwarsa. |

## Alur Pengguna

```mermaid
flowchart LR
    A[Landing Screen] --> B[Otorisasi PIN Operator (Opsional)]
    B --> C[Pilih Frame Foto]
    C --> D[Preview Kamera & Hitung Mundur]
    D --> E[Ambil Foto per Slot]
    E --> F{Slot Penuh?}
    F -- Belum --> D
    F -- Penuh --> G[Preview & Edit Filter]
    G --> H[Cetak Luring / Export]
    H --> I[Unggah & Hasilkan QR Code]
    I --> J[Tamu Memindai QR Code untuk Download]
```

## Arsitektur Sistem

```mermaid
flowchart TB
    U[Browser Kiosk / Tamu]
    F[Next.js Frontend\nReact + Zustand + Fabric.js]
    A[Express REST API]
    P[Prisma ORM]
    D[(PostgreSQL)]
    S{Photo Storage}
    SB[Supabase Storage]
    FS[Filesystem Lokal]

    U --> F
    F -->|REST / Guest Token| A
    A --> P
    P --> D
    A --> S
    S -->|Production| SB
    S -->|Development| FS
```

### Batas Lapisan

- `frontend`: Antarmuka Neo-Brutalism, akses kamera, logic compositing (canvas), export foto, dan routing aplikasi utama.
- `backend`: REST API statis (menyajikan frame, menyimpan file foto yang diunggah, melayani generate token share).
- `PostgreSQL`: Menyimpan data `frames`, `frame_slots`, `photos`, dan `share_links` (Tabel `users` dan `audit_logs` **sudah ditiadakan**).
- `Storage`: Supabase Storage bucket (atau local `/uploads`) untuk menyimpan file PNG/JPG.

## Menjalankan Secara Lokal

### 1. Kloning Repositori

```bash
git clone https://github.com/tegokkk/RIRI.git
cd RIRI
```

### 2. Konfigurasi Backend

```bash
cd backend
npm ci
```

Buat `backend/.env` dan sesuaikan nilainya:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres"
FRONTEND_URL="http://localhost:3000"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="./uploads"
FRAME_STORAGE_BUCKET="frames"
FRAME_ASSET_COLUMNS_ENABLED="false"
```
*(Catatan: `JWT_SECRET` tidak lagi diperlukan karena sistem auth telah dihapus).*

Terapkan skema database ke Supabase/PostgreSQL dan jalankan API:

```bash
npx prisma db push
npm run dev
```

### 3. Konfigurasi Frontend

Buka terminal baru dari root repositori:

```bash
cd frontend
npm ci
```

Buat `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_OPERATOR_PIN="1234" 
NEXT_PUBLIC_PRINT_BRIDGE_URL=""
```

Jalankan server pengembangan Frontend:

```bash
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)**.
Untuk membuka Dashboard Admin Kiosk, tekan tombol "Mulai Sesi", lalu masukkan PIN Operator (Default: `1234`).

## Perintah Penting

| Lokasi | Perintah | Kegunaan |
| --- | --- | --- |
| `backend` | `npm run dev` | Menjalankan API backend |
| `backend` | `npm run photos:cleanup` | Menghapus foto cloud tamu yang sudah kedaluwarsa |
| `backend` | `npx prisma db push` | Menyinkronkan skema Prisma tanpa migration historis |
| `frontend` | `npm run dev` | Menjalankan UI Photobooth di mode pengembangan |
| `frontend` | `npm run build` | Membuat versi *Production* untuk mesin Kiosk nyata |

## Keamanan & Praktik Terbaik Kiosk

1. **Gunakan Mode Layar Penuh (Kiosk Mode)**: Jalankan browser Chrome/Edge di mesin fisik dengan bendera `--kiosk` agar pengguna tidak bisa menutup tab aplikasi.
2. **Ubah PIN Operator**: Pastikan mengubah nilai `NEXT_PUBLIC_OPERATOR_PIN` pada `.env` sebelum mesin digunakan di acara publik.
3. **Database Bersih**: Karena ini menggunakan arsitektur Kiosk, sistem secara bawaan tidak mencatat informasi identifikasi pribadi tamu, menjamin kepatuhan privasi (GDPR-friendly).

## Lisensi
Proyek milik **tegokkk**. Jangan gunakan untuk kepentingan komersial tanpa izin.
