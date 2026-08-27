<p align="center">
  <img src="./docs/banner.svg" alt="RIRI Photobooth" width="100%" />
</p>

<h1 align="center">RIRI PHOTOBOOTH</h1>

<p align="center">
  <strong>Web photobooth kiosk untuk mengabadikan momen, memilih frame, mencetak, dan membagikan foto.</strong><br />
  Cepat digunakan tamu, mudah dioperasikan, dan siap dikembangkan untuk event, wedding, pop-up, maupun venue komersial.
</p>

<p align="center">
  <a href="https://riri-frontend-three.vercel.app">Live App</a> ·
  <a href="https://riri-backend.vercel.app/health">API Health</a> ·
  <a href="./docs/PRINT_BRIDGE.md">Print Bridge</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A" alt="React 19" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
</p>

## Ringkasan

RIRI PHOTOBOOTH adalah aplikasi photobooth berbasis browser dengan pengalaman kiosk yang sederhana: tamu membuka sesi, memilih frame, mengambil satu atau beberapa foto, meninjau hasil, lalu memilih cetak atau QR/download.

Arsitekturnya memisahkan antarmuka kiosk dari API dan storage. Foto dapat diproses langsung di browser, frame memiliki asset preview dan master, sedangkan foto online disimpan privat dan hanya dapat diakses melalui token share yang valid.

## Status Produk

| Area | Status | Catatan |
| --- | --- | --- |
| Alur tamu tanpa login | ✅ Baseline siap | Cocok untuk kiosk dan event. |
| Kamera browser | ✅ Tersedia | Membutuhkan HTTPS atau `localhost` dan izin kamera. |
| Frame multi-slot | ✅ Tersedia | Mendukung slot 1, 2, 3, 4, dan 6 foto. |
| Export resolusi tinggi | ✅ Tersedia | Preview memakai asset kecil; hasil akhir memakai master asset. |
| Cetak | ✅ Fallback browser | Print Bridge lokal direkomendasikan untuk operasi booth. |
| QR dan download | ✅ Tersedia | Bersifat opsional dan memakai guest access token. |
| Dashboard operator | ⚠️ Tersedia dengan PIN UI | PIN browser bukan pengganti autentikasi backend. Batasi akses admin sebelum dipakai di jaringan publik. |
| Operasional berbayar tanpa pengawasan | ⚠️ Perlu hardening | Uji printer, monitoring, backup, dan recovery sebelum launch komersial. |

## Fitur Utama

### Pengalaman tamu

- Landing screen yang langsung mengarahkan tamu untuk memulai sesi.
- Pemilihan frame dengan preview yang mengikuti rasio asli masing-masing desain.
- Single-shot dan multi-shot sesuai jumlah slot frame.
- Countdown sebelum mengambil foto, mirror preview, serta pergantian kamera yang tersedia.
- Foto ulang dan reset sesi agar foto tamu sebelumnya tidak terbawa.

### Kreativitas dan output

- Frame PNG/WebP dengan koordinat slot, rotasi, dan z-index dari database.
- Compositing di browser menggunakan canvas tanpa menurunkan ukuran master frame.
- Filter brightness, contrast, dan saturation.
- Download PNG/JPG lokal.
- Preview cetak dan pilihan jumlah copy.
- QR/share link tanpa akun pelanggan.

### Operasional dan privasi

- PostgreSQL melalui Prisma.
- Supabase Storage untuk frame dan foto online.
- Foto pelanggan tidak disajikan sebagai file publik langsung.
- Idempotency key untuk mencegah upload atau print job ganda saat retry.
- Endpoint health check dan request ID untuk troubleshooting.
- Cleanup foto guest berdasarkan retention policy.

## Alur Pengguna

```mermaid
flowchart LR
    A[Landing] --> B[Pilih Frame]
    B --> C[Preview Kamera]
    C --> D[Countdown & Ambil Foto]
    D --> E{Semua Slot Terisi?}
    E -- Belum --> C
    E -- Ya --> F[Review & Edit]
    F --> G{Output}
    G --> H[Cetak]
    G --> I[QR / Download]
    G --> J[Foto Ulang]
    H --> K[Sesi Selesai]
    I --> K
    J --> C
    K --> A
```

## Arsitektur

```mermaid
flowchart TB
    K[Kiosk Browser / iPad]
    F[Next.js + React + Zustand]
    C[Canvas Compositor]
    A[Express REST API]
    P[Prisma ORM]
    D[(PostgreSQL / Supabase)]
    S[(Supabase Storage)]
    B[Optional Print Bridge]
    R[Printer]

    K --> F
    F --> C
    F -->|REST + guest token| A
    A --> P --> D
    A --> S
    F -->|local network| B --> R
    F -. browser print fallback .-> R
```

### Tanggung jawab setiap lapisan

- `frontend`: UI kiosk, permission kamera, session flow, canvas compositing, export, QR, dan print preview.
- `backend`: frame catalog, upload foto, media authorization, share link, metrics, dan print queue.
- `PostgreSQL`: frame, slot, photo, share link, serta print job.
- `Supabase Storage`: master/preview frame dan foto online.
- `Print Bridge`: integrasi printer lokal, retry, queue, dan status printer jika otomatisasi cetak dibutuhkan.

