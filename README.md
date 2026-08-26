<p align="center">
  <img src="./docs/banner.png" alt="RIRI PHOTOBOOTH" width="100%" />
</p>

<h1 align="center">RIRI PHOTOBOOTH</h1>

<p align="center">
  Photobooth digital berbasis web untuk mengambil, mengedit, menyimpan, dan membagikan foto langsung dari browser.
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

RIRI PHOTOBOOTH memindahkan pengalaman photobooth ke perangkat yang memiliki kamera dan browser modern. Pengguna dapat memilih frame, mengambil satu atau beberapa foto, mengatur tampilan foto, lalu mengunduh atau membuat tautan berbagi.

Frontend menggunakan Next.js dan React. Backend menyediakan REST API berbasis Express, Prisma, dan PostgreSQL. File foto dapat disimpan di Supabase Storage ketika kredensial Supabase tersedia, atau di filesystem lokal untuk pengembangan dan pengujian. Asset frame memakai dua versi: preview ringan untuk navigasi dan master beresolusi tinggi untuk compositing serta export.

## Fitur Utama

| Area | Kapabilitas |
| --- | --- |
| Kamera | Permission kamera browser, pergantian kamera, mirror preview, countdown 3 detik, single shot dan multi-shot |
| Kreativitas | Frame dengan slot foto, compositing di browser, filter brightness, contrast, dan saturation |
| Output | Cetak melalui dialog printer sistem atau print bridge opsional, unduh PNG/JPG, preview hasil, QR code, dan tautan berbagi yang kedaluwarsa otomatis setelah 7 hari |
| Akun | Login JWT dan galeri pribadi untuk kebutuhan internal/operator; tidak diperlukan oleh pelanggan booth |
| Administrasi | Endpoint metrics khusus admin dan audit log untuk aktivitas akun |
| Privasi | Media tidak disajikan sebagai folder publik, akses melalui authorization, share token, atau guest access token |
| Reliability | Rate limiting API, validasi magic bytes, batas ukuran dan dimensi gambar, request ID, health check, dan readiness check |

## Alur Pengguna

```mermaid
flowchart LR
    A[Landing] --> B[Pilih frame]
    B --> C[Izinkan kamera]
    C --> D[Countdown 3 detik]
    D --> E[Ambil foto]
    E --> F{Semua slot terisi?}
    F -- Belum --> D
    F -- Sudah --> G[Review dan edit]
    G --> H[Compositing di browser]
    H --> I[Preview cetak]
    I --> J[Cetak via browser / print bridge]
    H --> K[QR / download opsional]
    K --> L[Simpan ke API sekali lalu buat tautan]
```

### Detail workflow foto

1. Frontend memuat daftar frame melalui `GET /api/frames`.
2. Pengguna memilih frame. Jumlah slot frame menentukan jumlah foto yang perlu diambil.
3. Browser meminta akses kamera. Foto diambil setelah countdown dan disimpan sementara di state aplikasi.
4. Compositor menyusun foto ke slot frame dan menerapkan filter visual di sisi browser.
5. Hasil dapat diunduh langsung tanpa mengunggah file.
6. Saat pengguna memilih cetak, browser membuka dialog printer; jika `NEXT_PUBLIC_PRINT_BRIDGE_URL` diisi, pekerjaan dikirim ke bridge lokal.
7. Saat pengguna memilih QR, frontend mengirim composite image satu kali ke `POST /api/photos`.
8. Backend memvalidasi format, ukuran, dimensi, dan isi file sebelum menyimpannya.
9. `POST /api/share` menghasilkan tautan berbagi dengan masa berlaku tujuh hari.

### Mode usaha

- Pelanggan menyelesaikan sesi sebagai guest tanpa login.
- Pembayaran dilakukan manual kepada operator dan tidak dicatat di sistem.
- Galeri, login, dan penghapusan foto tetap tersedia hanya melalui URL internal untuk operator; tidak ditampilkan di navigasi kiosk.
- Foto guest yang tersimpan online dibersihkan otomatis sesuai `GUEST_PHOTO_RETENTION_HOURS` (default 168 jam).

## Arsitektur Sistem

```mermaid
flowchart TB
    U[Browser pengguna]
    F[Next.js frontend\nReact + Zustand + Fabric.js]
    A[Express REST API]
    P[Prisma ORM]
    D[(PostgreSQL)]
    S{Photo storage}
    SB[Supabase Storage]
    FS[Filesystem lokal\nUPLOAD_DIR]

    U --> F
    F -->|REST + JWT / share token| A
    A --> P
    P --> D
    A --> S
    S -->|Jika kredensial tersedia| SB
    S -->|Fallback development| FS
```

### Batas layanan

