# Audit Keseluruhan RIRI Photobooth

**Tanggal audit:** 26 Agustus 2026  
**Status:** STAGING-GO / PRODUCTION-NO-GO  
**Tujuan:** Menilai kesiapan aplikasi untuk usaha photobooth menggunakan iPad dan printer.

## Kesimpulan

Fondasi aplikasi sudah cukup baik untuk MVP dan staging:

- Alur landing → pilih frame → kamera → review sudah tersedia.
- Pelanggan dapat menggunakan booth tanpa login.
- Preview frame muncul dalam dialog saat frame diklik.
- Download lokal, QR, dan tautan berbagi sudah tersedia.
- Validasi upload, akses media privat, JWT, rate limit, dan request ID sudah tersedia.

Aplikasi belum siap untuk operasional berbayar karena sistem printer, pemulihan kegagalan, admin operasional, deployment, dan pengujian perangkat nyata belum selesai.

## Hasil Validasi Kode

| Pemeriksaan | Hasil |
|---|---|
| Backend test | 21 test lulus |
| Prisma validate | Lulus |
| Frontend TypeScript | Lulus |
| Frontend production build | Lulus |
| Backend dependency audit | 0 vulnerability |
| Frontend dependency audit | 0 vulnerability |
| Frontend lint | 0 error, 16 warning |
| Pengujian kamera iPad | Belum dilakukan |
| Pengujian printer nyata | Belum dilakukan |
| E2E frontend photobooth | Belum tersedia |

> Build dan test yang lulus belum membuktikan kamera iPad, Safari, printer, dan jaringan nyata sudah aman untuk operasional.

## Alur Usaha yang Direkomendasikan

```text
Standby
  ↓
Operator menerima pembayaran manual
  ↓
Operator membuka sesi
  ↓
Pilih frame
  ↓
Klik frame → preview dialog
  ↓
Mulai sesi foto
  ↓
Ambil foto 1–N
  ↓
Review dan foto ulang
  ↓
Cetak foto
  ↓
Status printer: berhasil / gagal / coba lagi
  ↓
QR atau download opsional
  ↓
Selesai
  ↓
Reset otomatis ke standby
```

Pembayaran tetap manual dan tidak perlu disimpan di database. Sistem hanya perlu menyediakan kontrol agar sesi baru dimulai setelah operator menerima pembayaran.

## P0 — Wajib Sebelum Launch

### 1. Sistem Print Belum Siap untuk Operasional

Saat ini aplikasi:

- Membuka dialog printer browser melalui `window.print()`.
- Memiliki print bridge opsional yang hanya mengirim POST.
- Menggunakan jumlah copy tetap `1`.
- Belum memiliki print queue.
- Belum memiliki status printer.
- Belum memiliki retry dan reprint.
- Belum mencegah print ganda setelah tombol ditekan kembali.

Bukti: `frontend/src/components/print/PrintPreviewDialog.tsx` dan `frontend/src/lib/printAdapter.ts`.

Yang harus ditambahkan:

- `PrintJob` atau penyimpanan antrean di print bridge.
- Status `queued`, `printing`, `completed`, `failed`, dan `retrying`.
- `jobId`, waktu dibuat, waktu selesai, jumlah copy, ukuran kertas, dan pesan error.
- Tombol `Coba Lagi` dan `Cetak Ulang`.
- Pencegahan duplicate print job.
- Pengujian pada printer yang benar-benar akan digunakan.

### 2. Gate Pembayaran Manual dan Status Sesi

Landing saat ini memungkinkan pelanggan langsung memulai foto. Belum ada kontrol operator setelah pembayaran diterima.

Yang harus ditambahkan:

- Tombol atau PIN operator untuk membuka sesi.
- Harga atau paket yang ditampilkan pada layar standby.
- Layar `Cetak Berhasil`.
- Layar `Cetak Gagal` dengan instruksi operator.
- Tombol `Selesai / Sesi Baru`.
- Reset otomatis setelah sesi selesai.

Pembayaran tidak perlu dicatat sebagai transaksi. Sistem hanya mengontrol izin memulai sesi.

### 3. Definisi Penyimpanan Foto Belum Cukup Jelas

Foto hanya di-upload ke server ketika pelanggan membuat QR. Download lokal dan print tidak menyimpan foto ke server.

Bukti: upload dipanggil dari `handleCreateShareLink` di `frontend/src/components/booth/PhotoPreviewScreen.tsx`.

Akibatnya:

- Download lokal berhasil, tetapi foto tidak muncul di database.
- Print berhasil, tetapi foto tidak muncul di galeri.
- Foto guest yang di-upload tidak muncul di galeri akun karena tidak memiliki `userId`.
- Jika request upload gagal dan dicoba ulang, belum ada idempotency key.

