# MASTER TASK PHOTOBOOTH 0-14

Dokumen ini adalah urutan kerja resmi untuk membawa aplikasi Photobooth dari MVP lokal menjadi aplikasi yang aman, stabil, terukur, dan siap dirilis.

Status awal seluruh task adalah `PENDING`. Belum ada implementasi kode yang dilakukan berdasarkan dokumen ini.

## Aturan Eksekusi

- Kerjakan task sesuai urutan 0 sampai 14.
- Hanya satu task berstatus `IN PROGRESS` pada satu waktu.
- Jangan menandai task `DONE` hanya karena kode sudah ditulis.
- Task baru dianggap `DONE` setelah build, lint, test, dan pemeriksaan manual terkait lulus.
- Setiap perubahan database wajib mempunyai migration dan rencana rollback.
- Setiap perubahan API wajib memperbarui kontrak frontend, backend, test, dan dokumentasi.
- Jangan menghapus atau menimpa perubahan pengguna yang sudah ada di working tree.
- Temuan baru dicatat di bagian task terkait. Temuan kritis boleh menghentikan task berikutnya.

## Urutan dan Dependensi

| No. | Task | Prioritas | Bergantung pada | Status |
|---:|---|---|---|---|
| 0 | Baseline, inventaris, backup, dan acceptance matrix | P0 | - | PENDING |
| 1 | Database, migration, index, dan data lama | P0 | 0 | PENDING |
| 2 | Autentikasi, otorisasi, dan privasi | P0 | 1 | PENDING |
| 3 | Upload, validasi file, dan storage | P0 | 1, 2 | PENDING |
| 4 | Kontrak API, pagination, dan error handling | P0 | 1, 2, 3 | PENDING |
| 5 | Frame dinamis, slot metadata, dan admin frame | P1 | 1, 4 | PENDING |
| 6 | Kamera dan sesi pengambilan foto | P1 | 4, 5 | PENDING |
| 7 | Compositor, editor, dan kualitas hasil | P1 | 5, 6 | PENDING |
| 8 | Export, share link, QR, dan print readiness | P1 | 3, 4, 7 | PENDING |
| 9 | Gallery dan lifecycle foto | P1 | 2, 4, 8 | PENDING |
| 10 | Design system, responsivitas, navigasi, aksesibilitas | P1 | 4 | PENDING |
| 11 | Animasi, transisi, dan motion accessibility | P2 | 6, 7, 10 | PENDING |
| 12 | Observability, analytics, admin operations, audit log | P2 | 2, 4, 8, 9 | PENDING |
| 13 | Automated test, QA, security, dan performance gate | P0 | 1-12 | PENDING |
| 14 | Deployment, CI/CD, dokumentasi, rollback, dan release | P0 | 13 | PENDING |

---

## TASK 0 - Baseline, Inventaris, Backup, dan Acceptance Matrix

Tujuan: mengunci kondisi awal agar perbaikan dapat diukur dan tidak merusak fungsi yang sudah berjalan.

### Langkah

- [ ] Catat versi Node.js, npm, Next.js, React, Express, Prisma, browser target, dan sistem operasi pengujian.
- [ ] Catat struktur repository, lokasi frontend, backend, database, upload, frame, dan file environment.
- [ ] Catat seluruh perubahan lokal yang belum di-commit tanpa mengubah atau menghapusnya.
- [ ] Buat backup terverifikasi untuk `backend/prisma/dev.db` dan `backend/uploads` sebelum migrasi.
- [ ] Simpan daftar environment variable yang dibutuhkan tanpa menyalin nilai rahasia ke dokumentasi.
- [ ] Jalankan baseline frontend: install check, build, lint, dan audit dependency.
- [ ] Jalankan baseline backend: start check, health check, test, Prisma status, dan audit dependency.
- [ ] Rekam alur manual awal: landing, pilih frame, izin kamera, countdown, capture, preview, edit, download, login, gallery, dan delete.
- [ ] Catat ukuran bundle, ukuran frame, waktu muat awal, waktu compositing, dan penggunaan memori sebagai pembanding.
- [ ] Susun acceptance matrix untuk desktop, mobile, kamera diizinkan, kamera ditolak, offline, API gagal, dan storage gagal.
- [ ] Putuskan target produksi: domain, HTTPS, browser minimum, batas ukuran upload, retensi foto, dan target trafik.
- [ ] Buat daftar data contoh yang boleh dipakai untuk test dan pastikan tidak mengandung data pribadi nyata.

### Output Wajib

- Baseline report.
- Backup database dan upload yang bisa dipulihkan.
- Acceptance matrix dan daftar browser/device target.
- Daftar risiko awal dengan pemilik dan prioritas.

