<p align="center">
  <img src="./docs/screenshots/landing-2026-11-17.png" alt="POINTER PHOTOBOOTH — tampilan landing biru elektrik dengan aksen lime dan logo MI Polinela" width="100%" />
</p>

<h1 align="center">POINTER PHOTOBOOTH</h1>

<p align="center">
  <strong>Modern Web-Based Photobooth Kiosk System untuk Event, Expo, Wedding, Pop-up, dan Komersial.</strong><br />
  Cepat digunakan tamu, responsif dengan identitas biru elektrik dan aksen lime, mudah dioperasikan operator, serta dilengkapi retake per kolom, cetak 4R, dan cloud share.
</p>

<p align="center">
  <a href="https://riri-frontend-three.vercel.app">Demo Live App</a> ·
  <a href="https://riri-backend.vercel.app/health">API Health Check</a> ·
  <a href="./docs/PRINT_BRIDGE.md">Print Bridge Docs</a> ·
  <a href="./backend/MIGRATION_GUIDE.md">Migration Guide</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Next.js-16%20(Turbopack)-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A" alt="React 19" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS 4" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
  <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2%20%2F%20B2-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare R2 / Backblaze B2" />
</p>

---

## Daftar Isi

1. [Ringkasan Proyek](#ringkasan-proyek)
2. [Fitur Unggulan](#fitur-unggulan)
3. [Arsitektur & Diagram Alur](#arsitektur--diagram-alur)
4. [Struktur Repositori](#struktur-repositori)
5. [Katalog & Kategori Frame](#katalog--kategori-frame)
6. [Panduan Instalasi & Menjalankan Lokal](#panduan-instalasi--menjalankan-lokal)
7. [Variabel Lingkungan (Environment Variables)](#variabel-lingkungan-environment-variables)
8. [Panduan Deployment](#panduan-deployment)
9. [Print Bridge (Integrasi Printer Fisik)](#print-bridge-integrasi-printer-fisik)
10. [Keamanan & Privasi](#keamanan--privasi)
11. [Daftar Perintah (Commands)](#daftar-perintah-commands)
12. [Pembaruan Terbaru](#pembaruan-terbaru)

---

## Ringkasan Proyek

**POINTER PHOTOBOOTH** (sebelumnya *RIRI Photobooth / Cyber-Booth*) adalah aplikasi web photobooth berbasis browser yang dirancang khusus untuk kebutuhan kiosk interaktif. Tampilan terbaru memakai biru elektrik `#0038FF`, aksen lime `#CCFF00`, tipografi *Plus Jakarta Sans*, panel membulat, serta ilustrasi printer interaktif. Landing mempertahankan karakter judul 3D, dengan ukuran yang lebih proporsional. Desain sebelumnya menggunakan estetika *Cyber-Sketch*, tipografi *Bricolage Grotesque* / *Courier Prime*, neon-yellow, cyber-purple, dan pixel-corners; keterangan ini dipertahankan sebagai riwayat desain.

Sistem ini memisahkan antarmuka kiosk (*frontend*) dari layanan backend (*API & Storage*):
- **Canvas Compositing di Browser**: Foto diproses dan digabungkan langsung pada browser klien secara instan tanpa membebani server backend, menjaga rasio asli dan resolusi master frame.
- **Penyimpanan Terdistribusi**: Menggunakan **Neon Serverless PostgreSQL** dengan PgBouncer pooler untuk metadata transaksi cepat, serta **S3-Compatible Object Storage** (Cloudflare R2 / Backblaze B2) untuk arsip foto dan link berbagi digital.
- **Keamanan Berbasis Token**: Foto tamu tidak diekspos publik secara langsung, melainkan melalui guest access token dengan enkripsi hash dan retensi otomatis.

---

## Fitur Unggulan

### 1. Pengalaman Kiosk Tamu (Guest Kiosk Flow)
- **Landing Screen**: Judul POINTER PHOTOBOOTH STUDIO berukuran responsif, tombol mulai yang jelas, serta kartu dekorasi memakai logo Manajemen Informatika dan D3 MI Polinela dari aset lokal. Ukuran judul, dekorasi, dan tombol disesuaikan agar tidak memenuhi layar.
- **Otorisasi Sesi Operator**: Modal PIN yang lebih ringkas, dilengkapi keypad sentuh, untuk membuka sesi foto baru yang dikonfigurasi melalui `NEXT_PUBLIC_OPERATOR_PIN`.
- **Pilih Frame Interaktif**: Katalog frame dengan filter kategori dinamis (`Semua`, `Aesthetic`, `Basic`, `Classic`, `Creative`, `Cute`, `Event`, `Party`, `Vintage`) lengkap dengan dialog pratinjau.
- **Kamera Kiosk Cerdas**:
  - Live framing overlay (melihat posisi wajah langsung di dalam lubang slot frame sebelum memotret).
  - Countdown timer animasi yang jelas.
  - Dukungan multi-kamera (kamera depan/belakang/webcam USB eksternal).
  - Kamera depan ditampilkan dan disimpan secara mirror agar hasil mengikuti pratinjau pose tamu.
  - Pengambilan beberapa pose mengikuti jumlah slot bingkai (1 hingga 6); setiap pemotretan memakai countdown 3, 5, atau 10 detik.
  - Kemampuan foto ulang (*retake*) slot tertentu tanpa harus mengulang seluruh sesi.
- **Periksa Foto & Retake per Kolom**: Setelah seluruh target foto selesai, tamu melihat hasil tiap kolom dan dapat memilih satu, beberapa, atau seluruh kolom untuk diulang. Kamera hanya mengambil ulang target pilihan. Foto lain tetap tersimpan; foto lama baru diganti setelah pengambilan baru berhasil. Setelah retake, aplikasi kembali ke pemeriksaan.
- **Konfirmasi Sebelum Hasil**: Tombol **Foto sudah sesuai, lanjut** membuka hasil foto dan animasi printer. Retake dari halaman hasil kembali ke pemilihan kolom, bukan menghapus seluruh sesi.
- **Halaman Hasil Dua Kolom**:
  - **Panel kiri**: Slider kecerahan, kontras, saturasi, dan reset digabung dengan tombol Cetak Foto, Bagikan / Unduh QR, Retake, dan Akhiri Sesi. Kartu dan tombol dibuat ringkas agar tidak mendominasi printer.
  - **Area kanan**: Printer dan foto menjadi fokus utama, dengan animasi kertas keluar, interaksi tarik/sobek, serta kontrol suara.
  - Pada ponsel, printer tampil lebih dahulu, diikuti panel kontrol. Ukuran menyesuaikan layar tanpa mengubah rasio bingkai atau koordinat slot.
  - **Riwayat layout**: Versi sebelumnya memakai tiga panel terpisah: Edit Foto di kiri, Hasil Foto di tengah, dan Pilih Aksi di kanan. Fungsi ketiganya tetap tersedia pada susunan terbaru.

### 2. Output & Distribusi Foto
- **Ukuran Cetak Tetap 4R**: Semua bingkai ditempatkan secara proporsional pada lembar portrait 4 × 6 inci (101,6 × 152,4 mm), menggunakan raster 1200 × 1800 piksel untuk 300 DPI. Bingkai tetap utuh; perbedaan rasio diisi latar putih. Pilihan ukuran mini/kompak/penuh pada versi lama telah digantikan oleh ukuran tetap 4R.
- **Salinan & Strip Kembar**: Mendukung 1–3 lembar dan pilihan dua strip dalam satu lembar 4R untuk bingkai strip. Pratinjau, browser print, dan Print Bridge memakai raster yang sama.
- **Cetak Instan**: Terintegrasi dengan sistem dialog cetak browser lokal serta opsi endpoint **Print Bridge** untuk otomatisasi cetak fisik tanpa dialog print.
- **QR Code & Tautan Digital**: Tamu dapat memindai QR Code di layar untuk langsung mengunduh hasil foto di smartphone tanpa perlu membuat akun atau login.
- **Download Lokal**: Mendukung ekspor format `.png` (kualitas master) dan `.jpg`.

### 3. Dashboard Admin & Monitoring
- **Admin Dashboard (`/admin`)**: Dilindungi otorisasi PIN operator untuk melihat metrik total sesi, total foto tercetak, foto terunduh, serta antrean cetak aktif.
- **Health & Readiness Check**: Endpoint `/health` dan `/ready` untuk monitoring uptime kiosk dan ketersediaan koneksi database.

---

## Arsitektur & Diagram Alur

### Alur Kiosk Tamu

Setelah pemotretan, tamu memeriksa setiap kolom dan bisa memilih satu atau beberapa kolom untuk retake. Foto lain tetap disimpan; pengganti ditulis hanya setelah berhasil diambil. Animasi printer serta pilihan edit, cetak 4R, dan QR muncul setelah tamu menekan **Foto sudah sesuai, lanjut**.

```mermaid
flowchart TD
    A["1. Landing Screen (Otorisasi PIN Operator)"] --> B["2. Pilih Frame (Kategori & Preview)"]
    B --> C["3. Kamera Kiosk (Countdown & Live Slot Overlay)"]
    C --> D{"Semua Target Pengambilan Selesai?"}
    D -- Belum --> C
    D -- Selesai --> E["4. Periksa Foto / Pilih Kolom Retake"]
    E -- "Retake Kolom Pilihan" --> C
    E -- "Foto Sudah Sesuai" --> H["5. Animasi Printer & Hasil Foto"]
    
    subgraph ReviewAndActions ["Hasil Foto (Layout 2 Kolom)"]
        E2["Area Kanan: Animasi Printer & Foto"]
        E3["Panel Kiri: Filter / Reset / Cetak / QR / Retake / Selesai"]
    end
    
    H --> ReviewAndActions
    E3 -- "Cetak" --> F["Pratinjau 4R / Browser Print / Print Bridge"]
    E3 -- "Bagikan/Unduh" --> G["Upload R2/B2 & Buat QR Token"]
    E3 -- "Retake per Kolom" --> E
    E3 -- "Akhiri Sesi" --> A
    F -- "Kembali ke Hasil" --> H
    G -- "Kembali ke Hasil" --> H
```

### Arsitektur Sistem

```mermaid
flowchart LR
    subgraph Client ["Client Layer (Kiosk Device)"]
        Kiosk["Browser Kiosk / iPad / Laptop"]
        Canvas["HTML5 Canvas Compositor"]
    end

    subgraph Backend ["Application Layer"]
        API["Express 5.x REST API"]
        Prisma["Prisma ORM (Pooled Connection)"]
    end

    subgraph Cloud ["Data & Storage Layer"]
        Neon[("Neon Serverless PostgreSQL")]
        S3Storage[("Backblaze B2 / Cloudflare R2 (S3-Compatible)")]
    end

    subgraph Printing ["Print Hardware Layer"]
        PrintBridge["Print Bridge (Local Bridge Server)"]
        Printer["Photo Printer (DNP / Epson / Canon)"]
    end

    Kiosk --> Canvas
    Kiosk -->|REST API Requests| API
    API --> Prisma --> Neon
    API -->|S3 Client SDK| S3Storage
    Kiosk -.->|Opsional: Local Webhook| PrintBridge --> Printer
    Kiosk -.->|Fallback Browser Print| Printer
```

---

## Struktur Repositori

```text
PHOTOBOOTH/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Definisi model database (Frame, FrameSlot, Photo, ShareLink, PrintJob)
│   │   └── seed.js               # Seeding katalog frame, kategori, dan koordinat slot
│   ├── src/
│   │   ├── controllers/          # Handler endpoint (frame, photo, media, share, admin, print)
│   │   ├── lib/
│   │   │   ├── prisma.js         # Inisialisasi client Prisma dengan koneksi pooler
│   │   │   └── r2.js             # S3-compatible client (Backblaze B2 / Cloudflare R2)
│   │   ├── routes/               # Routing REST API Express
│   │   ├── services/             # Logika bisnis (upload foto, pemrosesan media)
│   │   └── app.js                # Inisialisasi Express app, middleware, rate-limit, dan CORS
│   ├── MIGRATION_GUIDE.md        # Panduan migrasi database & storage
│   ├── package.json
│   └── vercel.json               # Konfigurasi deploy serverless Vercel
│
├── frontend/
│   ├── public/
│   │   ├── frames/               # Aset frame lokal (PNG master, WebP, dan thumbnail preview)
│   │   └── images/               # Logo Manajemen Informatika dan D3 MI Polinela
│   ├── src/
│   │   ├── app/                  # Next.js App Router (/admin, /share/[token], page.tsx, layout.tsx)
│   │   ├── components/
│   │   │   ├── booth/            # Layar booth (Landing, FrameSelection, Camera, PhotoReview, PhotoPreview)
│   │   │   ├── editor/           # Panel filter editing foto (EditPanel)
│   │   │   ├── export/           # Modal QR share & unduh (ExportDialog)
│   │   │   ├── frame/            # Komponen pemilih dan pratinjau bingkai
│   │   │   ├── print/            # Dialog konfigurasi cetak (PrintPreviewDialog)
│   │   │   └── ui/               # Komponen UI, header booth, serta ilustrasi/animasi ReceiptPrinter
│   │   ├── hooks/                # Custom React hook (useCamera untuk webcam dan mirroring)
│   │   ├── lib/                  # Utilitas compositor, frameMeta, API, print4R, printAdapter, printQueue
│   │   ├── store/                # State management Zustand (useAppStore, useAuthStore, useUIStore)
│   │   └── types/                # TypeScript interface dan tipe data
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── PRINT_BRIDGE.md           # Spesifikasi kontrak lokal printer bridge
│   └── banner.png                # Asset gambar dokumentasi
├── proposal_ti_expo_2026/        # Berkas proposal & dokumentasi event TI EXPO 2026
├── scripts/
│   └── generate_proposal.py      # Generator otomatis dokumen proposal DOCX/PDF
├── ARCHITECTURE.md               # Catatan arsitektur & panduan teknis mendalam
├── PHOTOBOOTH_USAHA_PLAN.md      # Rencana operasional & komersialisasi
└── README.md
```

---

## Katalog & Kategori Frame

### Aset Lokal Saat Ini

Snapshot pembaruan ini menyertakan 9 master PNG berikut beserta preview WebP di `frontend/public/frames/`:

| Nama Frame | Jumlah Slot Foto |
| :--- | :---: |
| `Newspaper Collage` | 6 |
| `Cinema Premiere` | 6 |
| `Innovation 4 Force Split` | 1 |
| `Innovation 4 Force World` | 1 |
| `Jejak Kebersamaan` | 4 |
| `OMG Checkerboard` | 6 |
| `Pointer Newspaper` | 3 |
| `Pointer Striped` | 6 |
| `Purple Vintage Friends` | 6 |

Daftar yang muncul pada aplikasi mengikuti frame aktif dari API/database, bukan semata-mata isi folder lokal. Sebelum mengaktifkan frame, pastikan URL master dan preview tersedia. Beberapa aset katalog lama sudah tidak disertakan dalam snapshot lokal; definisi pada seed/database tidak otomatis dihapus oleh perubahan folder ini.

### Referensi Katalog Lama (Dipertahankan)

Tabel 20 entri dari dokumentasi sebelumnya tetap disimpan di bawah ini sebagai referensi nama, kategori, dan jumlah slot. Tabel ini bukan jaminan bahwa semua asetnya masih tersedia secara lokal:

| Kategori | Nama Frame | Jumlah Slot Foto |
| :--- | :--- | :---: |
| **Event** | `Innovation 4 Force Split` *(Baru)* | 1 Foto |
| **Event** | `Innovation 4 Force World` *(Baru)* | 1 Foto |
| **Aesthetic** | `Beige Friends` | 2 Foto |
| **Aesthetic** | `Newspaper Collage` | 6 Foto |
| **Aesthetic** | `Brown Playful` | 3 Foto |
| **Classic** | `Film Strip Green` | 4 Foto |
| **Creative** | `Pointer Newspaper` | 3 Foto |
| **Creative** | `Pointer Striped` | 6 Foto |
| **Cute** | `Blue & Pink Friendship` | 4 Foto |
| **Cute** | `Pink Illustrated Friendship` | 3 Foto |
| **Cute** | `Pink Strike A Pose` | 4 Foto |
| **Cute** | `Pink Captured In Fun` | 3 Foto |
| **Cute** | `OMG Checkerboard` | 6 Foto |
| **Vintage** | `Blue Jeans Modern` | 4 Foto |
| **Vintage** | `Purple Vintage Friends` | 6 Foto |
| **Vintage** | `Jejak Kebersamaan` | 4 Foto |
| **Vintage** | `Cinema Premiere` | 6 Foto |
| **Party** | `Modern Friends` | 3 Foto |
| **Party** | `Yellow Girl Gang` | 3 Foto |
| **Basic** | `Tanpa Frame` | 1 Foto (Polos) |

Setiap frame memiliki koordinat normalisasi (0–1) untuk `x`, `y`, `width`, `height`, serta mikro-bleed untuk memastikan foto tamu menyatu di bawah bingkai tanpa menyisakan celah transparan.

---

## Panduan Instalasi & Menjalankan Lokal

### Prasyarat Sistem
- **Node.js**: v20.x atau lebih baru untuk aplikasi; gunakan Node.js 24 untuk perintah tes frontend di bawah yang memuat TypeScript secara langsung.
- **NPM**: v10.x atau lebih baru
- **Database**: PostgreSQL (direkomendasikan Neon.tech)
- **Object Storage**: Cloudflare R2 / Backblaze B2 (atau bucket S3-compatible lainnya)
- **Webcam**: Kamera laptop atau webcam USB eksternal

### 1. Kloning Repositori
```bash
git clone https://github.com/tegokkk/PHOTOBOOTH1.git
cd PHOTOBOOTH1
```

### 2. Konfigurasi Backend
Masuk ke folder `backend`, pasang dependensi, dan siapkan file `.env`:
```bash
cd backend
npm install
cp .env.example .env
```

Sesuaikan nilai di dalam `backend/.env`:
```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
PRISMA_PGBOUNCER="true"

STORAGE_ENDPOINT="https://s3.us-east-005.backblazeb2.com" # atau Cloudflare R2 endpoint
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="photobooth-photos"

JWT_SECRET="kunci_rahasia_jwt_minimal_32_karakter"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

Sinkronkan database dan masukkan katalog frame bawaan:
```bash
npx prisma db push
node prisma/seed.js
```

Jalankan server backend:
```bash
npm run dev
```
Backend akan aktif di `http://localhost:5000`.

### 3. Konfigurasi Frontend
Buka terminal baru, masuk ke folder `frontend`, pasang dependensi, dan siapkan file `.env`:
```bash
cd frontend
npm install
cp .env.example .env
```

Pastikan konfigurasi di `frontend/.env` telah sesuai:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_OPERATOR_PIN="your_operator_pin"
```

Jalankan server frontend:
```bash
npm run dev
```
Aplikasi photobooth siap diakses melalui browser di **[http://localhost:3000](http://localhost:3000)**.

---

## Variabel Lingkungan (Environment Variables)

### Backend (`backend/.env`)
| Variabel | Keterangan | Contoh Nilai |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string PostgreSQL (Neon/Supabase) | `postgresql://user:pass@ep-xx.neon.tech/neondb?sslmode=require` |
| `PRISMA_PGBOUNCER` | Mengaktifkan optimasi pooler PgBouncer | `true` |
| `STORAGE_ENDPOINT` | Endpoint S3 Cloud Storage | `https://s3.us-east-005.backblazeb2.com` |
| `R2_ACCESS_KEY_ID` | Access Key ID Storage | `005a...` |
| `R2_SECRET_ACCESS_KEY` | Secret Key Storage | `K005a...` |
| `R2_BUCKET_NAME` | Nama bucket target penyimpanan foto | `photobooth-photos` |
| `JWT_SECRET` | Kunci enkripsi token autentikasi | `rahasia_string_32_char` |
| `FRONTEND_URL` | URL asal frontend untuk validasi CORS | `http://localhost:3000` atau URL domain live |
| `PORT` | Port server Express | `5000` |
| `FRAME_ASSET_COLUMNS_ENABLED` | Menyalakan kolom preview dan master frame | `true` |
| `GUEST_PHOTO_RETENTION_HOURS` | Durasi retensi foto guest sebelum dibersihkan | `168` (7 hari) |

### Frontend (`frontend/.env`)
| Variabel | Keterangan | Nilai Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL endpoint backend | `http://localhost:5000` |
| `NEXT_PUBLIC_OPERATOR_PIN` | PIN otorisasi pembukaan sesi kiosk dan login admin | *Dikonfigurasi di `.env`* |
| `NEXT_PUBLIC_PRINT_BRIDGE_URL` | Endpoint service Print Bridge lokal (opsional) | `""` *(kosong = browser print)* |

---

## Panduan Deployment

### Deploy Frontend (Vercel)
1. Hubungkan repositori GitHub ke akun Vercel.
2. Atur **Root Directory** ke: `frontend`.
3. Masukkan Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL backend produksi (contoh: `https://api-photobooth.domain.com`).
   - `NEXT_PUBLIC_OPERATOR_PIN`: PIN rahasia operator kiosk sesuai kebutuhan acara.
4. Pastikan domain live menggunakan protokol **HTTPS** agar browser mengizinkan akses ke kamera perangkat.

### Deploy Backend (Vercel Serverless / VPS / Render)
1. Jika menggunakan Vercel, atur **Root Directory** ke: `backend`.
2. Masukkan seluruh environment variable dari tabel Backend di atas.
3. Jalankan migrasi Prisma pada database produksi:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```
4. Verifikasi deployment melalui endpoint:
   - `https://your-backend.domain.com/health` ➔ `{"status": "ok"}`
   - `https://your-backend.domain.com/ready` ➔ `{"status": "ready"}`
   - `https://your-backend.domain.com/api/frames` ➔ daftar frame aktif

---

## Print Bridge (Integrasi Printer Fisik)

Secara default, aplikasi menggunakan dialog cetak bawaan browser (*Native Window Print*). Untuk operasional booth otomatis dan tanpa supervisi:
1. Pasang bridge server lokal pada mini-PC atau laptop kiosk yang terhubung ke printer fisik via USB/jaringan.
2. Masukkan endpoint bridge pada `NEXT_PUBLIC_PRINT_BRIDGE_URL` (contoh: `http://localhost:8000/print`).
3. Sistem mengirim raster 4R 1200 × 1800 piksel, jumlah lembar, ukuran media 4R (101,6 × 152,4 mm), dan target 300 DPI. Bridge perlu memilih media fisik 4 × 6 inci dengan skala 100% dan margin nol / borderless jika didukung printer.
4. Spesifikasi payload dan kontrak API dapat dilihat di [docs/PRINT_BRIDGE.md](docs/PRINT_BRIDGE.md).

Untuk browser print, pilih kertas **4 × 6 inci / 4R**, **skala 100%**, **margin 0**, dan nonaktifkan header/footer. Jumlah lembar mengikuti pilihan salinan pada aplikasi. Animasi tombol PRINT pada ilustrasi adalah simulasi; cetak fisik dijalankan melalui tombol **Cetak Foto** lalu **Cetak 4R** pada dialog cetak. Status hasil fisik tetap dikonfirmasi operator.

---

## Keamanan & Privasi

1. **Privasi Foto Tamu**:
   - Foto hasil pemotretan disimpan secara terenkripsi dan privat di bucket object storage.
   - Endpoint `/api/media/:key` membutuhkan token guest yang valid atau session cookie resmi.
2. **Idempotency Protections**:
   - Upload foto dan pembuatan share link dilengkapi header `Idempotency-Key` untuk mencegah duplikasi upload saat jaringan lambat atau tombol diklik berulang.
3. **Pembersihan Otomatis**:
   - Skrip `npm run photos:cleanup` dapat dijadwalkan via cron job untuk membersihkan foto guest yang melewati masa retensi (`GUEST_PHOTO_RETENTION_HOURS`).
4. **Keamanan Kiosk**:
   - Jalankan browser kiosk dalam mode layar penuh (*Full Screen Kiosk Mode*) dan kunci akses tombol fungsi keyboard (*F11, Alt+F4, Esc*) di sistem operasi terminal.

---

## Daftar Perintah (Commands)

### Backend
| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server backend development dengan nodemon |
| `npm start` | Menjalankan server backend mode produksi |
| `npm test` | Menjalankan automated test suite Jest |
| `npx prisma db push` | Sinkronisasi skema Prisma ke database Neon |
| `node prisma/seed.js` | Memasukkan seluruh data frame & slot ke database |
| `npm run photos:cleanup` | Menghapus foto guest yang melewati batas retensi |

### Frontend
| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js development server dengan Turbopack |
| `npm run build` | Membuat build bundle produksi teroptimasi |
| `npm start` | Menjalankan server Next.js production build |
| `npm run lint` | Memeriksa kepatuhan kode dan linting ESLint |
| `npx tsc --noEmit` | Memeriksa tipe data TypeScript tanpa menghasilkan output file |
| `node --test src/store/useAppStore.test.mjs src/lib/print4R.test.mjs` | Menjalankan 15 tes alur sesi/retake dan penempatan cetak 4R (Node.js 24) |

---

## Pembaruan Terbaru

### 17 November 2026

- Identitas antarmuka biru elektrik dengan aksen lime, landing yang lebih proporsional, logo dekorasi lokal, dan popup otorisasi yang lebih ringkas.
- Tahap pemeriksaan foto sebelum animasi printer, dengan pilihan retake per kolom tanpa menghapus foto lainnya.
- Printer diposisikan di kanan; pengaturan edit dan seluruh aksi berada dalam satu panel ringkas di kiri.
- Cetak tetap 4R untuk semua bingkai, termasuk salinan dan opsi strip kembar, dengan raster yang sama pada preview dan pengiriman cetak.
- Gambar cetak tetap tersedia di memori selama sesi ketika backend mengembalikan metadata antrean, sehingga retry mempertahankan raster yang telah disiapkan.
- Tes regresi sesi/retake dan geometri cetak ditambahkan. Build frontend, pemeriksaan TypeScript, serta tes frontend menjadi pemeriksaan sebelum publikasi.

#### Pratinjau Tampilan Terbaru

![Landing POINTER PHOTOBOOTH](docs/screenshots/landing-2026-11-17.png)

![Panel kontrol kiri dan printer kanan, menggunakan gambar contoh](docs/screenshots/hasil-foto-2026-11-17.jpg)

Bagian instalasi, konfigurasi lingkungan, deployment, arsitektur, keamanan, dan referensi katalog lama tetap dipertahankan. Deskripsi yang berubah diberi konteks versi terbaru atau ditandai sebagai riwayat agar dokumentasi lama tidak hilang.

---

## Lisensi & Kontributor

- **Pengembang & Hak Cipta**: [tegokkk](https://github.com/tegokkk)
- **Proyek**: POINTER PHOTOBOOTH (RIRI Photobooth Platform)
- Dibuat untuk penyelenggaraan event, expo TI 2026, dan kebutuhan photobooth komersial. Penggunaan dan modifikasi komersial tunduk pada izin pemilik repositori.
