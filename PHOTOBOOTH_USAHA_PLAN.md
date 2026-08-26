# Rencana Perubahan Website Photobooth untuk Usaha

Dokumen ini berisi perubahan yang diperlukan agar website dapat digunakan sebagai kiosk photobooth menggunakan iPad dan printer.

## Tujuan Utama

- Pelanggan dapat menggunakan booth tanpa login.
- Proses foto sampai cetak berlangsung cepat dan jelas.
- Foto tidak gagal tersimpan karena masalah akun atau token.
- Operator dapat menangani printer offline, gagal cetak, dan reprint.
- Sesi pelanggan sebelumnya tidak terlihat oleh pelanggan berikutnya.

## Alur Utama yang Direkomendasikan

```text
Layar Standby
    ↓
Mulai Foto / Operator Unlock
    ↓
Pilih Paket dan Frame
    ↓
Ambil Foto 1–N
    ↓
Review dan Foto Ulang
    ↓
Pilih Output
    ├── Cetak Foto
    ├── Buat QR / Download (opsional)
    └── Foto Ulang
    ↓
Status Cetak
    ↓
Sesi Selesai
    ↓
Reset Otomatis ke Layar Standby
```

## Yang Tetap Dipertahankan

- Landing screen.
- Pemilihan frame.
- Akses kamera iPad.
- Countdown 3 detik.
- Pengambilan single-shot dan multi-shot.
- Foto ulang per slot.
- Preview hasil foto.
- Edit sederhana: brightness, contrast, dan saturation.
- QR/download sebagai fitur tambahan.
- Admin untuk mengelola frame dan melihat status operasional.

## Yang Perlu Diperbaiki

### 1. Alur Simpan Foto

- Pisahkan status berikut:
  - Tersimpan sementara di perangkat.
  - Tersimpan untuk dicetak.
  - Tersimpan online.
  - QR berhasil dibuat.
- Jangan menjadikan pembuatan QR sebagai satu-satunya cara menyimpan foto ke server.
- Foto yang hanya akan dicetak tidak perlu di-upload ke cloud.
- Jika pelanggan memilih QR, lakukan upload satu kali dan gunakan kembali `photoId` saat membuat share link.
- Jangan upload ulang foto jika pembuatan QR gagal.
- Tambahkan idempotency key untuk mencegah foto atau print job ganda.

### 2. Autentikasi

- Hilangkan kewajiban login dari alur pelanggan.
- Sediakan mode guest untuk mengambil dan mencetak foto.
- Jika token login tidak valid, tampilkan pesan yang jelas dan jangan diam-diam menyimpan foto sebagai guest.
- Validasi token sebelum membuka halaman admin atau galeri internal.
- Tangani status `401 Unauthorized` dengan logout otomatis dan arahan login ulang.

### 3. Export dan Kualitas File

- Pastikan file PNG benar-benar memiliki format PNG.
- Pastikan file JPG benar-benar memiliki format JPEG.
- Jangan menggunakan ekstensi `.png` untuk file WebP.
- Tetapkan preset output, minimal:
  - Strip 2×6 inch.
  - Foto 4×6 inch.
  - Square 4×4 inch jika diperlukan.
- Tetapkan ukuran pixel output berdasarkan ukuran cetak.
- Tentukan safe area, margin, bleed, dan kualitas JPEG.
- Kompres foto sebelum upload agar tidak melewati batas ukuran file.
- Gunakan `Blob` atau object URL jika memungkinkan agar penggunaan memory iPad lebih rendah.

### 4. Frame dan Compositing

- Gunakan `frame.slots` langsung dari data frame, bukan mencari metadata berdasarkan nama file preview.
- Pastikan preview dan hasil final menggunakan koordinat slot yang sama.
- Dukung rotasi dan z-index slot jika frame membutuhkannya.
- Gunakan rasio asli frame pada preview, bukan selalu `3/4`.
- Uji semua frame dengan jumlah slot 1, 2, 3, 4, dan 6.
- Tambahkan kategori frame secara dinamis dari API, bukan hard-coded.

### 5. Sesi Kiosk

- Tambahkan tombol `Sesi Baru`.
- Reset foto, edit, frame, status print, dan share token setelah sesi selesai.
- Tambahkan reset otomatis setelah tidak ada aktivitas selama 30–60 detik.
- Hentikan camera stream setelah sesi selesai.
- Jangan menampilkan foto pelanggan sebelumnya pada sesi baru.
- Tambahkan layar standby dengan logo, harga, dan instruksi singkat.
- Sediakan mode operator yang dilindungi PIN untuk pengaturan dan reprint.
- Nonaktifkan atau sembunyikan navigasi umum pada mode kiosk.

### 6. Penanganan Error

- Tampilkan pesan jika kamera ditolak atau kamera terputus.
- Tampilkan pesan jika jaringan terputus.
- Tampilkan pesan jika file terlalu besar.
- Tangani error `401`, `403`, `413`, dan `500` secara berbeda.
- Tampilkan request ID atau kode error kepada operator untuk troubleshooting.
- Disable tombol selama proses upload, print, dan delete berlangsung.
- Cegah double-click pada tombol cetak dan hapus.

### 7. Database dan Storage

- Pilih satu database production dan samakan seluruh konfigurasi.
- Saat ini schema menggunakan PostgreSQL, sedangkan beberapa dokumentasi dan script backup masih mengarah ke SQLite.
- Gunakan PostgreSQL production jika memakai deployment cloud atau beberapa instance backend.
- Gunakan storage object seperti Supabase Storage untuk foto online.
- Buat retention policy untuk foto guest, misalnya dihapus otomatis setelah 24 jam atau 7 hari.
- Pastikan proses cleanup juga menghapus file dari Supabase, bukan hanya file lokal.
- Simpan metadata print job secara terpisah dari galeri pelanggan.