### Definition of Done

- [ ] Kondisi awal dapat direproduksi.
- [ ] Backup sudah diuji dengan proses restore non-produksi.
- [ ] Semua kegagalan baseline tercatat, termasuk lint frontend dan test yang belum tersedia.
- [ ] Tidak ada file aplikasi yang diubah selain dokumen kerja/audit.

---

## TASK 1 - Database, Migration, Index, dan Data Lama

Tujuan: menjadikan skema database dapat dilacak, aman dimigrasikan, dan cukup lengkap untuk fitur berikutnya.

### Langkah

- [ ] Cocokkan `schema.prisma` dengan tabel SQLite aktual menggunakan introspeksi terkontrol.
- [ ] Buat baseline Prisma migration tanpa menghapus data yang sudah ada.
- [ ] Pisahkan seed development dari proses produksi.
- [ ] Ganti seed frame yang memakai `deleteMany()` menjadi upsert idempotent.
- [ ] Tambahkan index foto untuk `userId`, `frameId`, `createdAt`, `isPublic`, dan `deletedAt` sesuai query nyata.
- [ ] Tambahkan index frame untuk `category`, `isActive`, `isPremium`, dan urutan tampilan.
- [ ] Audit constraint email, foreign key, nilai default, nullable field, dan aturan `onDelete`.
- [ ] Normalisasi email ke lowercase dan tentukan kebijakan case-insensitive uniqueness.
- [ ] Tentukan lifecycle foto: aktif, soft deleted, expired, dan permanently deleted.
- [ ] Bersihkan atau ubah empat foto lama yang masih `isPublic=true` setelah backup dan persetujuan data migration.
- [ ] Tambahkan model/field minimum untuk frame slots, share links, user preferences, sessions/token, audit logs, dan analytics events.
- [ ] Tentukan penggunaan field yang sudah ada tetapi belum dipakai: metadata, source, counters, dimensions, premium, credit, dan deletedAt.
- [ ] Tambahkan timestamp konsisten dan strategi timezone UTC.
- [ ] Buat migration forward dan prosedur rollback untuk setiap perubahan.
- [ ] Uji migrasi pada salinan database lama, database kosong, dan database yang sudah termigrasi.

### Output Wajib

- Folder migration Prisma yang lengkap.
- Seed idempotent.
- Data migration untuk data lama.
- ERD dan data dictionary ringkas.

### Definition of Done

- [ ] `prisma migrate status` menyatakan database terkelola dan up to date.
- [ ] Seed dapat dijalankan dua kali tanpa duplikasi atau kehilangan data.
- [ ] Query utama memakai index yang sesuai.
- [ ] Backup lama dapat dipulihkan dan dimigrasikan tanpa kehilangan record.

---

## TASK 2 - Autentikasi, Otorisasi, dan Privasi

Tujuan: memastikan setiap foto dan operasi hanya dapat diakses oleh pihak yang berhak.

### Langkah

- [ ] Buat matriks akses untuk guest, user, admin, pemilik foto, dan penerima share link.
- [ ] Tutup akses `GET /api/photos/:id` agar hanya pemilik, admin, atau pemegang share token valid yang dapat membaca.
- [ ] Pastikan list, detail, update, share, download-log, dan delete selalu memeriksa ownership di server.
- [ ] Jangan mempercayai `userId`, `isAdmin`, `isPublic`, atau ownership dari query/body frontend.
- [ ] Normalisasi dan validasi email sebelum lookup/register.
- [ ] Naikkan kebijakan password dan tambahkan validasi panjang maksimum untuk mencegah abuse.
- [ ] Tentukan mekanisme access token, refresh/session token, expiry, logout, dan revocation.
- [ ] Pertimbangkan cookie `HttpOnly`, `Secure`, `SameSite` agar token tidak bergantung pada localStorage.
- [ ] Tambahkan endpoint `me`, logout, forgot password, reset password, dan email verification sesuai lingkup rilis.
- [ ] Terapkan rate limit berbeda untuk login, register, reset password, upload, share, dan endpoint publik.
- [ ] Samarkan respons login/register agar tidak membocorkan apakah email tertentu terdaftar.
- [ ] Tambahkan audit log untuk login gagal, reset, perubahan role, delete, dan akses admin.
- [ ] Tambahkan kebijakan CORS allowlist yang eksplisit untuk development, staging, dan production.
- [ ] Pastikan error produksi tidak mengirim stack trace, secret, path server, atau pesan internal.
- [ ] Tambahkan privacy consent, retention notice, delete account, dan export data pengguna.