## Struktur Repositori

```text
RIRI/
├── backend/
│   ├── prisma/              # Schema dan migration database
│   └── src/                 # Express API, controller, service, dan test
├── frontend/
│   ├── public/frames/       # Asset frame untuk preview/fallback
│   └── src/                 # Next.js app, kiosk UI, store, dan compositor
├── docs/
│   ├── PRINT_BRIDGE.md      # Kontrak bridge printer lokal
│   └── banner.svg           # Banner README
├── FRAME/masters/           # Master lokal; ignored, jangan commit secret/asset mentah
├── ARCHITECTURE.md
└── PHOTOBOOTH_USAHA_PLAN.md
```

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20 atau lebih baru.
- PostgreSQL 16 atau Supabase project.
- Browser modern dengan kamera; kamera hanya dapat dipakai pada HTTPS atau `localhost`.
- Print Bridge lokal dan printer foto untuk mode cetak otomatis.

### 1. Clone dan install

```bash
git clone https://github.com/tegokkk/RIRI.git
cd RIRI

cd backend
npm ci

cd ../frontend
npm ci
```

### 2. Konfigurasi backend

Buat `backend/.env` dari `backend/.env.example`. Untuk Supabase transaction pooler, gunakan connection string terbaru dari dashboard Supabase dan aktifkan mode PgBouncer:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
PRISMA_PGBOUNCER="true"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
PORT=5000

SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="server_only_key"
FRAME_STORAGE_BUCKET="frames"
GUEST_PHOTO_RETENTION_HOURS="168"
```

Password database harus di-URL-encode jika mengandung karakter khusus. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh berada di backend atau environment manager, tidak boleh masuk repository maupun browser.

Terapkan migration dan jalankan API:

```bash
cd backend
npx prisma migrate deploy
npm run dev
```

Untuk database lokal disposable, `npx prisma db push` dapat dipakai saat development. Gunakan migration untuk staging dan production.

### 3. Konfigurasi frontend

Buat `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_OPERATOR_PIN="ganti-dengan-pin-lokal"
NEXT_PUBLIC_PRINT_BRIDGE_URL=""
```

`NEXT_PUBLIC_OPERATOR_PIN` dikirim ke browser, sehingga hanya cocok sebagai kontrol UI pada perangkat kiosk yang dikunci. Jangan menganggapnya sebagai secret backend.

Jalankan frontend di terminal lain:

```bash
cd frontend
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 4. Sinkronisasi asset frame

Asset final beresolusi tinggi berada di `FRAME/masters` dan folder tersebut sengaja di-ignore dari Git. Setelah environment Supabase dan database siap, jalankan dari folder `backend`:

```bash
npm run frames:sync
```

Perintah ini mengunggah preview dan master ke bucket `frames`, lalu menyimpan URL-nya di `preview_image_url` dan `master_image_url`. Preview dipakai untuk katalog; master dipakai untuk hasil akhir dan cetak.

## Environment Variables

| Variable | Dipakai oleh | Fungsi |
| --- | --- | --- |
| `DATABASE_URL` | Backend | Connection string PostgreSQL/Supabase. |
| `PRISMA_PGBOUNCER` | Backend | `true` saat memakai transaction pooler. |
| `FRONTEND_URL` | Backend | Origin frontend untuk CORS. |
| `SUPABASE_URL` | Backend/ops | Project Supabase untuk storage. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend/ops | Upload asset dan foto; server-only. |
| `FRAME_STORAGE_BUCKET` | Backend/ops | Bucket asset frame, default `frames`. |
| `GUEST_PHOTO_RETENTION_HOURS` | Backend/ops | Retensi foto guest. |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL API. |
| `NEXT_PUBLIC_OPERATOR_PIN` | Frontend | PIN UI lokal untuk operator; bukan secret. |
| `NEXT_PUBLIC_PRINT_BRIDGE_URL` | Frontend | Endpoint bridge printer lokal, opsional. |

Jangan commit `.env`, `.env.local`, password, service role key, atau token share. Jika secret pernah terekspos, rotasi di provider lalu redeploy.

## Deployment Vercel

### Frontend

- Set Root Directory ke `frontend`.
- Build command: `npm run build`.
- Tambahkan `NEXT_PUBLIC_API_URL` dengan URL backend production.
- Pastikan domain menggunakan HTTPS agar kamera dapat diminta browser.

### Backend

