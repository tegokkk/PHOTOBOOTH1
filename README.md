<p align="center">
  <img src="./docs/banner.png" alt="POINTER Photobooth" width="100%" />
</p>

<h1 align="center">POINTER PHOTOBOOTH</h1>

<p align="center">
  <strong>Modern Web-Based Photobooth Kiosk System untuk Event, Expo, Wedding, Pop-up, dan Komersial.</strong><br />
  Cepat digunakan tamu, responsif dengan gaya cyber-sketch, mudah dioperasikan operator, dan dilengkapi sistem cetak serta cloud share.
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

---

## Ringkasan Proyek

**POINTER PHOTOBOOTH** (sebelumnya *RIRI Photobooth / Cyber-Booth*) adalah aplikasi web photobooth berbasis browser yang dirancang khusus untuk kebutuhan kiosk interaktif. Dibangun dengan estetika *Cyber-Sketch* (brutalisme retro yang dipadukan dengan tipografi *Bricolage Grotesque* & *Courier Prime*, aksen warna neon-yellow, cyber-purple, dan pixel-corners).

Sistem ini memisahkan antarmuka kiosk (*frontend*) dari layanan backend (*API & Storage*):
- **Canvas Compositing di Browser**: Foto diproses dan digabungkan langsung pada browser klien secara instan tanpa membebani server backend, menjaga rasio asli dan resolusi master frame.
- **Penyimpanan Terdistribusi**: Menggunakan **Neon Serverless PostgreSQL** dengan PgBouncer pooler untuk metadata transaksi cepat, serta **S3-Compatible Object Storage** (Cloudflare R2 / Backblaze B2) untuk arsip foto dan link berbagi digital.
- **Keamanan Berbasis Token**: Foto tamu tidak diekspos publik secara langsung, melainkan melalui guest access token dengan enkripsi hash dan retensi otomatis.

---

## Fitur Unggulan

### 1. Pengalaman Kiosk Tamu (Guest Kiosk Flow)
- **Landing Screen**: Layout seimbang 2 kolom (ilustrasi kamera retro di kiri, judul utama dan tombol aksi di kanan) yang nyaman dijangkau dan tidak terpotong pada layar monitor kiosk maupun laptop.
- **Otorisasi Sesi Operator**: Modal PIN cepat (`0606`) untuk membuka sesi foto baru dan mencegah penyalahgunaan antrean.
- **Pilih Frame Interaktif**: Katalog frame dengan filter kategori dinamis (`Semua`, `Aesthetic`, `Basic`, `Classic`, `Creative`, `Cute`, `Event`, `Party`, `Vintage`) lengkap dengan dialog pratinjau.
- **Kamera Kiosk Cerdas**:
  - Live framing overlay (melihat posisi wajah langsung di dalam lubang slot frame sebelum memotret).
  - Countdown timer animasi yang jelas.
  - Dukungan multi-kamera (kamera depan/belakang/webcam USB eksternal).
  - Toggle mirror flip untuk kenyamanan pose tamu.
  - Alur multi-shot otomatis sesuai jumlah slot pada frame terpilih (1, 2, 3, 4, hingga 6 foto).
  - Kemampuan foto ulang (*retake*) slot tertentu tanpa harus mengulang seluruh sesi.
- **Halaman Pratinjau & Edit 3 Kolom**:
  - **Sisi Kiri (`EDIT FOTO`)**: Slider tuning filter foto langsung (Brightness, Contrast, Saturation, dan Reset All).
  - **Sisi Tengah (`HASIL FOTO`)**: Tampilan canvas frame resolusi tinggi tanpa ruang kosong berlebih.
  - **Sisi Kanan (`PILIH AKSI`)**: Tombol aksi utama (Cetak Foto, Bagikan / Unduh QR, Ambil Ulang, dan Akhiri Sesi).

### 2. Output & Distribusi Foto
- **Cetak Instan**: Terintegrasi dengan sistem dialog cetak browser lokal serta opsi endpoint **Print Bridge** untuk otomatisasi cetak fisik tanpa dialog print.
- **QR Code & Tautan Digital**: Tamu dapat memindai QR Code di layar untuk langsung mengunduh hasil foto di smartphone tanpa perlu membuat akun atau login.
- **Download Lokal**: Mendukung ekspor format `.png` (kualitas master) dan `.jpg`.