## Yang Perlu Ditambahkan

### 1. Fitur Print

- Tombol utama `CETAK FOTO` pada halaman review.
- Pilihan jumlah copy.
- Pilihan ukuran cetak jika memiliki lebih dari satu ukuran.
- Preview print sebelum dikirim.
- Status print:
  - Menyiapkan file.
  - Menunggu printer.
  - Sedang mencetak.
  - Berhasil.
  - Gagal.
- Tombol `Coba Lagi`.
- Tombol `Cetak Ulang` untuk operator.
- Pencegahan duplicate print job.

### 2. Print Queue

Print queue minimal memiliki data:

```text
jobId
sessionId
photoId atau localFileId
printerId
printSize
copyCount
status
errorMessage
createdAt
completedAt
```

Status yang disarankan:

```text
queued → printing → completed
                  ↘ failed → retrying
```

### 3. Print Bridge

Untuk penggunaan usaha, arsitektur yang disarankan:

```text
iPad Browser / PWA
        ↓ Wi-Fi lokal
Print Bridge di Mini PC atau Raspberry Pi
        ↓ USB / Network
Printer Foto
```

Print bridge bertugas untuk:

- Menyimpan antrean print.
- Mengirim file ke printer.
- Membaca status printer.
- Melakukan retry ketika printer offline.
- Mencegah pekerjaan tercetak dua kali.
- Menyediakan reprint untuk operator.

Jangan mengandalkan koneksi USB atau Bluetooth langsung dari browser iPad untuk proses otomatis.

### 4. Mode QR dan Download Opsional

- QR tidak wajib untuk mencetak.
- Buat QR hanya jika pelanggan memintanya.
- QR dapat berisi link download tanpa akun.
- Tampilkan masa berlaku link, misalnya 24 jam atau 7 hari.
- Sediakan tombol salin link jika native share tidak tersedia.

### 5. Pembayaran Manual (Keputusan Implementasi)

- Pembayaran dilakukan langsung kepada operator.
- Website tidak menampilkan checkout, status pembayaran, kode transaksi, atau nominal pembayaran.
- Website tidak menyimpan data pembayaran apa pun.
- Operator memulai atau mengizinkan sesi sesuai pembayaran yang diterima.

### 6. Admin Operasional

- Daftar print job hari ini.
- Status printer.
- Tombol retry dan reprint.
- Jumlah sesi.
- Jumlah foto tercetak.
- Frame yang paling sering digunakan.
- Pengaturan harga dan jumlah copy.
- Pengelolaan frame aktif/nonaktif.
- Penghapusan foto dan data lama.

## Yang Dihapus dari Tampilan Pelanggan

- Login dan register dari alur utama.
- Menu Galeri pelanggan.
- Menu Account/Profile.
- Tombol hapus foto pelanggan.
- Side navigation dan bottom navigation umum.
- Tombol `Simpan & Bagikan` yang menggabungkan terlalu banyak fungsi.

Sebagai gantinya, tampilkan tombol yang jelas:

```text
[ CETAK FOTO ]
[ BUAT QR / DOWNLOAD ]
[ FOTO ULANG ]
[ SELESAI / SESI BARU ]
```

## Galeri: Dihapus atau Dipertahankan?

Rekomendasi:

- Hapus menu Galeri dari tampilan pelanggan.
- Jangan langsung menghapus seluruh fungsi galeri dari backend.
- Pertahankan galeri sebagai fitur internal admin jika masih diperlukan untuk reprint dan troubleshooting.
- Foto guest yang tidak memilih QR tidak perlu masuk galeri pelanggan.
- Hapus foto guest secara otomatis berdasarkan retention policy.

## Acceptance Checklist Sebelum Digunakan Berbayar

- [ ] Pelanggan dapat menyelesaikan sesi tanpa login.
- [ ] Kamera iPad dapat digunakan melalui HTTPS.
- [ ] Semua frame multi-slot menghasilkan jumlah foto yang benar.
- [ ] Foto ulang per slot bekerja.
- [ ] Preview sama dengan hasil final.
- [ ] File PNG dan JPG memiliki MIME type yang benar.
- [ ] Tombol cetak hanya menghasilkan satu print job.
- [ ] Printer offline menampilkan status yang jelas.
- [ ] Print job gagal dapat diulang.
- [ ] Reprint dapat dilakukan oleh operator.
- [ ] Sesi baru tidak menampilkan foto pelanggan sebelumnya.
- [ ] QR bersifat opsional dan tidak menghambat proses cetak.
- [ ] Foto guest memiliki masa berlaku dan cleanup otomatis.
- [ ] Login admin dan endpoint admin tetap terlindungi.
- [ ] Pengujian minimal dilakukan pada 50–100 sesi simulasi.

## Prioritas Implementasi

### P0 — Wajib Sebelum Launch

1. Mode guest tanpa login.
2. Tombol dan alur print.
3. Print queue dan pencegahan duplicate print.
4. Reset sesi dan reset otomatis.
5. Perbaikan token `401` dan error handling.
6. Perbaikan format PNG/JPG.
7. Penyamaan konfigurasi database dan storage.

### P1 — Setelah MVP Berjalan

1. Print bridge yang lebih lengkap.
2. Reprint dari admin.
3. Paket dan jumlah copy.
4. QR/download opsional.
5. Retention policy dan cleanup cloud.
6. Monitoring printer dan dashboard operasional.

### P2 — Pengembangan Lanjutan

1. Pembayaran otomatis.
2. Statistik bisnis.
3. Custom branding per event.
4. Kupon dan promo.
5. Multiple printer atau multiple booth.
