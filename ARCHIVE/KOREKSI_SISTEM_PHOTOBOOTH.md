# 🔍 Laporan Koreksi Menyeluruh — Aplikasi Photobooth "RIRII"

Ditinjau langsung dari source code: `backend/` (Express + Prisma + SQLite) dan `frontend/` (Next.js 16 + Zustand + Tailwind). Total **26 temuan**, dikelompokkan berdasarkan tingkat keparahan.

---

## 🔴 KRITIS — Keamanan & Privasi (perbaiki duluan, sebelum deploy)

### 1. JWT ditandatangani dengan secret default yang lemah
`backend/.env` **tidak berisi `JWT_SECRET`** sama sekali. Karena kode punya fallback:
```js
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
```
...semua token login saat ini ditandatangani dengan string publik `'fallback_secret_key'`. Siapa pun yang tahu kode ini (open source di GitHub kamu, misalnya) bisa **memalsukan token login untuk akun manapun**, termasuk admin (`isAdmin: true`).
**Fix:** generate secret random panjang (`openssl rand -hex 32`), simpan di `.env`, hapus fallback string atau ganti fallback jadi `throw new Error(...)` saat env kosong.

### 2. Endpoint DELETE foto tidak ada otentikasi/otorisasi sama sekali
```js
router.delete('/:id', photoController.deletePhoto);   // routes/photos.js
```
Tidak ada middleware auth, dan `deletePhoto` tidak mengecek `photo.userId === req.user.id`. Artinya **siapa saja yang tahu ID foto bisa menghapus foto siapa saja** — tanpa login.