### Output Wajib

- Access-control matrix.
- Middleware otorisasi terpusat.
- Session/token design dan threat notes.
- Test negatif untuk akses lintas pengguna.

### Definition of Done

- [ ] User A tidak dapat membaca, mengubah, atau menghapus foto User B dengan mengganti ID.
- [ ] Guest hanya dapat melihat foto melalui share link valid.
- [ ] Logout/revocation benar-benar menghentikan sesi.
- [ ] Semua test auth dan ownership lulus.

---

## TASK 3 - Upload, Validasi File, dan Storage

Tujuan: membuat upload aman, efisien, dan tidak bergantung pada disk lokal server produksi.

### Langkah

- [ ] Tentukan batas ukuran request, ukuran file hasil decode, resolusi piksel, rasio, dan format yang diterima.
- [ ] Validasi MIME dari isi file atau magic bytes, bukan hanya prefix data URL.
- [ ] Tolak payload rusak, image bomb, dimensi ekstrem, format tersamar, dan metadata berbahaya.
- [ ] Decode lalu re-encode gambar dengan library image yang teruji untuk membuang metadata dan menormalkan format.
- [ ] Ganti operasi filesystem sinkron dengan pipeline asynchronous/streaming.
- [ ] Ganti nama file berbasis waktu dengan UUID/ULID yang tidak mudah ditebak dan tidak bertabrakan.
- [ ] Verifikasi `frameId` aktif dan boleh dipakai sebelum menyimpan foto.
- [ ] Simpan width, height, file size, MIME, checksum, source, dan metadata teknis yang benar.
- [ ] Pisahkan original, composite, thumbnail, dan export artifact jika semuanya memang diperlukan.
- [ ] Gunakan object storage untuk produksi dengan private bucket dan signed URL.
- [ ] Batasi static file exposure; jangan membuka seluruh folder upload secara publik.
- [ ] Buat thumbnail untuk gallery agar gambar resolusi penuh tidak dimuat pada daftar.
- [ ] Tambahkan quota per user/IP dan cleanup untuk upload yatim atau gagal.
- [ ] Tangani kegagalan parsial: file tersimpan tetapi DB gagal, atau DB tersimpan tetapi file gagal.
- [ ] Tambahkan job retensi dan permanent deletion yang ikut menghapus seluruh variant file.

### Output Wajib

- Storage adapter untuk local development dan object storage production.
- Validator/normalizer gambar terpusat.
- Cleanup job dan failure recovery.
- Test file invalid, oversized, corrupt, dan concurrent upload.

### Definition of Done

- [ ] File yang bukan gambar tidak dapat lolos dengan mengganti extension/MIME.
- [ ] Upload besar tidak memblokir event loop.
- [ ] File private tidak dapat diakses tanpa otorisasi/signed URL.
- [ ] Tidak ada orphan file setelah simulasi kegagalan.

---

## TASK 4 - Kontrak API, Pagination, dan Error Handling

Tujuan: membuat komunikasi frontend-backend konsisten, terdokumentasi, dan mudah diuji.

### Langkah

- [ ] Definisikan skema request/response untuk auth, frames, photos, share links, user settings, dan admin.
- [ ] Gunakan validasi schema terpusat untuk params, query, body, dan environment variable.
- [ ] Standarkan format sukses, error code, message aman, field error, dan request ID.
- [ ] Tambahkan versioning API atau kebijakan kompatibilitas sebelum kontrak berkembang.
- [ ] Ganti limit tetap 100 dengan cursor pagination serta limit maksimum.
- [ ] Tambahkan filter dan sort yang diizinkan dengan whitelist.
- [ ] Pastikan query parameter tak dikenal atau tidak sah ditolak/dinormalisasi secara konsisten.
- [ ] Pisahkan status HTTP 400, 401, 403, 404, 409, 413, 422, 429, dan 500.
- [ ] Tambahkan timeout, abort, retry terbatas, dan state error di API client frontend.
- [ ] Jangan membungkam kegagalan save setelah download; tampilkan status lokal dan cloud secara terpisah.
- [ ] Tambahkan idempotency untuk operasi yang dapat terkirim ulang seperti upload, share, dan print order.
- [ ] Dokumentasikan API dengan OpenAPI atau kontrak setara.
- [ ] Buat integration test untuk happy path, validation error, unauthorized, forbidden, not found, rate limit, dan server error.

### Output Wajib

- API contract terdokumentasi.
- Validator dan error middleware terpusat.
- API client frontend bertipe jelas.
- Integration test endpoint utama.

### Definition of Done