- `frontend`: antarmuka, kamera, compositing, editor, galeri, export, dan halaman share.
- `backend`: autentikasi, frame catalog, photo lifecycle, media access, share link, admin metrics, dan audit log.
- `PostgreSQL`: users, frames, frame slots, photos, share links, preferences, dan audit logs.
- `Supabase Storage` atau filesystem: file hasil foto.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| UI dan state | Framer Motion, Zustand, Lucide React, shadcn/base UI |
| Media | Fabric.js, Canvas API, browser MediaDevices API, QRCode React |
| Backend | Node.js 20+, Express 5, CommonJS |
| Data | Prisma 5, PostgreSQL |
| Auth dan security | JWT, bcryptjs, CORS allowlist, express-rate-limit |
| Storage | Supabase Storage untuk foto dan asset frame, filesystem fallback |
| Quality | Jest, Supertest, ESLint, Prisma validation, npm audit |
| CI | GitHub Actions |

## Struktur Repository

```text
.
├── .github/workflows/ci.yml       # Pipeline lint, test, audit, dan build
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # Database migrations
│   │   ├── schema.prisma          # Model dan relasi database
│   │   └── seed.js                # Seed frame dan admin opsional
│   └── src/
│       ├── controllers/           # Handler request
│       ├── lib/                   # Prisma dan Supabase client
│       ├── middleware/            # Auth dan authorization
│       ├── routes/                # REST route modules
│       ├── services/              # Business logic foto dan media
│       └── tests/                 # Test backend
├── frontend/
│   ├── public/frames/             # Asset frame photobooth
│   └── src/
│       ├── app/                   # Route Next.js App Router
│       ├── components/            # Booth, editor, export, gallery, UI
│       ├── hooks/                 # Kamera dan reusable hooks
│       ├── lib/                   # API, compositor, media, utilities
│       └── store/                 # Zustand stores
├── docs/banner.png                # Banner README
└── scripts/
    ├── backup.ps1                 # Backup lokal
    └── validate-release.ps1       # Release gate lokal
```

## Persyaratan

- Node.js 20 atau lebih baru
- npm
- PostgreSQL yang dapat diakses oleh backend
- Browser modern dengan dukungan kamera untuk mencoba fitur photobooth
- Supabase Storage opsional untuk penyimpanan cloud

## Menjalankan Secara Lokal

### 1. Clone repository

```bash
git clone https://github.com/tegokkk/RIRI.git
cd RIRI
```

### 2. Konfigurasi backend

```bash
cd backend
npm ci
```

Buat `backend/.env`, lalu isi nilai minimum berikut. `DATABASE_URL` harus mengarah ke PostgreSQL karena provider Prisma pada `schema.prisma` adalah `postgresql`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="gunakan_string_acak_minimal_32_karakter"
FRONTEND_URL="http://localhost:3000"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="./uploads"
FRAME_STORAGE_BUCKET="frames"
FRAME_MASTER_DIR="../FRAME/masters"
FRAME_ASSET_COLUMNS_ENABLED="false"
```

Untuk memakai Supabase Storage, tambahkan konfigurasi berikut ke `backend/.env`:

```env
SUPABASE_URL="https://PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="isi_dengan_secret_key_server"
```

Jalankan migrasi dan seed frame:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Setelah migration asset frame berhasil diterapkan dan bucket `frames` tersedia, aktifkan kolom asset lalu sinkronkan preview dan master ke Supabase:

```bash
FRAME_ASSET_COLUMNS_ENABLED=true npm run frames:sync
```

Pada PowerShell:

```powershell
$env:FRAME_ASSET_COLUMNS_ENABLED = "true"
npm run frames:sync
```

Bucket `frames` dapat public dan cacheable karena berisi desain frame. Bucket `photos` tetap private.

`SEED_ADMIN_PASSWORD` bersifat opsional. Jika diisi sebelum `npx prisma db seed`, seed akan membuat atau mereset akun admin `admin@riri.com`. Password harus memiliki 8 sampai 72 karakter dan mengandung huruf serta angka.

### 3. Konfigurasi frontend

Buka terminal baru dari root repository:

```bash
cd frontend
npm ci
```

Buat `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
# Optional: POST endpoint for a local print bridge. Leave blank for browser/system print.
NEXT_PUBLIC_PRINT_BRIDGE_URL=""
```

Jalankan frontend:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Backend dapat diperiksa melalui [http://localhost:5000/health](http://localhost:5000/health), sedangkan `/ready` memeriksa koneksi database.

## Perintah Penting

| Lokasi | Perintah | Kegunaan |
| --- | --- | --- |
| `backend` | `npm run dev` | Menjalankan API dengan nodemon |
| `backend` | `npm start` | Menjalankan API mode biasa |
| `backend` | `npm test -- --runInBand` | Menjalankan test backend |
| `backend` | `npm run photos:cleanup` | Menghapus foto guest sesuai retention dan foto trash yang sudah lewat masa simpan |
| `backend` | `npx prisma generate` | Menghasilkan Prisma Client |
| `backend` | `npx prisma migrate dev` | Membuat dan menerapkan migration lokal |
| `backend` | `npx prisma migrate deploy` | Menerapkan migration pada environment deploy |
| `frontend` | `npm run dev` | Menjalankan Next.js development server |
| `frontend` | `npm run lint` | Menjalankan ESLint |
| `frontend` | `npm run build` | Membuat production build |
| root | `./scripts/validate-release.ps1` | Menjalankan release gate lokal di PowerShell |

## REST API Ringkas

Semua route API memakai prefix `/api` dan rate limiting umum. Route yang memerlukan login menggunakan Bearer JWT.

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Liveness check |
| `GET` | `/ready` | Public | Readiness check dengan query database |
| `POST` | `/api/auth/register` | Public | Membuat akun |
| `POST` | `/api/auth/login` | Public | Login dan menerima JWT |
| `GET` | `/api/auth/me` | JWT | Mengambil profil aktif |
| `GET` | `/api/frames` | Public | Mengambil frame aktif |
| `POST` | `/api/photos` | Optional auth | Menyimpan composite image |
| `GET` | `/api/photos` | JWT | Mengambil galeri milik pengguna |
| `DELETE` | `/api/photos/:id` | JWT | Memindahkan foto ke trash |
| `POST` | `/api/share` | Optional auth | Membuat tautan berbagi |
| `GET` | `/api/share/:token` | Public token | Mengambil metadata foto yang dibagikan |
| `DELETE` | `/api/share/:token` | Owner/admin | Mencabut tautan berbagi |
| `GET` | `/api/media/:filename` | Protected | Menyajikan media setelah authorization |
| `GET` | `/api/admin/metrics` | Admin JWT | Mengambil metrics administrasi |

## Workflow Development dan CI

```mermaid
flowchart LR
    A[Branch / pull request] --> B[Install dengan npm ci]
    B --> C[Prisma generate dan validate]
    C --> D[Test backend]
    D --> E[Audit dependency]
    E --> F[Lint frontend]
    F --> G[Build frontend]
    G --> H[Merge setelah CI hijau]