Keputusan yang disarankan:

- Print tidak perlu upload ke cloud.
- QR melakukan upload satu kali.
- Print bridge menyimpan salinan job untuk kebutuhan retry atau reprint.
- Tampilkan status yang jelas: `tersimpan di perangkat`, `terkirim ke printer`, atau `tersimpan online`.
- Tambahkan idempotency key untuk upload dan print job.

### 4. Database, CI, dan Backup Belum Konsisten

Schema utama menggunakan PostgreSQL, tetapi workflow CI masih membuat `ci.db` dan menggunakan URL SQLite.

Bukti:

- `backend/prisma/schema.prisma` menggunakan provider `postgresql`.
- `.github/workflows/ci.yml` menggunakan `DATABASE_URL: file:./ci.db`.
- `scripts/backup.ps1` masih default ke `backend/prisma/dev.db`.

Yang harus dilakukan:

- Pilih satu arsitektur production dan gunakan konsisten.
- Jika PostgreSQL dipilih, gunakan PostgreSQL test database di CI.
- Ubah backup menjadi `pg_dump` dan uji restore.
- Pastikan database dan storage bersifat persisten.
- Dokumentasikan environment staging dan production secara terpisah.

### 5. Admin Belum Menjadi Dashboard Operasional

Admin saat ini hanya memiliki metrics dasar. Belum tersedia:

- Daftar print job hari ini.
- Status printer.
- Retry dan reprint.
- Akses foto guest untuk kebutuhan operator.
- Pengelolaan frame aktif/nonaktif.
- Penghapusan data lama.
- Monitoring error operasional.

Bukti: `backend/src/routes/adminRoutes.js` saat ini hanya menyediakan endpoint metrics.

### 6. Belum Ada Pengujian Perangkat Nyata

Sebelum menerima pelanggan, wajib dilakukan pengujian pada:

- iPad yang akan digunakan.
- Safari versi aktual.
- Kamera depan dan belakang.
- Izin kamera ditolak lalu dicoba kembali.
- Orientasi portrait dan landscape.
- Jaringan lambat dan jaringan terputus.
- Printer yang digunakan di lokasi.
- Print berhasil, batal, offline, dan kertas habis.
- Frame 1, 2, 3, 4, dan 6 slot.
- Minimal 50–100 sesi simulasi.

## P1 — Penting Setelah Fondasi P0

### Kamera dan Capture

- Tangani kamera yang terputus setelah permission diberikan.
- Tambahkan listener `devicechange`.
- Sediakan tombol reload kamera.
- Tampilkan error hardware secara jelas.
- Gunakan `currentFrame.slots` secara langsung di kamera agar tidak bergantung pada pencocokan nama file.
- Uji perbedaan kamera depan dan belakang.

Saat ini metadata kamera masih dicari berdasarkan nama file preview melalui `getFrameMeta`, sehingga lebih rapuh jika URL asset berubah.

### QR dan Download

- Download pada halaman share menggunakan link lintas domain.
- Pada iPad/Safari, atribut `download` lintas domain dapat membuka gambar saja.
- Gunakan download berbasis `Blob` atau endpoint dengan `Content-Disposition: attachment`.
- Tampilkan masa berlaku QR.
- Hindari membuat share link baru berulang kali untuk foto yang sama.

### Auth dan Keamanan Kiosk

- Route `/login`, `/register`, `/gallery`, dan `/account` masih dapat dibuka langsung melalui URL.
- Register masih terbuka untuk umum.
- Token login disimpan di localStorage.
- Jangan menyimpan sesi admin di browser iPad pelanggan.
- Gunakan perangkat operator terpisah atau mode operator dengan PIN.
- Pertimbangkan HttpOnly cookie untuk sesi internal.
- Samakan validasi password frontend dan backend.

### Lifecycle dan Privasi

- Jadwalkan cleanup guest photo secara nyata di production.
- Pastikan cleanup tidak menghapus foto sebelum share link berakhir.
- Tentukan masa simpan foto, audit log, IP, dan user-agent.
- Tambahkan privacy notice sederhana.
- Pertimbangkan menghapus atau mengisi field `originalImageUrl` yang saat ini masih kosong.

### Frame Catalog

- Filter frame berdasarkan `isActive` dan `deletedAt` secara konsisten.
- Endpoint detail frame tidak boleh mengembalikan frame nonaktif.
- Kurangi cache frame yang terlalu panjang jika frame akan dikelola admin.
- Buat admin UI untuk menambah dan mengatur frame.
- Validasi koordinat slot agar selalu berada pada rentang 0–1.