- [ ] Frontend tidak menebak bentuk respons backend.
- [ ] Semua endpoint memiliki validasi dan kode error konsisten.
- [ ] Pagination bekerja tanpa duplikasi atau record terlewat.
- [ ] Dokumentasi API sesuai dengan respons aktual.

---

## TASK 5 - Frame Dinamis, Slot Metadata, dan Admin Frame

Tujuan: menghapus ketergantungan metadata slot yang di-hardcode di frontend.

### Langkah

- [ ] Pindahkan posisi slot, urutan slot, rasio, safe area, dan transform default ke database/API.
- [ ] Definisikan koordinat slot dalam format yang stabil, misalnya normalized 0-1 atau berdasarkan canvas source.
- [ ] Simpan ukuran source frame, thumbnail, preview, format, checksum, version, credit, category, tags, premium, dan status.
- [ ] Validasi bahwa setiap frame memiliki transparency/slot yang sesuai metadata.
- [ ] Buat preview tool untuk memeriksa frame dan slot sebelum dipublikasikan.
- [ ] Tambahkan admin CRUD frame, upload asset, reorder, activate/deactivate, category, premium, dan credit.
- [ ] Terapkan versioning agar perubahan slot tidak merusak foto lama.
- [ ] Buat thumbnail/preview teroptimasi, jangan memakai PNG 2-12 MB untuk grid selection.
- [ ] Tambahkan fallback saat asset frame hilang/rusak.
- [ ] Buat filter category dinamis dari data, bukan array hardcoded frontend.
- [ ] Tambahkan pencarian, favorites, recent, popular, dan premium state jika masuk scope produk.
- [ ] Pastikan frame baru dapat dipakai tanpa mengubah TypeScript dan redeploy frontend.

### Output Wajib

- Model frame-slot dan API-nya.
- Admin frame manager.
- Frame validation/preview tool.
- Asset pipeline untuk original, preview, dan thumbnail.

### Definition of Done

- [ ] Admin dapat menambah frame baru sampai tayang tanpa edit source frontend.
- [ ] Slot kamera dan compositor membaca metadata yang sama.
- [ ] Grid frame tidak mengunduh seluruh PNG resolusi penuh.
- [ ] Foto lama tetap dapat dirender dengan frame version lama.
- [x] Admin dapat menambah frame baru sampai tayang tanpa edit source frontend.
- [x] Slot kamera dan compositor membaca metadata yang sama.
- [x] Grid frame tidak mengunduh seluruh PNG resolusi penuh.
- [x] Foto lama tetap dapat dirender dengan frame version lama.

---

## TASK 6 - Kamera dan Sesi Pengambilan Foto

Tujuan: menjadikan pengalaman kamera tahan terhadap variasi device, permission, orientasi, dan interruption.

### Langkah

- [ ] Cegah double capture, capture saat video belum siap, dan aksi cepat berulang.
- [ ] Tambahkan retake per slot tanpa menghapus semua hasil sesi.
- [ ] Tambahkan interval antar-shot, sound toggle, flash feedback, dan indikator shot yang dapat diakses.
- [ ] Simpan draft sesi secara aman bila tab refresh/crash, tanpa memenuhi localStorage dengan base64 besar.
- [ ] Tangani suspend/resume pada mobile dan kamera yang terputus.
- [ ] Uji Chrome, Edge, Safari/iOS, Android, desktop tanpa kamera, serta browser permission blocked.

### Output Wajib

- Camera/session state machine.
- Device selector dan permission/error recovery UI.
- Live frame/slot overlay.
- Device/browser QA matrix.

### Definition of Done

- [ ] Sesi multi-shot tidak dapat menghasilkan urutan atau jumlah foto yang salah.
- [ ] Retake per slot bekerja.
- [ ] Kamera selalu dilepas setelah tidak dipakai.
- [ ] Preview dan hasil akhir memiliki crop serta mirror yang konsisten.

---

## TASK 7 - Compositor, Editor, dan Kualitas Hasil

Tujuan: menghasilkan komposit berkualitas tanpa membuat UI tersendat.

### Langkah