### 3. Dashboard Admin & Monitoring
- **Admin Dashboard (`/admin`)**: Dilindungi otorisasi PIN (`0606`) untuk melihat metrik total sesi, total foto tercetak, foto terunduh, serta antrean cetak aktif.
- **Health & Readiness Check**: Endpoint `/health` dan `/ready` untuk monitoring uptime kiosk dan ketersediaan koneksi database.

---

## Arsitektur & Diagram Alur

### Alur Kiosk Tamu

```mermaid
flowchart TD
    A["1. Landing Screen (PIN Operator: 0606)"] --> B["2. Pilih Frame (Kategori & Preview)"]
    B --> C["3. Kamera Kiosk (Countdown & Live Slot Overlay)"]
    C --> D{"Apakah Semua Slot Terisi?"}
    D -- Belum --> C
    D -- Selesai --> E["4. Pratinjau Hasil Foto"]
    
    subgraph ReviewAndActions ["Review & Actions (Layout 3 Kolom)"]
        E1["Panel Kiri: Filter (Brightness, Contrast, Saturation)"]
        E2["Panel Tengah: Canvas Hasil Foto"]
        E3["Panel Kanan: Cetak / QR / Retake / Selesai"]
    end
    
    E --> ReviewAndActions
    E3 -- "Cetak" --> F["Print Preview / Print Bridge"]
    E3 -- "Bagikan/Unduh" --> G["Upload R2/B2 & Buat QR Token"]
    E3 -- "Ambil Ulang" --> C
    E3 -- "Akhiri Sesi" --> A
    F --> A
    G --> A
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
│   │   └── frames/               # Aset frame lokal (PNG master, WebP, dan thumbnail preview)
│   ├── src/
│   │   ├── app/                  # Next.js App Router (/admin, /share/[token], page.tsx, layout.tsx)
│   │   ├── components/
│   │   │   ├── booth/            # Layar alur booth (Landing, FrameSelection, Camera, PhotoPreview)
│   │   │   ├── editor/           # Panel filter editing foto (EditPanel)
│   │   │   ├── export/           # Modal QR share & unduh (ExportDialog)
│   │   │   ├── frame/            # Komponen pemilih dan pratinjau bingkai
│   │   │   ├── print/            # Dialog konfigurasi cetak (PrintPreviewDialog)
│   │   │   └── ui/               # Komponen desain sistem (Button, Slider, Modal, Card, Toast)
│   │   ├── hooks/                # Custom React hook (useCamera untuk webcam dan mirroring)
│   │   ├── lib/                  # Utilitas (compositor canvas, frameMeta, api client, printAdapter)
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

Aplikasi dilengkapi dengan 20 desain frame siap pakai yang tersimpan di database dan folder aset:

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
- **Node.js**: v20.x atau lebih baru
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
NEXT_PUBLIC_OPERATOR_PIN="0606"
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
| `NEXT_PUBLIC_OPERATOR_PIN` | PIN otorisasi pembukaan sesi kiosk dan login admin | `0606` |
| `NEXT_PUBLIC_PRINT_BRIDGE_URL` | Endpoint service Print Bridge lokal (opsional) | `""` *(kosong = browser print)* |

---

## Panduan Deployment

### Deploy Frontend (Vercel)
1. Hubungkan repositori GitHub ke akun Vercel.
2. Atur **Root Directory** ke: `frontend`.
3. Masukkan Environment Variable:
   - `NEXT_PUBLIC_API_URL`: URL backend produksi (contoh: `https://api-photobooth.domain.com`).
   - `NEXT_PUBLIC_OPERATOR_PIN`: PIN operator kiosk (contoh: `0606`).
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
3. Sistem akan mengirim payload gambar bersolusi tinggi beserta jumlah copy langsung ke printer tanpa memunculkan dialog pop-up.
4. Spesifikasi payload dan kontrak API dapat dilihat di [docs/PRINT_BRIDGE.md](docs/PRINT_BRIDGE.md).

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

---

## Lisensi & Kontributor

- **Pengembang & Hak Cipta**: [tegokkk](https://github.com/tegokkk)
- **Proyek**: POINTER PHOTOBOOTH (RIRI Photobooth Platform)
- Dibuat untuk penyelenggaraan event, expo TI 2026, dan kebutuhan photobooth komersial. Penggunaan dan modifikasi komersial tunduk pada izin pemilik repositori.