### 3. Semua foto default `isPublic: true`
```js
isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
```
Frontend (`PhotoPreviewScreen.tsx`) tidak pernah mengirim field `isPublic` saat upload, jadi **setiap foto yang disimpan otomatis publik**. Ditambah endpoint `GET /api/photos?isPublic=true` bisa diakses tanpa login → siapapun bisa melihat daftar semua foto semua pengguna (termasuk mendapatkan ID-nya untuk lalu dihapus lewat bug #2).
**Fix:** default `isPublic` ke `false`, dan biarkan user memilih secara eksplisit.

### 4. IDOR pada GET /api/photos
```js
if (userId) where.userId = userId;   // tidak dicocokkan dengan token/user yang login
```
Galeri "pribadi" cuma dilindungi dengan mengirim `userId` di query string — tidak diverifikasi terhadap JWT. Kalau `userId` (UUID) bocor, foto privat orang lain bisa dibaca oleh siapapun.

### 5. Upload foto tidak divalidasi tipe filenya
```js
const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
```
`mimeType` diambil mentah dari data URL yang dikirim client tanpa whitelist (`image/png`, `image/jpeg`, dst). Konten apapun yang polanya mirip data-URL base64 bisa diterima dan disimpan sebagai file `.png`, lalu **disajikan publik lewat `/uploads`** (`express.static`). Ini celah unrestricted file upload.
**Fix:** whitelist `mimeType` ke `image/png` / `image/jpeg` saja, validasi ukuran, dan idealnya decode+re-encode gambar di server (bukan asal `Buffer.from`).

### 6. Token JWT tidak pernah dikirim di request lain
Token dari `useAuthStore` hanya dipakai di **satu** tempat (`POST /api/photos` saat upload). Endpoint lain yang secara logis butuh identitas user (`GET /api/photos`, `DELETE /api/photos/:id`, `GET /api/auth/me`) tidak pernah menyertakan header `Authorization`. Fitur login jadi nyaris tidak berpengaruh terhadap keamanan data — cocokkan dengan temuan #2 dan #4, ini akar masalahnya.

### 7. CORS terbuka untuk semua origin
```js
app.use(cors());   // tanpa opsi
```
Wajar untuk development, tapi sebelum produksi harus dibatasi ke domain frontend resmi (`origin: 'https://domainkamu.com'`).

---

## 🟠 BUG FUNGSIONAL / LOGIKA

### 8. Base URL API di-hardcode `http://localhost:5000` di 9 file
`useAppStore.ts`, `useAuthStore` (tidak langsung, tapi dipakai bersamanan), `login/page.tsx`, `register/page.tsx`, `gallery/page.tsx` (4×), `PhotoPreviewScreen.tsx`. **Begitu di-deploy ke domain lain, seluruh fitur (login, gallery, upload) langsung rusak total** karena masih memanggil `localhost:5000`.
**Fix:** buat satu file `lib/api.ts` dengan `const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'`, lalu import di semua tempat itu. Saat ini sama sekali tidak ada file `.env` di folder `frontend/`.

### 9. Tombol "Salin Link" tidak menyalin link, tapi base64 raksasa
```js
navigator.clipboard?.writeText(compositeDataUrl)   // ExportDialog.tsx
```
`compositeDataUrl` adalah data URI base64 (bisa beberapa MB), bukan URL yang bisa dibagikan. User yang klik "Salin Link" lalu paste ke WhatsApp/chat akan dapat teks raksasa yang tidak berguna.
**Fix:** upload dulu ke backend (endpoint upload sudah ada), lalu salin `${API_URL}${photo.compositeImageUrl}` — URL sebenarnya.

### 10. Tombol "See All Frames" di Quick Switch tidak berfungsi
`FrameSelector.tsx` — tombol ini tidak punya `onClick` sama sekali, murni dekoratif/dead-end.

### 11. State `'export'` di `AppStep` tidak pernah dipakai & tidak di-handle
`useAppStore.ts` mendefinisikan `AppStep = 'frame-selection' | 'camera' | 'preview' | 'export'`, tapi tidak ada kode manapun yang memanggil `setCurrentStep('export')`, dan `app/page.tsx` (switch-case router) juga tidak punya `case 'export'` — kalau suatu saat dipicu, malah nyasar balik ke frame-selection.

### 12. Metadata slot frame di-hardcode per nama file (rawan patah)
`lib/frameMeta.ts` mencocokkan frame berdasarkan **nama file PNG persis** (termasuk spasi). Kalau admin nanti menambah frame baru lewat DB/`seed.js` tanpa update file ini, frame tersebut otomatis dianggap 1-slot (fallback), padahal mungkin harusnya 3–4 slot foto strip — hasil komposit foto jadi salah tanpa error yang terlihat.
**Fix jangka menengah:** pindahkan data slot ini ke database (`Frame` model), bukan hardcode di frontend, supaya konsisten dan bisa dikelola tanpa deploy ulang.

### 13. Relasi `userId` pada model `Photo` tidak punya foreign key
```prisma
model Photo {
  userId String? @map("user_id")   // tanpa @relation
}
model User {
  // tidak ada `photos Photo[]`
}
```
Karena bukan relasi Prisma yang sebenarnya, tidak ada integritas referensial di level DB (foto bisa nempel ke `userId` yang sudah dihapus), dan kamu tidak bisa `prisma.user.findUnique({ include: { photos: true } })`.

### 14. Field `deletedAt` (soft-delete) didefinisikan tapi tidak pernah dipakai
Ada di model `Frame`, `Photo`, `User`, tapi seluruh query (`findMany`, `delete`) tidak pernah memfilter `deletedAt: null` atau menggunakan soft-delete — fitur ini setengah jadi, `deletePhoto` langsung hard-delete dari disk & DB.

---

## 🟡 KONSISTENSI ARSITEKTUR & KEBERSIHAN KODE

### 15. Komponen kamera duplikat — satu di antaranya dead code
`components/camera/CameraPreview.tsx` **tidak pernah di-import di mana pun**. Komponen yang benar-benar dipakai adalah `components/booth/CameraScreen.tsx`. Logikanya mirip tapi tidak identik (mis. `CameraPreview` tidak punya alur multi-slot/countdown) — berpotensi membingungkan developer berikutnya yang mengira ini komponen aktif.

### 16. `dialog.tsx` dan `tabs.tsx` (shadcn) tidak dipakai sama sekali
Dua komponen UI generated tapi tidak di-import di manapun di codebase. Sama halnya `Card`, `Button`, `RotateCcw` di-import di `EditPanel.tsx` dan `FrameSelector.tsx` tapi tidak pernah dirender (unused import, warning ESLint, nambah bundle kalau tree-shaking gagal).

### 17. Navigasi antar-halaman pakai `<a href>`, bukan `next/link`
Terjadi di `TopAppBar.tsx`, `SideNavBar.tsx`, `layout.tsx` (bottom nav), `login/page.tsx`, `register/page.tsx`, dan `gallery/page.tsx` (`window.location.href`). Semua ini memicu **full page reload** setiap pindah halaman — menghilangkan keunggulan SPA Next.js (transisi cepat, state tetap), dan bikin `currentStep` di `useAppStore` selalu reset ke `frame-selection` karena field itu tidak di-persist.
**Efek samping nyata:** tombol "Booth" (ikon kamera) dan "Frames" di bottom nav mobile **menuju tujuan yang identik** (`/`) dan sama-sama mendarat di layar pilih-frame, bukan langsung ke kamera — jadi salah satu ikon itu menyesatkan secara visual.

### 18. `CameraScreen.tsx` memanggil `clearPhotos()` dua kali saat mount
Dua `useEffect` terpisah (dep `[photoCount]` dan `[selectedFrameId]`) sama-sama jalan saat komponen pertama mount dan sama-sama memanggil `clearPhotos()` + `setPhotoSession()`. Tidak merusak fungsi, tapi redundant dan berpotensi race condition kalau nanti ditambah logic async di dalamnya.

### 19. Tidak ada state error saat gagal fetch daftar frame
`fetchFrames()` di `useAppStore.ts` menangkap error lalu diam-diam set `frames: []`. Di `FrameSelectionScreen.tsx` tidak ada pesan "Gagal memuat frame, coba lagi" — user hanya melihat grid kosong tanpa penjelasan apapun kalau backend down.

### 20. Tidak ada validasi input di form auth
Register/login tidak mengecek panjang minimum password di frontend maupun backend (`authController.js` cuma cek `!password`, bukan panjangnya). Email juga tidak dinormalisasi ke lowercase sebelum disimpan — `Test@mail.com` dan `test@mail.com` bisa jadi dua akun berbeda karena constraint `@unique` di Prisma case-sensitive.

### 21. Tidak ada rate limiting di endpoint login/register
Tidak ada `express-rate-limit` atau semacamnya → rawan brute-force password.

---

## 🟢 UI / UX & DETAIL KECIL

### 22. `<html lang="en">` padahal seluruh konten berbahasa Indonesia
`app/layout.tsx` — harusnya `lang="id"` untuk aksesibilitas & SEO yang benar.

### 23. Modal (ExportDialog & detail foto di Gallery) tidak bisa ditutup dengan tombol Escape
Hanya bisa ditutup lewat klik backdrop atau tombol close. Tidak ada `onKeyDown` untuk `Escape`, dan fokus tidak di-trap di dalam dialog (aksesibilitas keyboard kurang).

### 24. `confirm()` bawaan browser dipakai untuk konfirmasi hapus foto
`gallery/page.tsx` — `if (!confirm("Hapus foto ini?...")) return;` memakai native browser dialog yang tampilannya tidak konsisten dengan desain "brutalist/sketch" aplikasi ini. Sebaiknya diganti komponen dialog kustom agar konsisten visual.

### 25. Komentar kode menyesatkan di `CameraScreen.tsx`
```js
/** Instant capture (no countdown) */
const handleSnap = () => { ... startCountdown(); }
```
Komentar bilang "instant capture, no countdown", padahal fungsinya selalu memanggil `startCountdown()` (3-2-1). Bukan bug fungsional, tapi menyesatkan buat developer yang baca kode.

### 26. Toast notification container fixed di `bottom-6 right-6`
Di mobile, area ini berpotensi tertutup/berhimpitan dengan bottom nav bar setinggi 80px yang juga fixed di posisi sama. Perlu pengecekan langsung di device kecil — kemungkinan toast tertutup nav atau nav menutupi toast pertama.

---

## ✅ Yang sudah bagus (biar imbang, bukan cuma nyari salah)
- Password di-hash pakai `bcrypt` dengan salt — benar.
- Alur kompositing kanvas (`compositor.ts`) untuk mirror selfie sudah **konsisten** antara live preview (CSS flip) dan hasil akhir (canvas flip) — tidak ada bug "kebalik dua kali" di sini meskipun secara visual terlihat rawan.
- Skeleton loading & empty state di halaman Gallery sudah cukup lengkap.
- Struktur folder frontend (booth/camera/editor/export/frame/ui) rapi dan mudah dinavigasi.
- Global error handler & try-catch konsisten di semua controller backend.

---

## 📋 Prioritas Perbaikan yang Disarankan

| Prioritas | Item | Effort |
|---|---|---|
| 1 | #1 JWT secret, #2 auth DELETE, #3 default isPublic, #4 IDOR, #6 kirim token di semua request | 1 hari |
| 2 | #5 validasi mimetype upload, #7 CORS whitelist, #21 rate limit login | 0.5 hari |
| 3 | #8 hapus hardcode localhost → env var | 0.5 hari |
| 4 | #9 fix Copy Link, #10 fix tombol See All Frames, #11 hapus/handle step 'export' | 0.5 hari |
| 5 | #15–17 bersih-bersih dead code & ganti `<a>` → `next/link` | 1 hari |
| 6 | Sisanya (validasi form, aksesibilitas modal, dsb) | opsional, sesuai kapasitas |

---

Kalau kamu mau, saya bisa langsung **eksekusi perbaikannya di kode** — mulai dari yang prioritas 1 (keamanan) dulu, atau semuanya sekaligus. Tinggal bilang mau mulai dari yang mana.