- [ ] Pindahkan compositing berat dari main thread ke Web Worker/OffscreenCanvas bila dukungan memadai.
- [ ] Debounce slider agar tidak merender canvas 1875x5625 pada setiap perubahan kecil.
- [ ] Gunakan preview resolution saat editing dan full resolution hanya saat export.
- [ ] Cache frame bitmap dan hasil transform yang tidak berubah.
- [ ] Bebaskan object URL, bitmap, canvas, dan buffer setelah tidak dipakai.
- [ ] Definisikan algoritma crop `cover`, posisi fokus, mirror, rotasi, dan color adjustment secara deterministik.
- [ ] Tambahkan per-slot reposition/zoom/crop dan retake.
- [ ] Tambahkan reset editor dan preset yang jelas.
- [ ] Tentukan fitur editor scope: brightness, contrast, saturation, exposure, temperature, crop, rotate, text, sticker, atau background.
- [ ] Pastikan adjustment tidak merusak alpha frame atau menurunkan ketajaman.
- [ ] Tambahkan color-space dan export quality checks.
- [ ] Tangani frame gagal dimuat, canvas tainted, memori habis, dan export dibatalkan.
- [ ] Buat golden-image test untuk membandingkan hasil compositor terhadap output referensi.
- [ ] Ukur waktu render dan peak memory pada desktop serta mobile kelas menengah.

### Output Wajib

- Pipeline preview vs full-resolution export.
- Editor per-slot sesuai scope.
- Golden-image fixtures.
- Laporan performa canvas dan memory cleanup.

### Definition of Done

- [ ] Slider tetap responsif dan tidak memicu render penuh tanpa kontrol.
- [ ] Output konsisten pada browser target.
- [ ] Perbedaan golden-image berada dalam toleransi yang ditentukan.
- [ ] Tidak ada memory growth signifikan setelah beberapa sesi berulang.

---

## TASK 8 - Export, Share Link, QR, dan Print Readiness

Tujuan: memisahkan download lokal, penyimpanan cloud, berbagi, dan print menjadi alur yang jujur serta lengkap.

### Langkah

- [ ] Pisahkan status `downloaded locally`, `saved to account`, dan `shared`; jangan memakai satu notifikasi untuk semuanya.
- [ ] Sediakan PNG dan JPEG dengan quality control; evaluasi WebP dan PDF sesuai kebutuhan.
- [ ] Tambahkan export preset untuk social, print, dan original resolution.
- [ ] Validasi DPI, dimensi fisik, bleed, safe area, dan profil warna untuk print.
- [ ] Buat share-link model dengan token acak, expiry, revoke, optional password, dan access count.
- [ ] Pastikan share link tidak membocorkan ID internal atau path storage permanen.
- [ ] Tambahkan halaman publik share yang hanya menampilkan data minimum.
- [ ] Tambahkan QR code yang menunjuk ke share link aktif.
- [ ] Perbaiki share WhatsApp/X agar membawa URL valid; gunakan Web Share file jika browser mendukung.
- [ ] Tambahkan fallback copy-link dan download ketika native share tidak tersedia.
- [ ] Cegah copy link sebelum upload/save berhasil.
- [ ] Tambahkan event download/share yang idempotent untuk counter dan analytics.
- [ ] Siapkan kontrak print order, status order, address/privacy, harga, dan payment hanya bila fitur print masuk release.
- [ ] Uji nama file, extension, MIME, download berulang, share revoke, expired link, dan unsupported browser.

### Output Wajib

- Export service dan format presets.
- Share link API, public page, revoke/expiry, dan QR.
- Status UI yang membedakan local/cloud/share.
- Spesifikasi print-ready atau keputusan menunda print.

### Definition of Done

- [ ] Tidak ada tombol share/copy yang menghasilkan link kosong atau tidak valid.
- [ ] Link expired/revoked tidak dapat mengakses foto.
- [ ] Export membuka file yang valid di aplikasi target.
- [ ] Pengguna selalu tahu apakah foto hanya tersimpan lokal atau juga di akun.

---

## TASK 9 - Gallery dan Lifecycle Foto

Tujuan: membuat gallery nyaman dipakai, hemat bandwidth, dan mengikuti aturan privasi/retensi.

### Langkah

- [ ] Gunakan endpoint berbasis session; hapus ketergantungan pada `userId` query dari frontend.
- [ ] Tambahkan cursor pagination/infinite load dengan empty, loading, skeleton, error, dan retry state.
- [ ] Gunakan thumbnail responsif dan lazy loading.
- [ ] Tambahkan sort tanggal, filter frame/category, pencarian, dan rentang tanggal sesuai kebutuhan.
- [ ] Tambahkan detail foto dengan metadata minimum, download, share, revoke, dan delete.
- [ ] Tambahkan bulk selection dan bulk delete/download jika volume foto membutuhkannya.
- [ ] Terapkan soft delete/trash dengan restore sebelum permanent deletion.
- [ ] Tampilkan status upload/process gagal dan cara retry.
- [ ] Pastikan delete membersihkan original, composite, thumbnail, export, dan share links sesuai kebijakan.
- [ ] Tambahkan retention/expiry notice dan proses delete otomatis.
- [ ] Tangani foto yang framenya sudah dinonaktifkan atau asset-nya tidak tersedia.
- [ ] Sinkronkan gallery setelah upload/delete tanpa reload penuh.
- [ ] Tambahkan cache invalidation dan hindari URL file private yang kedaluwarsa tersimpan terlalu lama.
- [ ] Uji gallery kosong, ribuan foto, jaringan lambat, offline, expired URL, dan concurrent delete.