```

Pipeline GitHub Actions berjalan pada push dan pull request ke branch `main`. Pemeriksaan mencakup:

- instalasi dependency backend dan frontend dengan lockfile;
- Prisma generate, schema validation, dan migration;
- test backend dengan Jest dan Supertest;
- audit dependency production;
- lint frontend;
- production build frontend.

Sebelum rilis, jalankan release gate lokal dari PowerShell:

```powershell
.\scripts\validate-release.ps1
```

Script tersebut memeriksa hygiene repository, asset frame, potensi secret, test, Prisma, audit, lint, dan production build.

## Keamanan dan Privasi

- Jangan commit `backend/.env`, `frontend/.env`, JWT secret, atau Supabase service role key.
- Simpan master frame di storage permanen. Folder `FRAME/masters` hanya menjadi sumber lokal untuk proses sinkronisasi dan diabaikan oleh Git.
- Gunakan HTTPS pada production agar akses kamera dan token tetap terlindungi.
- `JWT_SECRET` production wajib memiliki minimal 32 karakter.
- Upload hanya menerima PNG atau JPEG dengan validasi magic bytes, batas 5 MB, dimensi maksimum 8.000 px, dan maksimum 40 juta pixel.
- File foto tidak disajikan sebagai static public directory. Akses media diperiksa melalui owner, admin, foto public, share token, atau guest access token.
- Share link memiliki masa berlaku default tujuh hari dan dapat dicabut oleh pemilik atau admin.

## Deployment

Backend memiliki konfigurasi Vercel pada `backend/vercel.json`. Untuk deployment production:

1. Sediakan PostgreSQL production dan jalankan `npx prisma migrate deploy`.
2. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, dan `NODE_ENV=production` pada backend.
3. Pilih Supabase Storage atau filesystem persisten untuk media. Filesystem ephemeral tidak cocok untuk production.
4. Set `NEXT_PUBLIC_API_URL` pada frontend ke URL backend production. Biarkan `NEXT_PUBLIC_PRINT_BRIDGE_URL` kosong jika memakai dialog printer iPad.
5. Set `GUEST_PHOTO_RETENTION_HOURS` lalu jadwalkan `npm run photos:cleanup` sebagai cron/Task Scheduler.
6. Jalankan CI dan pastikan endpoint `/health` serta `/ready` merespons sesuai harapan.

Dokumen teknis tambahan tersedia di [ARCHITECTURE.md](./ARCHITECTURE.md) dan [DEPLOY_READINESS_PLAN_0_14.md](./DEPLOY_READINESS_PLAN_0_14.md).

## Lisensi

Lisensi proyek belum ditentukan. Tambahkan file `LICENSE` sebelum distribusi publik.