- Set Root Directory ke `backend`.
- Pertahankan `backend/vercel.json`.
- Isi `DATABASE_URL`, `PRISMA_PGBOUNCER=true`, `FRONTEND_URL`, `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `FRAME_STORAGE_BUCKET`.
- Jalankan migration production dengan proses deploy yang terkontrol sebelum API digunakan.
- Jangan mengandalkan filesystem serverless untuk menyimpan foto permanen; gunakan Supabase Storage.

Verifikasi setelah deploy:

```bash
curl https://your-backend-domain/health
curl https://your-backend-domain/ready
curl https://your-backend-domain/api/frames
```

`/health` hanya memeriksa liveness. `/ready` dan `/api/frames` membantu memastikan koneksi database benar-benar siap.

## Perintah Penting

| Lokasi | Perintah | Kegunaan |
| --- | --- | --- |
| `backend` | `npm run dev` | Menjalankan API development. |
| `backend` | `npm test -- --runInBand` | Menjalankan test backend. |
| `backend` | `npm run frames:sync` | Upload preview/master frame dan update URL database. |
| `backend` | `npm run photos:cleanup` | Membersihkan foto guest yang melewati retensi. |
| `backend` | `npx prisma migrate deploy` | Menerapkan migration production. |
| `frontend` | `npm run dev` | Menjalankan kiosk development. |
| `frontend` | `npm run lint` | Memeriksa kualitas kode frontend. |
| `frontend` | `npm run build` | Membuat build production. |

## Print Bridge

Tanpa bridge, aplikasi menggunakan dialog cetak bawaan browser. Ini cocok untuk uji coba, tetapi browser tidak dapat mengetahui printer offline, kertas habis, atau status cetak secara akurat.

Untuk operasi booth, gunakan alur:

```text
iPad / Browser Kiosk → Wi-Fi lokal → Print Bridge → USB/Network → Printer Foto
```

Bridge harus memvalidasi payload, menjaga antrean lokal, menerima `jobId` sebagai idempotency key, dan mengembalikan status error yang jelas. Kontrak lengkap tersedia di [`docs/PRINT_BRIDGE.md`](docs/PRINT_BRIDGE.md).

## Keamanan dan Privasi

- Foto online disimpan privat dan dilayani melalui endpoint media ber-token.
- Guest access token disimpan sebagai hash di database.
- QR/share link memiliki masa berlaku dan dapat dicabut.
- Service role key hanya boleh dipakai server-side.
- CORS harus dibatasi ke domain frontend yang benar pada production.
- Kunci operator di frontend hanya penghalang UI. Untuk admin yang terekspos ke internet, tambahkan autentikasi backend, authorization middleware, dan pembatasan jaringan.
- Terapkan backup PostgreSQL, lifecycle storage, dan cleanup terjadwal.
- Jalankan browser dalam kiosk mode dan nonaktifkan akses umum ke DevTools/file system pada perangkat booth.

## Checklist Sebelum Dipakai Berbayar

- [ ] Kamera berjalan pada perangkat target melalui HTTPS.
- [ ] Semua frame diuji dengan jumlah slot yang benar.
- [ ] Hasil preview sama dengan file export dan hasil cetak.
- [ ] Master frame sudah tersinkron dan ukuran output sesuai kebutuhan cetak.
- [ ] Printer offline, kertas habis, dan retry sudah diuji.
- [ ] Print Bridge dipasang jika membutuhkan cetak otomatis.
- [ ] Double-click tidak membuat upload atau print job ganda.
- [ ] Sesi baru tidak menampilkan foto tamu sebelumnya.
- [ ] QR bersifat opsional dan link dapat diakses dari perangkat pelanggan.
- [ ] Retention cleanup dan backup sudah dijadwalkan.
- [ ] Admin endpoint tidak terbuka tanpa proteksi yang memadai.
- [ ] Minimal 50–100 sesi simulasi dilakukan sebelum event komersial.

Baseline ini sudah cocok untuk pilot dan event terkontrol. Untuk operasi unattended berskala usaha, selesaikan hardening admin, Print Bridge, monitoring printer, backup, dan uji recovery terlebih dahulu.

## Dokumentasi Lanjutan

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — keputusan arsitektur production.
- [`PHOTOBOOTH_USAHA_PLAN.md`](PHOTOBOOTH_USAHA_PLAN.md) — rencana kesiapan usaha dan roadmap.
- [`docs/PRINT_BRIDGE.md`](docs/PRINT_BRIDGE.md) — kontrak integrasi printer lokal.

## Troubleshooting Singkat

| Gejala | Pemeriksaan |
| --- | --- |
| Frame tidak muncul | Periksa `NEXT_PUBLIC_API_URL`, CORS, `/health`, `/ready`, dan koneksi database. |
| `Can't reach database server` | Pastikan `DATABASE_URL` terbaru, password URL-encoded, port pooler benar, dan `PRISMA_PGBOUNCER=true`. |
| Export frame terlihat buram | Jalankan `npm run frames:sync`, pastikan API mengirim `masterImageUrl`, lalu refresh deployment. |
| Kamera ditolak | Gunakan HTTPS/localhost dan izinkan kamera pada browser. |
| Cetak tidak otomatis | Isi `NEXT_PUBLIC_PRINT_BRIDGE_URL` atau gunakan dialog print browser. |
| Foto lama masih terlihat | Reset sesi, bersihkan storage lokal, dan periksa cleanup guest. |

## Lisensi

Proyek milik **tegokkk**. Penggunaan komersial memerlukan izin pemilik proyek.