### Output Wajib

- Gallery terpagination dan teroptimasi.
- Detail, share, trash/restore, dan lifecycle foto.
- Empty/error/offline states.
- Test ownership dan bulk/concurrent actions.

### Definition of Done

- [ ] Gallery tidak mengunduh gambar full-resolution untuk daftar.
- [ ] Data pengguna lain tidak pernah muncul.
- [ ] Delete/restore konsisten antara UI, DB, storage, dan share link.
- [ ] Gallery tetap responsif pada dataset besar.

---

## TASK 10 - Design System, Responsivitas, Navigasi, dan Aksesibilitas

Tujuan: menghilangkan style yang tidak terbentuk, membuat UI konsisten, dan memastikan semua alur dapat dipakai lintas ukuran layar serta input.

### Langkah

- [ ] Perbaiki token typography Tailwind yang saat ini dipanggil sebagai `text-*` tetapi didefinisikan sebagai `font-*`.
- [ ] Definisikan seluruh token shadcn/Base UI yang digunakan: card, muted, ring, destructive, foreground, border, dan state lain.
- [ ] Audit CSS hasil build untuk memastikan semua class penting benar-benar tergenerasi.
- [ ] Standarkan spacing, type scale, color, border, shadow, radius, icon size, focus ring, dan z-index.
- [ ] Audit kontras warna normal, hover, disabled, error, selected, dan text on image.
- [ ] Perbaiki navigasi mobile agar Booth dan Frames tidak menuju halaman identik tanpa state yang jelas.
- [ ] Tambahkan active route, back behavior, deep link, refresh recovery, dan protection untuk unsaved session.
- [ ] Pastikan toolbar, button, label, dialog, grid frame, camera, preview, dan gallery tidak overlap pada viewport target.
- [ ] Uji 320px, 360px, 390px, tablet, laptop, desktop, zoom 200%, landscape mobile, dan safe-area notch.
- [ ] Gunakan landmark, heading order, label form, alt text, dialog title, dan semantic button/link yang benar.
- [ ] Tambahkan focus trap dialog, restore focus, Escape handling, dan keyboard navigation penuh.
- [ ] Pastikan status countdown, capture, error, upload, dan toast dapat dibaca assistive technology tanpa spam.
- [ ] Pastikan touch target cukup besar dan tidak bergantung pada hover.
- [ ] Kurangi font loading yang ganda dan hilangkan warning font/layout.
- [ ] Perbaiki seluruh lint error dan warning relevan: effect state, dependency hooks, `any`, unused code, dan image optimization.

### Output Wajib

- Design tokens yang valid dan terdokumentasi.
- Responsive/accessibility QA matrix.
- Navigasi konsisten desktop/mobile.
- Lint frontend bersih sesuai policy.

### Definition of Done

- [ ] Build CSS mengandung utility/token yang dipakai komponen.
- [ ] Tidak ada overlap, horizontal scroll liar, atau teks terpotong pada viewport target.
- [ ] Alur utama dapat diselesaikan dengan keyboard.
- [ ] Audit aksesibilitas otomatis dan pemeriksaan manual utama lulus.

---

## TASK 11 - Animasi, Transisi, dan Motion Accessibility

Tujuan: menjadikan motion konsisten, informatif, ringan, dan aman bagi pengguna sensitif gerakan.

### Langkah

- [ ] Inventaris semua animasi: landing exit, hover, star wiggle, countdown, flash, slot transition, pulse, spinner, toast, dialog, dan page transition.
- [ ] Definisikan motion tokens untuk duration, easing, delay, stagger, spring, dan reduced-motion behavior.
- [ ] Gunakan motion hanya untuk menjelaskan perubahan state, hierarchy, progress, atau feedback aksi.
- [ ] Tambahkan transisi konsisten antar langkah landing, frame, camera, preview, editor, export, dan gallery.
- [ ] Hindari animasi yang mengubah layout atau menyebabkan cumulative layout shift.
- [ ] Pastikan countdown dan flash tidak dapat menimpa tombol/status lain.
- [ ] Tambahkan `prefers-reduced-motion` dan versi tanpa scale/translate/flash berlebih.
- [ ] Hentikan animasi looping saat tab tidak terlihat atau komponen tidak aktif.
- [ ] Pastikan spinner/pulse memiliki label status non-visual.
- [ ] Tambahkan sound/haptic sebagai opsi, bukan satu-satunya feedback.
- [ ] Uji rapid click, route change di tengah animasi, dialog bertumpuk, dan device lambat.
- [ ] Ukur frame rate dan main-thread blocking pada camera serta editor.