### UI, Accessibility, dan Performance

- Tambahkan focus trap dan restore focus pada dialog.
- Uji tombol fixed agar tidak tertutup toolbar Safari.
- Sediakan portrait dan landscape layout.
- Perbaiki 16 warning penggunaan `<img>` jika tidak mengganggu asset dinamis.
- Kurangi penggunaan base64 pada sesi multi-foto bila memory iPad mulai tinggi.
- Pastikan tombol besar dan mudah disentuh operator/pelanggan.

## P2 — Pengembangan Lanjutan

- Paket foto dan harga.
- Pilihan jumlah copy.
- Pilihan ukuran 4×6 atau strip 2×6.
- Statistik frame yang paling sering digunakan.
- Dashboard bisnis.
- PWA fullscreen dan screen wake lock.
- Dukungan beberapa printer.
- Custom branding per event.
- Kupon dan promo.
- Hapus dependency yang tidak digunakan seperti `fabric` dan `nodemailer`.
- Hapus field database yang tidak akan dipakai seperti password share.

## Yang Dihapus dari Sisi Pelanggan

- Menu Galeri.
- Login dan Register dari navigasi utama.
- Account/Profile.
- Tombol hapus foto pelanggan.
- Side navigation dan bottom navigation umum.

Fungsi galeri backend sebaiknya tetap dipertahankan sampai print queue dan reprint operator tersedia. Saat ini galeri internal juga belum dapat menampilkan foto guest secara operasional.

## Checklist Sebelum Launch

### Alur Pelanggan

- [ ] Pelanggan tidak perlu login.
- [ ] Operator dapat membuka sesi setelah pembayaran manual.
- [ ] Frame dapat dipilih dan preview muncul saat diklik.
- [ ] Semua frame single-slot dan multi-slot sudah diuji.
- [ ] Foto ulang per slot berjalan.
- [ ] Preview hasil sama dengan file final.
- [ ] Sesi baru tidak menampilkan foto pelanggan sebelumnya.

### Printer

- [ ] Printer yang digunakan sudah diuji dengan iPad.
- [ ] Ukuran cetak sudah ditentukan.
- [ ] Jumlah copy sudah ditentukan.
- [ ] Print queue tersedia.
- [ ] Print ganda dicegah.
- [ ] Printer offline memiliki pesan yang jelas.
- [ ] Print gagal dapat dicoba ulang.
- [ ] Operator dapat melakukan reprint.

### QR dan Foto

- [ ] QR hanya dibuat jika pelanggan memilihnya.
- [ ] Upload hanya terjadi satu kali.
- [ ] QR dapat dibuka dari perangkat lain.
- [ ] Download berhasil di iPad/Safari.
- [ ] Masa berlaku QR tampil jelas.
- [ ] Foto guest dibersihkan sesuai retention policy.

### Keamanan dan Deployment

- [ ] Production memakai HTTPS.
- [ ] Production tidak menggunakan localhost.
- [ ] PostgreSQL dan storage production bersifat persisten.
- [ ] CI menggunakan database yang sesuai dengan schema.
- [ ] Backup dan restore sudah diuji.
- [ ] JWT secret production sudah dirotasi dan aman.
- [ ] Route admin terlindungi.
- [ ] Register publik dinonaktifkan atau menggunakan invite.

### Quality Gate

- [ ] Backend test lulus.
- [ ] Prisma validate lulus.
- [ ] Dependency audit lulus.
- [ ] Frontend lint tidak memiliki error.
- [ ] Production build lulus.
- [ ] Smoke test staging lulus.
- [ ] Rollback pernah dilatih.

## Urutan Eksekusi yang Disarankan

1. Tetapkan arsitektur production PostgreSQL dan storage permanen.
2. Perbaiki CI dan backup agar sesuai PostgreSQL.
3. Bangun print queue, print bridge, status, retry, dan anti-duplicate.
4. Tambahkan gate operator untuk pembayaran manual.
5. Tambahkan status cetak berhasil/gagal dan reset sesi.
6. Bangun admin print job dan reprint guest.
7. Uji seluruh alur pada iPad dan printer nyata.
8. Jalankan minimal 50–100 sesi simulasi.
9. Baru lanjutkan P1 dan P2 seperti PWA, statistik, dan polish UI.

## Keputusan yang Dipertahankan

- Pembayaran dilakukan manual.
- Pembayaran tidak dicatat di database.
- Galeri tidak ditampilkan kepada pelanggan.
- QR/download bersifat opsional.
- Foto yang hanya dicetak tidak wajib disimpan ke cloud.
- Admin dan galeri internal dipertahankan untuk kebutuhan operasional.