### Output Wajib

- Motion specification dan tokens.
- Reduced-motion implementation.
- Transition coverage untuk state utama.
- Performance notes untuk animasi berat.

### Definition of Done

- [ ] Seluruh motion memakai token dan tujuan yang jelas.
- [ ] Reduced-motion menghilangkan gerakan non-esensial.
- [ ] Tidak ada overlap atau state macet akibat animasi/interaksi cepat.
- [ ] Alur utama tetap responsif pada perangkat target.

---

## TASK 12 - Observability, Analytics, Admin Operations, dan Audit Log

Tujuan: membuat masalah produksi dapat ditemukan, ditelusuri, dan dioperasikan tanpa membuka data pribadi.

### Langkah

- [ ] Tambahkan structured logging dengan level, timestamp UTC, request ID, route, status, latency, dan error code.
- [ ] Jangan log JWT, password, reset token, base64 image, signed URL penuh, atau data pribadi yang tidak perlu.
- [ ] Tambahkan error monitoring frontend/backend dengan source map yang dilindungi.
- [ ] Tambahkan health, readiness, database connectivity, storage connectivity, dan build/version endpoint.
- [ ] Definisikan product events: start booth, select frame, permission result, capture complete, edit, export, upload, share, dan failure.
- [ ] Minta consent sesuai kebijakan sebelum analytics non-esensial.
- [ ] Definisikan funnel dan metrik tanpa merekam isi foto.
- [ ] Tambahkan dashboard admin untuk frame, user moderation minimum, storage usage, job failures, dan share abuse.
- [ ] Tambahkan audit trail append-only untuk aksi admin sensitif.
- [ ] Tambahkan alert untuk error rate, latency, upload failure, storage quota, DB failure, dan job backlog.
- [ ] Buat runbook untuk incident auth, data exposure, storage outage, dan corrupt migration.
- [ ] Tentukan backup schedule, restore drill, log retention, dan access control operasional.

### Output Wajib

- Logging/monitoring standard.
- Event taxonomy dan privacy rules.
- Admin operational controls dan audit log.
- Alert/runbook minimum.

### Definition of Done

- [ ] Error pengguna dapat ditelusuri dengan request ID tanpa melihat isi foto.
- [ ] Alert kritis telah diuji.
- [ ] Aksi admin sensitif tercatat dan tidak dapat diedit biasa.
- [ ] Restore drill database/storage berhasil.

---

## TASK 13 - Automated Test, QA, Security, dan Performance Gate

Tujuan: membuktikan seluruh task sebelumnya bekerja bersama dan mencegah regresi.

### Langkah

- [ ] Tambahkan unit test backend untuk validator, auth, ownership, storage adapter, dan share expiry.
- [ ] Tambahkan integration test API dengan database test terisolasi.
- [ ] Tambahkan unit test frontend untuk store, frame metadata parser, API client, dan compositor helpers.
- [ ] Tambahkan component test untuk camera states, frame selection, preview, export dialog, gallery, dan auth form.
- [ ] Tambahkan E2E untuk guest booth, user booth, retake, edit, download, save, share, gallery, revoke, dan delete.
- [ ] Mock camera/media devices secara deterministik untuk CI dan lakukan test perangkat nyata terpisah.
- [ ] Tambahkan golden-image test compositor dan visual regression screenshot pada viewport utama.
- [ ] Tambahkan accessibility test otomatis dan checklist screen reader/keyboard manual.
- [ ] Jalankan dependency audit, secret scan, static analysis, authz test, upload abuse test, rate-limit test, dan security header check.
- [ ] Jalankan performance test untuk startup, frame grid, camera, compositing, upload, gallery besar, dan concurrent API access.
- [ ] Tetapkan budget bundle, LCP, CLS, INP, API p95, upload failure rate, memory, dan asset size.
- [ ] Uji network slow/offline, API restart, storage failure, DB locked/down, expired token, clock skew, dan interrupted upload.
- [ ] Hilangkan flaky test atau dokumentasikan quarantine dengan pemilik dan batas waktu.
- [ ] Pastikan backend dan frontend tidak lagi memiliki dummy/missing test scripts.
- [ ] Buat release test report dengan hasil, bukti, residual risk, dan keputusan go/no-go.

### Output Wajib

- Test suites unit, integration, component, E2E, visual, dan security.
- CI quality gates.
- Performance budget dan hasil ukur.
- Release test report.

### Definition of Done

- [ ] Build, lint, type-check, test, E2E, dan audit lulus di CI bersih.
- [ ] Tidak ada temuan P0/P1 yang belum ditangani atau diterima secara tertulis.
- [ ] Browser/device matrix minimum lulus.
- [ ] Performance berada di bawah budget yang disepakati.

---

## TASK 14 - Deployment, CI/CD, Dokumentasi, Rollback, dan Release

Tujuan: merilis sistem secara aman, dapat dipulihkan, dan dapat dirawat setelah handoff.

### Langkah

- [ ] Pisahkan konfigurasi development, test, staging, dan production.
- [ ] Validasi environment variable saat startup dan hentikan aplikasi bila konfigurasi kritis tidak ada.
- [ ] Pastikan production memakai HTTPS, secure headers, strict CORS, private storage, dan secret manager.
- [ ] Pilih database produksi yang sesuai kebutuhan concurrency dan backup; SQLite hanya dipakai bila batasannya diterima secara sadar.
- [ ] Buat CI berurutan: install locked dependencies, lint, type-check, test, build, migration check, security scan, dan artifact creation.
- [ ] Buat CD staging dengan smoke test sebelum promosi production.
- [ ] Jalankan migration dengan strategi yang kompatibel terhadap versi aplikasi lama selama rollout.
- [ ] Siapkan rollback aplikasi dan database; jangan mengandalkan rollback schema destruktif otomatis.
- [ ] Tambahkan cache/CDN policy untuk frame, thumbnail, static assets, dan signed media.
- [ ] Pastikan generated files, database lokal, uploads, logs, secret, dan backup tidak masuk artifact/repository.
- [ ] Dokumentasikan setup lokal, environment, migration, seed, test, build, deploy, storage, backup, restore, dan incident response.
- [ ] Dokumentasikan data retention, privacy, terms, account deletion, dan contact/support.
- [ ] Jalankan staging rehearsal dengan data sintetis dan simulasi rollback.
- [ ] Jalankan production smoke test: health, auth, frame, camera, export, upload, gallery, share, delete, logging, dan alert.
- [ ] Pantau release awal dan catat post-release issues tanpa langsung menutup proyek.

### Output Wajib

- Pipeline CI/CD.
- Deployment dan rollback runbook.
- Dokumentasi developer/operator/user policy.
- Release checklist dan post-release report.

### Definition of Done

- [ ] Deploy staging dan production dapat diulang dari dokumentasi.
- [ ] Rollback rehearsal berhasil.
- [ ] Migration, backup, monitoring, dan alert tervalidasi.
- [ ] Semua task 0-13 berstatus `DONE` dan release gate menyatakan `GO`.

---

## Checklist Penutupan Setiap Task

Checklist ini wajib diulang pada Task 0 sampai 14.

- [x] Scope task tidak melebar tanpa dicatat.
- [x] Perubahan kode telah direview terhadap risiko keamanan, privasi, dan regresi.
- [x] Build/lint/type-check terkait lulus.
- [x] Unit/integration/E2E yang relevan lulus.
- [x] Pemeriksaan manual acceptance criteria lulus.
- [x] Dokumentasi dan konfigurasi diperbarui.
- [x] Migration/rollback diperiksa bila ada perubahan data.
- [x] Tidak ada secret, database, upload pengguna, atau artifact besar ikut ter-commit.
- [ ] Temuan baru dipindahkan ke task yang tepat.
- [ ] Status, bukti verifikasi, residual risk, dan keputusan lanjut dicatat.

## Format Laporan Progres

Gunakan format berikut setiap selesai sesi pengerjaan:

```text
Task aktif     : TASK N - Nama Task
Status         : PENDING | IN PROGRESS | BLOCKED | DONE
Selesai        : daftar subtask yang sudah selesai
Belum selesai  : daftar subtask tersisa
Verifikasi     : command/test/manual check dan hasilnya
Temuan baru    : risiko/bug baru beserta prioritas
File berubah   : daftar file
Rollback       : cara mengembalikan perubahan sesi ini
Langkah lanjut : satu langkah berikutnya yang spesifik
```

## Gate Mulai Pengerjaan

Pengerjaan kode dimulai dari `TASK 0`. Tidak diperbolehkan langsung melompat ke fitur visual atau animasi sebelum baseline, database, privasi, upload, dan kontrak API memiliki fondasi yang aman.
